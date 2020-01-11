pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./PeggedToken.sol";
import "./System.sol";
import "./SystemFeeds.sol";
import "./Loan.sol";

contract SystemLoans {
    System public system;
    PeggedToken public peggedToken;
    SystemFeeds public systemFeeds;

    constructor(
        address _peggedTokenAddress,
        address _systemAddress,
        address _systemFeedsAddress
    ) public {
        require(_peggedTokenAddress != address(0), "_peggedTokenAddress should not be 0");
        require(_systemAddress != address(0), "_systemAddress should not be 0");
        require(_systemFeedsAddress != address(0), "_systemFeedsAddress should not be 0");
        peggedToken = PeggedToken(_peggedTokenAddress);
        system = System(_systemAddress);
        systemFeeds = SystemFeeds(_systemFeedsAddress);
    }

    uint256 public loan_ratio; // 1.0 = 10 ** 9 | if const 150% - normal range 120%-170% - down as stability period increases
    uint256 public loan_fee; // 1.0 = 10 ** 9 | normal range 2%-20% - Up when pegged>reference - down when pegged<reference

    uint256 constant public PRICE_RATE_DECIMALS = 10;

    uint32 constant public LOAN_MAX_ALLOCATIONS = 5; // Maximum loan price feed allocations
    uint32 constant public LOAN_ALLOCATION_100_PERCENT = 100; // Loan allocation percent value at 100% = 1024
    uint32 constant public LOAN_LEVERAGE_THRESHOLD_PERCENT = 150;
    uint256 public depositTotal;
    uint256 public issuanceTotal;
    address public lastNewAddress;
    mapping (address => bool) public loanMap;

    function createLoan() public returns(address) {
        Loan newLoan = new Loan(msg.sender, address(system), address(peggedToken));
        lastNewAddress = address(newLoan);
        loanMap[lastNewAddress] = true;
        return lastNewAddress;
    }

    function changeDepositEth(
        uint256 _oldDepositValue,
        uint256 _newDepositValue,
        uint256 _currentIssuance,
        Loan.PriceFeedAllocation[LOAN_MAX_ALLOCATIONS] memory _priceFeedAllocations
    )
    public
    {
        require(loanMap[msg.sender], "sender should be loan contract");

        for (uint i = 0; i < LOAN_MAX_ALLOCATIONS - 1; i++) {
            if(_priceFeedAllocations[i].isAllocation)
            {
                require(systemFeeds.isPriceFeed(_priceFeedAllocations[i].priceFeedAddress), "allocation address must be valid price feed");//.isPriceFeed, "Used price feed should have a valid address.");
                //require(map[_priceFeedAllocations[i].priceFeedAddress].isPriceFeed, "");//.isPriceFeed, "Used price feed should have a valid address.");
                address priceFeedAddress = _priceFeedAllocations[i].priceFeedAddress;
                uint32 percentAllocation = _priceFeedAllocations[i].percentAllocation;
                systemFeeds.decrementPriceFeedAllocation(priceFeedAddress, (percentAllocation * _oldDepositValue) / LOAN_ALLOCATION_100_PERCENT);
                systemFeeds.incrementPriceFeedAllocation(priceFeedAddress, (percentAllocation * _newDepositValue) / LOAN_ALLOCATION_100_PERCENT);
            }
        }

        uint256 rate = systemFeeds.getInstantRate();
        require(_currentIssuance * 150 * 10 ** PRICE_RATE_DECIMALS <= _newDepositValue * rate * 100, "withdrawal should not exceed threshold");

        depositTotal += _newDepositValue;
        depositTotal -= _oldDepositValue;
    }

    function changeAllocation(
        Loan.PriceFeedAllocation[LOAN_MAX_ALLOCATIONS] memory _oldPriceFeedAllocations,
        Loan.PriceFeedAllocation[LOAN_MAX_ALLOCATIONS] memory _newPriceFeedAllocations,
        uint256 _currentDepositValue
    )
    public
    {
        for (uint i = 0; i < LOAN_MAX_ALLOCATIONS - 1; i++) {
            if(_oldPriceFeedAllocations[i].isAllocation)
            {
                require(systemFeeds.isPriceFeed(_oldPriceFeedAllocations[i].priceFeedAddress), "allocation address must be valid price feed");//.isPriceFeed, "Used price feed should have a valid address.");
                //require(systemFeeds.map[_oldPriceFeedAllocations[i].priceFeedAddress].isPriceFeed, "De-allocated price feed should have a valid address.");
                address priceFeedAddress = _oldPriceFeedAllocations[i].priceFeedAddress;
                uint32 percentAllocation = _oldPriceFeedAllocations[i].percentAllocation;
                systemFeeds.decrementPriceFeedAllocation(priceFeedAddress, (percentAllocation * _currentDepositValue) / LOAN_ALLOCATION_100_PERCENT);
            }

            if(_newPriceFeedAllocations[i].isAllocation)
            {
                require(systemFeeds.isPriceFeed(_newPriceFeedAllocations[i].priceFeedAddress), "allocation address must be valid price feed");//.isPriceFeed, "Used price feed should have a valid address.");
                //require(systemFeeds.map[_newPriceFeedAllocations[i].priceFeedAddress].isPriceFeed, "Allocated price feed should have a valid address.");
                address priceFeedAddress = _newPriceFeedAllocations[i].priceFeedAddress;
                uint32 percentAllocation = _newPriceFeedAllocations[i].percentAllocation;
                systemFeeds.incrementPriceFeedAllocation(priceFeedAddress, (percentAllocation * _currentDepositValue) / LOAN_ALLOCATION_100_PERCENT);
           }
        }
    }

    function issueCurrency(uint256 currentIssuance, uint256 _issuanceValue, uint256 ethBalance) public {
        require(loanMap[msg.sender], "sender should be loan contract");
        uint256 totalIssuance = currentIssuance + _issuanceValue;
        uint256 pegPerEthRate = systemFeeds.getInstantRate();

        require(totalIssuance * 150 * 10 ** PRICE_RATE_DECIMALS <= ethBalance * pegPerEthRate * 100, "issuance should not exceed threshold");

        peggedToken.mint(msg.sender, _issuanceValue);

        issuanceTotal += _issuanceValue;
    }

    function returnCurrency(uint256 currentIssuance, uint256 _reverseIssuanceValue, uint256 ethBalance) public {
        require(loanMap[msg.sender], "sender should be valid loan contract");
        require(currentIssuance >= _reverseIssuanceValue, "cannot reverse more than current issuance");

        uint256 totalIssuance = currentIssuance - _reverseIssuanceValue;
        uint256 pegPerEthRate = systemFeeds.getInstantRate();

        require(totalIssuance * 150 * 10 ** PRICE_RATE_DECIMALS <= ethBalance * pegPerEthRate * 100, "issuance should not exceed threshold");

        peggedToken.burn(msg.sender, _reverseIssuanceValue);

        issuanceTotal -= _reverseIssuanceValue;
    }

    // function withdrawEth(uint256 currentIssuance, uint256 _withdrawValue, uint256 ethBalance) public {
    //     require(loanMap[msg.sender], "sender should be valid loan contract");
    //     require(ethBalance >= _withdrawValue, "cannot withdraw more than current balance");

    //     uint256 rate = systemFeeds.getInstantRate();
    //     uint256 netEthBalance = ethBalance - _withdrawValue;

    //     require(currentIssuance * 150 * 10 ** PRICE_RATE_DECIMALS <= netEthBalance * rate * 100, "withdrawal should not exceed threshold");

    //     depositTotal -= _withdrawValue;
    // }

    function withdrawCurrency(address _withdrawToAddress, uint256 _withdrawValue) public {
        require(loanMap[msg.sender], "sender should be valid loan contract");
    }
}