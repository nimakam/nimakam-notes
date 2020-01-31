pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "../System.sol";
import "../SystemSavings.sol";
import "../SavingsAccount.sol";

contract TestSavingsAccountController {
    address public owner;
    SavingsAccount public savingsAccount;

    constructor(
        address _systemAddress
    ) public {
        owner = msg.sender;
        System system = System(_systemAddress);
        SystemSavings systemSavings = SystemSavings(address(system.systemSavingsAddress));
        address savingsAccountAddress = systemSavings.createSavingsAccount();
        savingsAccount = SavingsAccount(savingsAccountAddress);
    }

    function registerCurrencySkipInterest(uint256 _currencyValue) public {
        require(owner == msg.sender, "sender should be owner");

        savingsAccount.registerCurrencySkipInterest(_currencyValue);
    }

    function accumulateInterest() public {
        require(owner == msg.sender, "sender should be owner");

        savingsAccount.accumulateInterest();
    }

}