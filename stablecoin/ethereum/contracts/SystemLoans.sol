pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./PeggedToken.sol";
import "./System.sol";
import "./SystemFeeds.sol";
import "./SystemSavings.sol";
import "./Loan.sol";
import "./LiquidatorAccount.sol";

contract SystemLoans {
    System public system;
    PeggedToken public peggedToken;
    SystemFeeds public systemFeeds;
    SystemSavings public systemSavings;

    constructor(
        address _peggedTokenAddress,
        address _systemAddress,
        address _systemFeedsAddress,
        address _systemSavingsAddress
    ) public {
        require(_peggedTokenAddress != address(0), "_peggedTokenAddress should not be 0");
        require(_systemAddress != address(0), "_systemAddress should not be 0");
        require(_systemFeedsAddress != address(0), "_systemFeedsAddress should not be 0");
        require(_systemSavingsAddress != address(0), "_systemSavingsAddress should not be 0");
        peggedToken = PeggedToken(_peggedTokenAddress);
        system = System(_systemAddress);
        systemFeeds = SystemFeeds(_systemFeedsAddress);
        systemSavings = SystemSavings(_systemSavingsAddress);
    }

    uint256 public loan_ratio; // 1.0 = 10 ** 9 | if const 150% - normal range 120%-170% - down as stability period increases
    uint256 public loan_fee; // 1.0 = 10 ** 9 | normal range 2%-20% - Up when pegged>reference - down when pegged<reference

    uint256 constant public PRICE_DECIMALS = 18;

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

        (System.InstantPriceReportingState instantPriceState, uint256 price) = system.getInstantPrice();
        if(System.InstantPriceReportingState.Empty == instantPriceState) {
            (System .DelayedPriceReportingState historicalPriceState, uint256 historicalPrice) = system.getDelayedPrice();
            if(System .DelayedPriceReportingState.Empty == historicalPriceState) {
                price = systemFeeds.getPriceFromAllocation(_priceFeedAllocations);
            } else {
                price = historicalPrice;
            }
        }
        require(_currentIssuance * 150 * 10 ** PRICE_DECIMALS <= _newDepositValue * price * 100, "withdrawal should not exceed threshold");

        depositTotal += _newDepositValue;
        depositTotal -= _oldDepositValue;
    }

    function changeAllocation(
        Loan.PriceFeedAllocation[LOAN_MAX_ALLOCATIONS] memory _oldPriceFeedAllocations,
        Loan.PriceFeedAllocation[LOAN_MAX_ALLOCATIONS] memory _newPriceFeedAllocations,
        uint256 _currentIssuance
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
                systemFeeds.changePriceFeedAllocation(priceFeedAddress, (percentAllocation * _currentIssuance) / LOAN_ALLOCATION_100_PERCENT, true);
            }

            if(_newPriceFeedAllocations[i].isAllocation)
            {
                require(systemFeeds.isPriceFeed(_newPriceFeedAllocations[i].priceFeedAddress), "allocation address must be valid price feed");//.isPriceFeed, "Used price feed should have a valid address.");
                //require(systemFeeds.map[_newPriceFeedAllocations[i].priceFeedAddress].isPriceFeed, "Allocated price feed should have a valid address.");
                address priceFeedAddress = _newPriceFeedAllocations[i].priceFeedAddress;
                uint32 percentAllocation = _newPriceFeedAllocations[i].percentAllocation;
                systemFeeds.changePriceFeedAllocation(priceFeedAddress, (percentAllocation * _currentIssuance) / LOAN_ALLOCATION_100_PERCENT, false);
           }
        }
    }

   function changeCurrencyIssuance
   (
       uint256 _currentIssuance,
       uint256 _newIssuance,
       uint256 ethBalance,
       Loan.PriceFeedAllocation[5] memory _priceFeedAllocations,
       bool isReturn
    )
    public
    {
        require(loanMap[msg.sender], "sender should be loan contract");

        (System.InstantPriceReportingState instantPriceReportingState, uint256 price) = system.getInstantPrice();
        emit ConsoleLog(">SystemLoans.changeCurrencyIssuance instantPriceReportingState");
        emit ConsoleLogNumber(uint256(instantPriceReportingState));

        if(System.InstantPriceReportingState.Empty == instantPriceReportingState || System.InstantPriceReportingState.Dispute == instantPriceReportingState) {
            (System.DelayedPriceReportingState historicalPriceState, uint256 historicalPrice) = system.getDelayedPrice();
            if(System.DelayedPriceReportingState.Empty == historicalPriceState || System.DelayedPriceReportingState.Dispute == historicalPriceState) {
                price = systemFeeds.getPriceFromAllocation(_priceFeedAllocations);
            } else {
                price = historicalPrice;
            }
        }

        emit ConsoleLog(">SystemLoans.changeCurrencyIssuance price _newIssuance ethBalance");
        emit ConsoleLogNumber(price);
        emit ConsoleLogNumber(_newIssuance);
        emit ConsoleLogNumber(ethBalance);

        require(price != 0, "ETH price cannot be 0");
        require(_newIssuance * 150 * 10 ** PRICE_DECIMALS <= ethBalance * price * 100, "issuance should not exceed threshold");

        for (uint i = 0; i < LOAN_MAX_ALLOCATIONS - 1; i++) {
            if(_priceFeedAllocations[i].isAllocation)
            {
                require(systemFeeds.isPriceFeed(_priceFeedAllocations[i].priceFeedAddress), "allocation address must be valid price feed");//.isPriceFeed, "Used price feed should have a valid address.");
                address priceFeedAddress = _priceFeedAllocations[i].priceFeedAddress;
                uint32 percentAllocation = _priceFeedAllocations[i].percentAllocation;
                systemFeeds.changePriceFeedAllocation(priceFeedAddress, (percentAllocation * _currentIssuance) / LOAN_ALLOCATION_100_PERCENT, true);
                systemFeeds.changePriceFeedAllocation(priceFeedAddress, (percentAllocation * _newIssuance) / LOAN_ALLOCATION_100_PERCENT, false);
            }
        }

        if(isReturn) {
            require(_currentIssuance > _newIssuance, "return currrency operation should reduce issuance");
            peggedToken.burn(msg.sender, _currentIssuance - _newIssuance);
        } else {
            require(_newIssuance > _currentIssuance, "issue currrency operation should increase issuance");
            peggedToken.mint(msg.sender, _newIssuance - _currentIssuance);
        }

        issuanceTotal -= _currentIssuance;
        issuanceTotal += _newIssuance;
    }

    function withdrawCurrency(address _withdrawToAddress, uint256 _withdrawValue) public {
        require(loanMap[msg.sender], "sender should be valid loan contract");
    }

    function payLoanFee(uint256 _feeValue, Loan.PriceFeedAllocation[LOAN_MAX_ALLOCATIONS] memory _priceFeedAllocations, uint256 _feedRevenue) public {
        require(loanMap[msg.sender], "sender should be valid loan contract");

        emit ConsoleLog(">SystemLoans.payLoanFee _feeValue");
        emit ConsoleLogNumber(_feeValue);

        uint remainingFeeValue = _feeValue;
        for (uint i = 0; i < LOAN_MAX_ALLOCATIONS - 1; i++) {
            if(_priceFeedAllocations[i].isAllocation) {
                if(_priceFeedAllocations[i].percentAllocation != 0) {
                    require(systemFeeds.isPriceFeed(_priceFeedAllocations[i].priceFeedAddress), "allocation address must be valid price feed");
                    address priceFeedAddress = _priceFeedAllocations[i].priceFeedAddress;
                    uint32 percentAllocation = _priceFeedAllocations[i].percentAllocation;
                    uint256 feeAllocationValue = _feedRevenue * percentAllocation / 100;
                    remainingFeeValue -= feeAllocationValue;

                    emit ConsoleLog(">SystemLoans.payLoanFee i feeAllocationValue");
                    emit ConsoleLogNumber(i);
                    emit ConsoleLogNumber(feeAllocationValue);

                    peggedToken.transfer(address(systemFeeds), feeAllocationValue);
                    systemFeeds.registerFeedRevenueTransfer(priceFeedAddress, feeAllocationValue);
                }
            }
        }

        emit ConsoleLog(">SystemLoans.payLoanFee remainingFeeValue");
        emit ConsoleLogNumber(remainingFeeValue);

        peggedToken.transfer(address(systemSavings), remainingFeeValue);
        systemSavings.registerSavingsPoolTransfer(remainingFeeValue);
    }

    event ConsoleLog(string message);
    event ConsoleLogNumber(uint number);
}