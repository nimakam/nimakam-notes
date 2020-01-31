pragma solidity ^0.5.11;

import "./System.sol";
import "./SavingsAccount.sol";
import "./SystemFeeds.sol";
import "./PeggedToken.sol";

contract SystemSavings {
    System public system;
    SystemFeeds public systemFeeds;
    PeggedToken public peggedToken;
    address public systemLoansAddress;

    constructor(
        address _peggedTokenAddress,
        address _systemAddress,
        address _systemFeedsAddress
    ) public {
        require(_systemAddress != address(0), "_systemAddress should not be 0");
        require(_systemFeedsAddress != address(0), "_systemFeedsAddress should not be 0");
        require(_peggedTokenAddress != address(0), "_peggedTokenAddress should not be 0");
        system = System(_systemAddress);
        systemFeeds = SystemFeeds(_systemFeedsAddress);
        peggedToken = PeggedToken(_peggedTokenAddress);
    }

    function initialize(address _systemLoansAddress) public {
        require(systemLoansAddress == address(0), "systemLoansAddress should be 0");
        systemLoansAddress = _systemLoansAddress;
    }

    mapping (address => bool) public savingsAccountMap;
    uint256 public totalRegisteredSavings;
    uint256 public savingsPoolBalance;
    address public lastNewAddress;

    function createSavingsAccount() public returns(address) {
        SavingsAccount newSavingsAccount = new SavingsAccount(msg.sender, address(peggedToken));
        lastNewAddress = address(newSavingsAccount);
        savingsAccountMap[lastNewAddress] = true;
        return lastNewAddress;
    }

    function accumulateInterest(uint256 _lastInterestTime, uint256 _callTime, uint256 _registeredBalance) public returns (uint256 interestValue){
        require(savingsAccountMap[msg.sender], "sender should be valid savings account contract");
        interestValue = system.calculateInterest(_lastInterestTime, _callTime, _registeredBalance);

        emit ConsoleLog(">SystemSavings.accumulateInterest interestValue");
        emit ConsoleLogNumber(interestValue);

        require(interestValue <= peggedToken.balanceOf(address(this)), "interest should be available in savings pool");
        peggedToken.transfer(msg.sender, interestValue);

        savingsPoolBalance -= interestValue;
        system.setSavingsPoolBalance(savingsPoolBalance);

        totalRegisteredSavings += interestValue;
        system.setTotalRegisteredSavings(totalRegisteredSavings);

        return interestValue;
    }

    function registerCurrency(uint256 _registeredBalance, uint256 _registerValue) public {
        require(savingsAccountMap[msg.sender], "sender should be valid savings account contract");

        totalRegisteredSavings += _registerValue;
        system.setTotalRegisteredSavings(totalRegisteredSavings);
    }

    function unregisterCurrency(uint256 _registeredBalance, uint256 _unregisterValue) public {
        require(savingsAccountMap[msg.sender], "sender should be valid savings account contract");

        totalRegisteredSavings -= _unregisterValue;
        system.setTotalRegisteredSavings(totalRegisteredSavings);
    }

    function withdrawCurrency(uint256 registeredBalance, address _withdrawToAddress, uint256 _withdrawValue) public {
        require(savingsAccountMap[msg.sender], "sender should be valid savings account contract");
    }

    function registerSavingsPoolTransfer(uint256 _transferValue) public {
        require(systemLoansAddress != address(0), "systemLoansAddress should be initialized");
        require(msg.sender == systemLoansAddress, "caller must be system loans contract");

        savingsPoolBalance += _transferValue;
        system.setSavingsPoolBalance(savingsPoolBalance);

        uint256 currentCurrencyBalance = peggedToken.balanceOf(address(this));
        require (savingsPoolBalance <= currentCurrencyBalance, "currency balance should be greater than savings pool");
    }

    // function voteDownPriceFeed(address _downVotedFeed, address _existingDownVotedFeed, uint256 _registeredBalance) public {
    //     require(savingsAccountMap[msg.sender], "sender should be valid savings account contract");

    //     if(systemFeeds.isPriceFeed(_existingDownVotedFeed)) {
    //         systemFeeds.changeDownVoteAllocation(_existingDownVotedFeed, _registeredBalance, false);
    //     }

    //     if(systemFeeds.isPriceFeed(_downVotedFeed)) {
    //         systemFeeds.changeDownVoteAllocation(_downVotedFeed, _registeredBalance, true);
    //     }
    // }

    event ConsoleLog(string message);
    event ConsoleLogNumber(uint number);
}