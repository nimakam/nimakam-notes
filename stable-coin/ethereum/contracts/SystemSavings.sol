pragma solidity ^0.5.11;

import "./System.sol";
import "./SavingsAccount.sol";
import "./SystemFeeds.sol";
import "./PeggedToken.sol";

contract SystemSavings {
    System public system;
    SystemFeeds public systemFeeds;
    PeggedToken public peggedToken;

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

    mapping (address => bool) public savingsAccountMap;
    uint256 public totalRegisteredSavings;
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

        require(interestValue <= peggedToken.balanceOf(address(this)), "interest should be available in savings pool");
        peggedToken.transfer(msg.sender, interestValue);
        totalRegisteredSavings += interestValue;

        return interestValue;
    }

    function registerCurrency(uint256 _registeredBalance, uint256 _registerValue) public {
        require(savingsAccountMap[msg.sender], "sender should be valid savings account contract");

        totalRegisteredSavings += _registerValue;
    }

    function unregisterCurrency(uint256 _registeredBalance, uint256 _unregisterValue) public {
        require(savingsAccountMap[msg.sender], "sender should be valid savings account contract");

        totalRegisteredSavings -= _unregisterValue;
    }

    function withdrawCurrency(uint256 registeredBalance, address _withdrawToAddress, uint256 _withdrawValue) public {
        require(savingsAccountMap[msg.sender], "sender should be valid savings account contract");
    }

    function voteDownPriceFeed(address _downVotedFeed, address _existingDownVotedFeed, uint256 _registeredBalance) public {
        require(savingsAccountMap[msg.sender], "sender should be valid savings account contract");

        if(systemFeeds.isPriceFeed(_existingDownVotedFeed)) {
            systemFeeds.decrementDownVote(_existingDownVotedFeed, _registeredBalance);
        }

        if(systemFeeds.isPriceFeed(_downVotedFeed)) {
            systemFeeds.decrementDownVote(_downVotedFeed, _registeredBalance);
        }
    }
}