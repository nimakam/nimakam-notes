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
    mapping (address => LiquidatorAccountState) public liquidatorAccountMap;
    struct LiquidatorAccountState {
        bool isLiquidatorAccount;
        uint256 registeredCurrency;
    }

    function createLiquidatorAccount() public returns(address) {
        LiquidatorAccount newLiquidatorAccount = new LiquidatorAccount(msg.sender, address(system), address(peggedToken));
        lastNewAddress = address(newLiquidatorAccount);
        liquidatorAccountMap[lastNewAddress].isLiquidatorAccount = true;
        return lastNewAddress;
    }

    event ConsoleLog(string message);
    event ConsoleLogNumber(uint number);

    uint256 public totalRegisteredCurrency;

    function changeRegisteredCurrency(uint256 _currentRegistration, uint256 _newRegistration, bool isUnregister) public {
        require(liquidatorAccountMap[msg.sender].isLiquidatorAccount, "caller address should be a valid liquidator account");
        require(liquidatorAccountMap[msg.sender].registeredCurrency == _currentRegistration, "registered currency should be same on state map");
        require(totalRegisteredCurrency > _currentRegistration, "total registered currency should above a single liquidator account");

        liquidatorAccountMap[msg.sender].registeredCurrency -= _currentRegistration;
        liquidatorAccountMap[msg.sender].registeredCurrency += _newRegistration;
        totalRegisteredCurrency -= _currentRegistration;
        totalRegisteredCurrency += _newRegistration;
    }

    function requestLiquidation(address _loanAddress, uint256 _depositCurrency) public {
        require(liquidatorAccountMap[msg.sender].isLiquidatorAccount, "caller address should be a valid liquidator account");
        require(systemLoans.isLoan(_loanAddress), "_loanAddress should be a valid system loan");

        uint256 requiredDepositCurrency = systemLoans.getRequiredDepositCurrency(_loanAddress);
        require(requiredDepositCurrency <= _depositCurrency, "deposit currency should be sufficient to liquidate");

    }
}