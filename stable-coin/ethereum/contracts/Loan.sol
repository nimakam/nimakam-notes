pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./System.sol";
import "./SystemLoans.sol";
import "./PeggedToken.sol";

/// @author Nima Kamoosi
/// @title Loan contract of the \{\{PegLoan\}\} currency peg system
/// @notice The Loan contract holds the state of a given loan, as part of the \{\{PegLoan\}\} currency peg system.
/// It works alongside the System, PriceFeed, and PeggedCurrency contracts to make the whole system function.
/// @dev The contained state includes the contract owner, ETH deposit balance the issued currency balance, the currency balance,
/// price feed allocations, last date of fee payments and any pending liquidation requests.
contract Loan {
    address public owner; // Loan owner account or contract
    System public system; // The main system contract instance
    SystemLoans public systemLoans; // The main system loans contract instance
    PeggedToken public peggedToken; // The main pegged token contract instance

    uint32 constant public MAX_ALLOCATIONS = 5; // Maximum price feed allocations
    uint32 constant public ALLOCATION_100_PERCENT = 100; // Allocation percent value at 100% = 100
    uint32 constant SECONDS_PER_DAY = 86400; // SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY = 60 * 60 * 24
    uint256 public currentIssuance;
    uint256 public lastChangeTime;

    PriceFeedAllocation[MAX_ALLOCATIONS] public priceFeedAllocations;
    bool public isPriceFeedAllocated;
    struct PriceFeedAllocation {
        address priceFeedAddress;
        uint32 percentAllocation;
        bool isAllocation;
    }

    /// Constructor
    /// @param _owner is owner of the loan and is set at time of creation
    /// @dev creats the loan instnace, sets its owner, and assigns the main system contract instance
    constructor(
        address _owner,
        address _systemAddress,
        address _peggedTokenAddress
    ) public {
        owner = _owner;
        systemLoans = SystemLoans(msg.sender);
        system = System(_systemAddress);
        peggedToken = PeggedToken(_peggedTokenAddress);
    }

    function depositEth() public payable {
        require(owner == msg.sender, "sender should be owner");
        require(isPriceFeedAllocated, "price feed allocations should be initialized");

        emit ConsoleLog("depositEth address(this).balance msg.value");
        emit ConsoleLogNumber(address(this).balance);
        emit ConsoleLogNumber(msg.value);

        systemLoans.changeDepositEth(address(this).balance - msg.value, address(this).balance, currentIssuance, priceFeedAllocations);
    }

    function allocatePriceFeeds(
        PriceFeedAllocation[MAX_ALLOCATIONS] memory newPriceFeedAllocations
    )
    public
    {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog(">Loan.allocatePriceFeeds currentIssuance");
        emit ConsoleLogNumber(currentIssuance);

        systemLoans.changeAllocation(priceFeedAllocations, newPriceFeedAllocations, currentIssuance);

        isPriceFeedAllocated = true;
        uint32 percentAllocationSum = 0;
        for (uint i = 0; i < MAX_ALLOCATIONS - 1; i++) {
            if(newPriceFeedAllocations[i].isAllocation)
            {
                percentAllocationSum += newPriceFeedAllocations[i].percentAllocation;
                require(percentAllocationSum <= ALLOCATION_100_PERCENT, "Sum of new allocation percents should be 100%");
                priceFeedAllocations[i] = newPriceFeedAllocations[i];
            }
            else
            {
                delete priceFeedAllocations[i];
            }
        }
        require(percentAllocationSum == ALLOCATION_100_PERCENT, "Sum of new allocation percents should be 100%");
    }

    function issueCurrency(uint256 _issuanceValue) public {
        require(owner == msg.sender, "sender should be owner");
        changeCurrencyIssuance(currentIssuance + _issuanceValue, false);
    }

    uint256 constant public PRICE_DECIMALS = 18;

    function returnCurrency(uint256 _returnValue) public {
        require(owner == msg.sender, "sender should be owner");
        changeCurrencyIssuance(currentIssuance - _returnValue, true);
    }

    function changeCurrencyIssuance(uint256 _newCurrencyIssuance, bool _isReturn) private {
        setCallTime();

        uint daysSinceLastChange = (callTime - lastChangeTime) / SECONDS_PER_DAY;
        uint loanFeeSinceLastChange = currentIssuance * daysSinceLastChange * system.getLoanFeeRate() / 365 / 10 ** PRICE_DECIMALS;
        uint feedRevenueSinceLastChange = currentIssuance * daysSinceLastChange * system.getFeedRevenueRate() / 365 / 10 ** PRICE_DECIMALS;

        systemLoans.changeCurrencyIssuance(currentIssuance, _newCurrencyIssuance, address(this).balance, priceFeedAllocations, _isReturn);

        peggedToken.transfer(address(systemLoans), loanFeeSinceLastChange);
        systemLoans.payLoanFee(loanFeeSinceLastChange, priceFeedAllocations, feedRevenueSinceLastChange);

        currentIssuance = _newCurrencyIssuance;

        lastChangeTime = callTime;
    }

    function withdrawEth(address payable _withdrawToAddress, uint256 _withdrawValue) public {
        require(owner == msg.sender, "sender should be owner");

        systemLoans.changeDepositEth(address(this).balance, address(this).balance - _withdrawValue, currentIssuance, priceFeedAllocations);

        _withdrawToAddress.transfer(_withdrawValue);
    }

    function withdrawCurrency(address _withdrawToAddress, uint256 _withdrawValue) public {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog(">withdrawCurrency _withdrawValue");
        //emit ConsoleLog(">withdrawCurrency _withdrawToAddress _withdrawValue");
        //emit ConsoleLogNumber(_withdrawToAddress);
        emit ConsoleLogNumber(_withdrawValue);

        peggedToken.transfer(_withdrawToAddress, _withdrawValue);

        systemLoans.withdrawCurrency(_withdrawToAddress, _withdrawValue);
    }

    function requestLiquidation(uint256 _liquidationDeposit) public {
        emit ConsoleLog(">Loan.requestLiquidation _liquidationDeposit");
        emit ConsoleLogNumber(_liquidationDeposit);
    }

    function processLiquidations() public {
        emit ConsoleLog(">Loan.processLiquidations");
    }

    uint256 public callTime;
    function setCallTime() private
    {
        callTime = block.timestamp;
    }

    event ConsoleLog(string message);
    event ConsoleLogNumber(uint number);
}