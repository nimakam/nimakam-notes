pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "../System.sol";
import "../SystemLiquidations.sol";
import "../LiquidatorAccount.sol";

contract TestLiquidatorAccountController {
    address public owner;
    LiquidatorAccount public liquidatorAccount;

    constructor(
        address _systemAddress
    ) public {
        owner = msg.sender;
        System system = System(_systemAddress);
        SystemLiquidations systemLiquidations = SystemLiquidations(address(system.systemLiquidationsAddress));
        address liquidatorAccountAddress = systemLiquidations.createLiquidatorAccount();
        liquidatorAccount = LiquidatorAccount(liquidatorAccountAddress);
    }

    function depositEth() public payable {
        require(owner == msg.sender, "sender should be owner");
        liquidatorAccount.depositEth.value(msg.value)();
    }

    function registerCurrency(uint256 _registerValue) public {
        require(owner == msg.sender, "sender should be owner");

        liquidatorAccount.registerCurrency(_registerValue);
    }

    function unregisterCurrency(uint256 _unregisterValue) public {
        require(owner == msg.sender, "sender should be owner");

        liquidatorAccount.unregisterCurrency(_unregisterValue);
    }

}