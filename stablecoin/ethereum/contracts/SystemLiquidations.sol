pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./PeggedToken.sol";
import "./System.sol";
import "./SystemLoans.sol";
import "./LiquidatorAccount.sol";

contract SystemLiquidations {
    System public system;
    PeggedToken public peggedToken;
    SystemLoans public systemLoans;

    constructor(
        address _peggedTokenAddress,
        address _systemAddress,
        address _systemLoansAddress
    ) public {
        require(_peggedTokenAddress != address(0), "_peggedTokenAddress should not be 0");
        require(_systemAddress != address(0), "_systemAddress should not be 0");
        require(_systemLoansAddress != address(0), "_systemLoansAddress should not be 0");
        peggedToken = PeggedToken(_peggedTokenAddress);
        system = System(_systemAddress);
        systemLoans = SystemLoans(_systemLoansAddress);
    }

    uint256 constant public PRICE_DECIMALS = 18;

    address public lastNewAddress;
    mapping (address => bool) public liquidatorAccountMap;

    function createLiquidatorAccount() public returns(address) {
        LiquidatorAccount newLiquidatorAccount = new LiquidatorAccount(msg.sender, address(system), address(peggedToken));
        lastNewAddress = address(newLiquidatorAccount);
        liquidatorAccountMap[lastNewAddress] = true;
        return lastNewAddress;
    }

    event ConsoleLog(string message);
    event ConsoleLogNumber(uint number);

    function changeRegisteredCurrency(uint256 _currentRegistration, uint256 _newRegistration, bool isUnregister) public {

    }
}