pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./SystemLiquidations.sol";
import "./System.sol";
import "./PeggedToken.sol";

/// @author Nima Kamoosi
/// @title Liquidation account contract of the \{\{PegLoan\}\} currency peg system
/// @notice The Liquidation Account contract holds the state of a given liquidation account, as part of the \{\{PegLoan\}\} currency peg system.
/// It works alongside the System, PriceFeed, and PeggedCurrency contracts to make the whole system function.
/// @dev The contained state includes the contract owner, ETH deposit balance the registered currency balance
contract LiquidatorAccount {
    address public owner; // Loan owner account or contract
    System public system; // The main system contract instance
    SystemLiquidations public systemLiquidations; // The main system loans contract instance
    PeggedToken public peggedToken; // The main pegged token contract instance

    uint32 constant SECONDS_PER_DAY = 86400; // SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY = 60 * 60 * 24
    uint256 constant public PRICE_DECIMALS = 18;

    /// Constructor
    /// @param _owner is owner of the loan and is set at time of creation
    /// @dev creats the loan instnace, sets its owner, and assigns the main system contract instance
    constructor(
        address _owner,
        address _systemAddress,
        address _peggedTokenAddress
    ) public {
        owner = _owner;
        systemLiquidations = SystemLiquidations(msg.sender);
        system = System(_systemAddress);
        peggedToken = PeggedToken(_peggedTokenAddress);
    }

    function depositEth() public payable {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog("depositEth address(this).balance msg.value");
        emit ConsoleLogNumber(address(this).balance);
        emit ConsoleLogNumber(msg.value);
  }

    function withdrawEth(address payable _withdrawToAddress, uint256 _withdrawValue) public {
        require(owner == msg.sender, "sender should be owner");

        _withdrawToAddress.transfer(_withdrawValue);
    }

    function withdrawCurrency(address _withdrawToAddress, uint256 _withdrawValue) public {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog(">LiquidationAccount.withdrawCurrency _withdrawValue");
        emit ConsoleLogNumber(_withdrawValue);

        uint256 currentBalance = peggedToken.balanceOf(address(this));
        require(currentBalance >= registeredCurrency + _withdrawValue, "not enough unregistered currency to withdraw");
        peggedToken.transfer(_withdrawToAddress, _withdrawValue);
    }

    uint256 public registeredCurrency;
    function registerCurrency(uint256 _registerValue) public {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog(">LiquidationAccount.registerCurrency _registerValue");
        emit ConsoleLogNumber(_registerValue);

        uint256 currentBalance = peggedToken.balanceOf(address(this));
        require(currentBalance >= registeredCurrency + _registerValue, "currentBalance >= registeredCurrency + _registerValue");

        systemLiquidations.changeRegisteredCurrency(_registerValue, registeredCurrency + _registerValue, false);

        registeredCurrency += _registerValue;
    }

    function unregisterCurrency(uint256 _unregisterValue) public {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog(">LiquidationAccount.unregisterCurrency _unregisterValue");
        emit ConsoleLogNumber(_unregisterValue);

        require(_unregisterValue <= registeredCurrency, "not enough registered currency to unregister");

        systemLiquidations.changeRegisteredCurrency(registeredCurrency, registeredCurrency - _unregisterValue, true);

        registeredCurrency -= _unregisterValue;
    }

    function requestLiquidation(address _loanAddress, uint256 _depositCurrency) public {
        require(owner == msg.sender, "sender should be owner");

        systemLiquidations.requestLiquidation(_loanAddress, _depositCurrency);
    }

    uint256 public callTime;
    function setCallTime() private
    {
        callTime = block.timestamp;
    }

    event ConsoleLog(string message);
    event ConsoleLogNumber(uint number);
}