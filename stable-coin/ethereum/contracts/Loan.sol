pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./System.sol";
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
    SystemLoans public systemLoans; // The main system contract instance
    PeggedToken public peggedToken; // The main system contract instance

    uint32 constant public MAX_ALLOCATIONS = 5; // Maximum price feed allocations
    uint32 constant public ALLOCATION_100_PERCENT = 100; // Allocation percent value at 100% = 100
    uint256 public currentIssuance;

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
        emit ConsoleLog(uint2str(address(this).balance));
        emit ConsoleLog(uint2str(msg.value));

        systemLoans.changeDepositEth(address(this).balance - msg.value, address(this).balance, currentIssuance, priceFeedAllocations);
    }

    function allocatePriceFeeds(
        PriceFeedAllocation[MAX_ALLOCATIONS] memory newPriceFeedAllocations
    )
    public
    {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog(">allocatePriceFeeds loan balance");
        emit ConsoleLog(uint2str(address(this).balance));

        systemLoans.changeAllocation(priceFeedAllocations, newPriceFeedAllocations, address(this).balance);

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

        emit ConsoleLog(">issueCurrency currentIssuance _issuanceValue address(this).balance");
        emit ConsoleLog(uint2str(currentIssuance));
        emit ConsoleLog(uint2str(_issuanceValue));
        emit ConsoleLog(uint2str(address(this).balance));

        systemLoans.issueCurrency(currentIssuance, _issuanceValue, address(this).balance);

        currentIssuance += _issuanceValue;
    }

    function returnCurrency(uint256 _reverseIssuanceValue) public {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog(">returnCurrency _reverseIssuanceValue");
        emit ConsoleLog(uint2str(_reverseIssuanceValue));

        systemLoans.returnCurrency(currentIssuance, _reverseIssuanceValue, address(this).balance);

        currentIssuance -= _reverseIssuanceValue;
    }

    function withdrawEth(address payable _withdrawToAddress, uint256 _withdrawValue) public {
        require(owner == msg.sender, "sender should be owner");

        //systemLoans.withdrawEth(currentIssuance, _withdrawValue, address(this).balance);
        systemLoans.changeDepositEth(address(this).balance, address(this).balance - _withdrawValue, currentIssuance, priceFeedAllocations);

        _withdrawToAddress.transfer(_withdrawValue);
    }

    function withdrawCurrency(address _withdrawToAddress, uint256 _withdrawValue) public {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog(">withdrawCurrency _withdrawToAddress _withdrawValue");
        emit ConsoleLog(add2str(_withdrawToAddress));
        emit ConsoleLog(uint2str(_withdrawValue));

        peggedToken.transfer(_withdrawToAddress, _withdrawValue);

        systemLoans.withdrawCurrency(_withdrawToAddress, _withdrawValue);
    }

    function add2str(address x) public pure returns (string memory str) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            byte b = byte(uint8(uint(x) / (2**(8*(19 - i)))));
            byte hi = byte(uint8(b) / 16);
            byte lo = byte(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);
        }
        return string(s);
    }

    function char(byte b) public pure returns (byte c) {
        if (uint8(b) < 10) return byte(uint8(b) + 0x30);
        else return byte(uint8(b) + 0x57);
    }

    function uint2str(uint value) public pure returns (string memory str) {
        uint i = value;
        if (i == 0) return "0";
        uint j = i;
        uint len;
        while (j != 0){
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (i != 0){
            bstr[k--] = byte(uint8(48 + i % 10));
            i /= 10;
        }
        return string(bstr);
    }

    event ConsoleLog(string message);
}