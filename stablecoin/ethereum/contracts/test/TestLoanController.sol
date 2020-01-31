pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "../System.sol";
import "../SystemLoans.sol";
import "../Loan.sol";

contract TestLoanController {
    address public owner;
    Loan public loan;

    uint32 constant public MAX_ALLOCATIONS = 5; // Maximum price feed allocations

    constructor(
        address _systemAddress
    ) public {
        owner = msg.sender;
        System system = System(_systemAddress);
        SystemLoans systemLoans = SystemLoans(address(system.systemLoansAddress));
        address loanAddress = systemLoans.createLoan();
        loan = Loan(loanAddress);
    }

    function depositEth() public payable {
        require(owner == msg.sender, "sender should be owner");
        loan.depositEth.value(msg.value)();
    }

    function withdrawCurrency(address _withdrawToAddress, uint256 _withdrawValue) public {
        require(owner == msg.sender, "sender should be owner");

        loan.withdrawCurrency(_withdrawToAddress, _withdrawValue);
    }

    function allocatePriceFeeds(
        Loan.PriceFeedAllocation[MAX_ALLOCATIONS] memory newPriceFeedAllocations
    )
    public
    {
        require(owner == msg.sender, "sender should be owner");

        loan.allocatePriceFeeds(newPriceFeedAllocations);
    }
}