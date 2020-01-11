pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./System.sol";
import "./SystemSavings.sol";

/// @author Nima Kamoosi
/// @title Savings Account contract of the \{\{PegLoan\}\} currency peg system
/// @notice The Savings Account contract holds the state of a given savings account, as part of the \{\{PegLoan\}\} currency peg system.
/// It works alongside the System, PriceFeed, and PeggedCurrency contracts to make the whole system function.
/// @dev The contained state includes the contract owner, savings interest currency balance.
contract SavingsAccount {
    address public owner; // Loan owner account or contract
    SystemSavings public systemSavings; // The main system contract instance
    PeggedToken public peggedToken; // The main system contract instance

    uint256 public registeredBalance;
    uint256 public lastInterestTime;
    address public downVotedFeedAddress;

    /// Constructor
    /// @param _owner is owner of the loan and is set at time of creation
    /// @dev creats the loan instnace, sets its owner, and assigns the main system contract instance
    constructor(
        address _owner,
        address _peggedTokenAddress
    ) public {
        owner = _owner;
        peggedToken = PeggedToken(_peggedTokenAddress);
    }

    function accumulateInterest() public {
        require(owner == msg.sender, "sender should be owner");
        setCallTime();

        uint256 currentBalance = peggedToken.balanceOf(address(this));
        require(registeredBalance <= currentBalance, "registered balance should not exceed balance");

        emit ConsoleLog(">accumulateInterest callTime lastInterestTime registeredBalance");
        emit ConsoleLog(uint2str(callTime));
        emit ConsoleLog(uint2str(lastInterestTime));
        emit ConsoleLog(uint2str(registeredBalance));

        uint256 interestTransferred = systemSavings.accumulateInterest(lastInterestTime, callTime, registeredBalance);
        registeredBalance += interestTransferred;
        lastInterestTime = callTime;
    }

    function registerCurrencySkipInterest(uint256 _registerValue) public {
        require(owner == msg.sender, "sender should be owner");

        uint256 currentBalance = peggedToken.balanceOf(address(this));
        require(registeredBalance + _registerValue <= currentBalance, "registered balance should not exceed balance");

        emit ConsoleLog(">registerCurrencySkipInterest _registerValue currentBalance");
        emit ConsoleLog(uint2str(_registerValue));
        emit ConsoleLog(uint2str(currentBalance));

        systemSavings.registerCurrency(registeredBalance, _registerValue);
        registeredBalance += _registerValue;
        lastInterestTime = callTime;
    }

    function unregisterCurrencySkipInterest(uint256 _unregisterValue) public {
        require(owner == msg.sender, "sender should be owner");
        require(_unregisterValue <= registeredBalance, "unregister request cannot exceed registered balance");

        uint256 currentBalance = peggedToken.balanceOf(address(this));
        emit ConsoleLog(">unregisterCurrency _unregisterValue registeredBalance currentBalance");
        emit ConsoleLog(uint2str(_unregisterValue));
        emit ConsoleLog(uint2str(registeredBalance));
        emit ConsoleLog(uint2str(currentBalance));

        systemSavings.unregisterCurrency(registeredBalance, _unregisterValue);
        registeredBalance -= _unregisterValue;
        lastInterestTime = callTime;
    }

    function withdrawCurrency(address _withdrawToAddress, uint256 _withdrawValue) public {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog(">withdrawCurrency _withdrawToAddress _withdrawValue");
        emit ConsoleLog(add2str(_withdrawToAddress));
        emit ConsoleLog(uint2str(_withdrawValue));

        uint256 currentBalance = peggedToken.balanceOf(address(this));
        require(registeredBalance <= currentBalance - _withdrawValue, "withdraw amount cannot lower balance below registered balance");

        systemSavings.withdrawCurrency(registeredBalance, _withdrawToAddress, _withdrawValue);
        peggedToken.transfer(_withdrawToAddress, _withdrawValue);
    }

    function withdrawAllCurrencyWithInterest(address _withdrawToAddress) public {
        require(owner == msg.sender, "sender should be owner");
        setCallTime();

        uint256 currentBalance = peggedToken.balanceOf(address(this));
        require(currentBalance >= registeredBalance, "registered balance cannot exceed balance");

        emit ConsoleLog(">withdrawAllCurrencyWithInterest _withdrawToAddress currentBalance registeredBalance callTime lastInterestTime");
        emit ConsoleLog(add2str(_withdrawToAddress));
        emit ConsoleLog(uint2str(currentBalance));
        emit ConsoleLog(uint2str(registeredBalance));
        emit ConsoleLog(uint2str(callTime));
        emit ConsoleLog(uint2str(lastInterestTime));

        uint256 interestTransferred = systemSavings.accumulateInterest(lastInterestTime, callTime, registeredBalance);
        registeredBalance += interestTransferred;

        systemSavings.unregisterCurrency(registeredBalance, registeredBalance);
        registeredBalance = 0;
        lastInterestTime = callTime;

        uint256 updatedBalance = peggedToken.balanceOf(address(this));
        systemSavings.withdrawCurrency(registeredBalance, _withdrawToAddress, updatedBalance);
        peggedToken.transfer(_withdrawToAddress, updatedBalance);
    }

    function voteDownPriceFeed(address _priceFeedAddress) public {
        require(owner == msg.sender, "sender should be owner");

        emit ConsoleLog(">voteDownPriceFeed downVotedFeed _priceFeedAddress registeredBalance");
        emit ConsoleLog(add2str(downVotedFeedAddress));
        emit ConsoleLog(add2str(_priceFeedAddress));
        emit ConsoleLog(uint2str(registeredBalance));

        systemSavings.voteDownPriceFeed(downVotedFeedAddress, _priceFeedAddress, registeredBalance);
        downVotedFeedAddress = _priceFeedAddress;
    }

    uint256 public callTime;
    function setCallTime() private {
        callTime = block.timestamp;
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