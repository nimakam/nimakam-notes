pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./PeggedToken.sol";
import "./Loan.sol";
import "./SystemLoans.sol";
import "./SystemFeeds.sol";
import "./PriceFeed.sol";

contract System {

    PeggedToken public peggedToken;
    address public systemLoansAddress;
    address public systemFeedsAddress;
    address public systemSavingsAddress;
    uint256 public firstTime;

    uint32 constant SECONDS_PER_DAY = 86400; // SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY = 60 * 60 * 24

    constructor(
        address _peggedTokenAddress
    ) public {
        require(_peggedTokenAddress != address(0), "_peggedTokenAddress should not be 0");
        peggedToken = PeggedToken(_peggedTokenAddress);
        firstTime = block.timestamp;
    }

    function initialize(
        address _systemFeedsAddress,
        address _systemLoansAddress,
        address _systemSavingsAddress
    )
    public
    {
        require(systemFeedsAddress == address(0), "systemFeedsAddress should be 0");
        require(systemLoansAddress == address(0), "systemLoansAddress should be 0");
        require(systemSavingsAddress == address(0), "systemSavingsAddress should be 0");
        systemFeedsAddress = _systemFeedsAddress;
        systemLoansAddress = _systemLoansAddress;
        systemSavingsAddress = _systemSavingsAddress;
    }

    function calculateInterest
    (
        uint256 _lastInterestTime,
        uint256 _callTime,
        uint256 _registeredBalance
    )
    public
    pure
    returns (uint256)
    {
        return (2 ** 16 * (_callTime - _lastInterestTime) * _registeredBalance) / (100 * SECONDS_PER_DAY * 356);
    }
}