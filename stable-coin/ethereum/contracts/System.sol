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
    address public systemLiquidationsAddress;
    uint256 public firstTime;

    constructor(
        address _peggedTokenAddress
    ) public {
        require(address(peggedToken) == address(0), "peggedToken address should be 0");
        require(_peggedTokenAddress != address(0), "_peggedTokenAddress should not be 0");
        peggedToken = PeggedToken(_peggedTokenAddress);
        firstTime = block.timestamp;
    }

    function initialize(
        address _systemFeedsAddress,
        address _systemLoansAddress,
        address _systemSavingsAddress,
        address _systemLiquidationsAddress
    )
    public
    {
        require(systemFeedsAddress == address(0), "systemFeedsAddress should be 0");
        require(_systemFeedsAddress != address(0), "_systemFeedsAddress should not be 0");
        require(systemLoansAddress == address(0), "systemLoansAddress should be 0");
        require(_systemLoansAddress != address(0), "_systemLoansAddress should not be 0");
        require(systemSavingsAddress == address(0), "systemSavingsAddress should be 0");
        require(_systemSavingsAddress != address(0), "_systemSavingsAddress should not be 0");
        require(systemLiquidationsAddress == address(0), "systemLiquidationsAddress should be 0");
        require(_systemLiquidationsAddress != address(0), "_systemLiquidationsAddress should not be 0");
        systemFeedsAddress = _systemFeedsAddress;
        systemLoansAddress = _systemLoansAddress;
        systemSavingsAddress = _systemSavingsAddress;
        systemLiquidationsAddress = _systemLiquidationsAddress;
    }

    uint32 constant DAYS_PER_WEEK = 7;
    uint32 constant UNITS_PER_PERIOD = 5;
    uint32 constant ORDERS_OF_PERIODS = 5; // 0 (~1 mnth) , 1 (~0.48 yr), 2 (~2.4 yr), 3 (~12 yr), 4 (~60 yr) - Total (~299.45 yr)

    SystemVariables[DAYS_PER_WEEK] public dailySystemVariables;
    uint256 public lastFinalizedDay;
    SystemVariables[ORDERS_OF_PERIODS][UNITS_PER_PERIOD] public periodicSystemVariables;
    uint256[ORDERS_OF_PERIODS] public lastFinalizedPeriodUnit;

    struct SystemVariables {
        uint32 startDay;
        uint256 ethPrice;
        uint256 pegPrice;
        uint256 loansFeeRate;
        uint256 targetLoansFeeRate;
        uint256 feedsRevenueRate;
        uint256 savingsInterestRate;
        uint256 targetSavingsInterestRate;
        uint32 pegInstabilityDaysInRow;
        int256 pegEquilibriumMetric;
        DelayedPriceReportingState priceState;
    }

    struct FeedAggregationEntry { uint256 ethPrice; uint256 pegPrice; uint256 totalAllocation; }
    enum DelayedPriceReportingState { Unspecified, Empty, Stable, Unstable, Dispute }
    uint32 constant public HIGH_TRUST_FEEDS = 5; // Maximum number of high trust price feeds
    uint32 constant public MEDIUM_TRUST_FEEDS = 25; // Maximum number of medium trust price feeds
    SystemFeeds.FeedProcessState[MEDIUM_TRUST_FEEDS] public feedFinalizedStateList;

    uint32 constant public PRICE_INDEX = 0;
    uint32 constant public ALLOCATION_INDEX = 1;
    uint32 constant public PRICE_AND_ALLOCATION = 2;


    function finalizePriceFeedState(uint32 finalizeDay, SystemFeeds.FeedProcessState[MEDIUM_TRUST_FEEDS] memory _feedFinalizedStateList) public {
        require(msg.sender == systemFeedsAddress, "caller must be system feeds contract");
        lastFinalizedDay = finalizeDay;

        emit ConsoleLog(">System.finalizeVariables finalizeDay");
        emit ConsoleLogNumber(finalizeDay);

        for(uint32 i = 0; i < MEDIUM_TRUST_FEEDS; i++) {
            feedFinalizedStateList[i].ethPrice = _feedFinalizedStateList[i].ethPrice;
            feedFinalizedStateList[i].pegPrice = _feedFinalizedStateList[i].pegPrice;
            feedFinalizedStateList[i].totalAllocation = _feedFinalizedStateList[i].totalAllocation;
            feedFinalizedStateList[i].isProcessed = _feedFinalizedStateList[i].isProcessed;
            feedFinalizedStateList[i].priceFeedAddress = _feedFinalizedStateList[i].priceFeedAddress;
        }

        setPriceVariables(finalizeDay);
        setSystemVariables(finalizeDay);
    }

    function setPriceVariables(uint32 finalizeDay) private {
               // FeedAggregationEntry[MEDIUM_TRUST_FEEDS] memory feedsSortedByEthPrice; // Large value at index 0 (top), Small value at last index (bottom)
        uint256[MEDIUM_TRUST_FEEDS][PRICE_AND_ALLOCATION] memory feedsSortedByEthPrice; // Large value at top (0), Small value at bottom
        uint256[MEDIUM_TRUST_FEEDS][PRICE_AND_ALLOCATION] memory feedsSortedByPegPrice; // Large value at top (0), Small value at bottom
        uint32 i = 0;
        uint32 topIndex = 0;
        uint32 bottomIndex = 0;
        while(i < MEDIUM_TRUST_FEEDS - HIGH_TRUST_FEEDS) {
            if(feedFinalizedStateList[i + HIGH_TRUST_FEEDS].priceFeedAddress != address(0)) {
                if(feedFinalizedStateList[i + HIGH_TRUST_FEEDS].isProcessed) {
                    if(feedFinalizedStateList[i + HIGH_TRUST_FEEDS].ethPrice != 0) {
// emit ConsoleLog(">System.finalizeVariables 1 i ethPrice");
// emit ConsoleLogNumber(i);
// emit ConsoleLogNumber(_feedFinalizedStateList[i].ethPrice);
                        feedsSortedByEthPrice[PRICE_INDEX][bottomIndex] = feedFinalizedStateList[i + HIGH_TRUST_FEEDS].ethPrice;
                        feedsSortedByEthPrice[ALLOCATION_INDEX][bottomIndex] = feedFinalizedStateList[i + HIGH_TRUST_FEEDS].totalAllocation;
                        bubbleSortEntries(feedsSortedByEthPrice, bottomIndex, topIndex);
                        feedsSortedByPegPrice[PRICE_INDEX][bottomIndex] = feedFinalizedStateList[i + HIGH_TRUST_FEEDS].pegPrice;
                        feedsSortedByPegPrice[ALLOCATION_INDEX][bottomIndex] = feedFinalizedStateList[i + HIGH_TRUST_FEEDS].totalAllocation;
                        bubbleSortEntries(feedsSortedByPegPrice, bottomIndex, topIndex);
                        bottomIndex++;
                    }
                }
            }
            i++;
        }

        while(bottomIndex > 10 + topIndex) {
            topIndex++;
            bottomIndex--;
// emit ConsoleLog(">System.finalizeVariables 2 topIndex bottomIndex");
// emit ConsoleLogNumber(topIndex);
// emit ConsoleLogNumber(bottomIndex);
        }

        // If not currently empty move bottom down to prepare for next entry
        i = 0;
        while (i < HIGH_TRUST_FEEDS) {
            if(feedFinalizedStateList[i].priceFeedAddress != address(0)) {
                if(feedFinalizedStateList[i].isProcessed) {
                    if(feedFinalizedStateList[i].ethPrice != 0) {
// emit ConsoleLog(">System.finalizeVariables 3 i ethPrice");
// emit ConsoleLogNumber(i);
// emit ConsoleLogNumber(_feedFinalizedStateList[i].ethPrice);
                        feedsSortedByEthPrice[PRICE_INDEX][bottomIndex] = feedFinalizedStateList[i].ethPrice;
                        feedsSortedByEthPrice[ALLOCATION_INDEX][bottomIndex] = feedFinalizedStateList[i].totalAllocation;
                        bubbleSortEntries(feedsSortedByEthPrice, bottomIndex, topIndex);
                        feedsSortedByPegPrice[PRICE_INDEX][bottomIndex] = feedFinalizedStateList[i].pegPrice;
                        feedsSortedByPegPrice[ALLOCATION_INDEX][bottomIndex] = feedFinalizedStateList[i].totalAllocation;
                        bubbleSortEntries(feedsSortedByPegPrice, bottomIndex, topIndex);
// emit ConsoleLog(">System.finalizeVariables 3 i feedsSortedByEthPrice[PRICE_INDEX][bottomIndex] feedsSortedByEthPrice[ALLOCATION_INDEX][bottomIndex]");
// emit ConsoleLogNumber(i);
// emit ConsoleLogNumber(feedsSortedByEthPrice[PRICE_INDEX][bottomIndex]);
// emit ConsoleLogNumber(feedsSortedByEthPrice[ALLOCATION_INDEX][bottomIndex]);
                        bottomIndex++; // move bottom down to prepare for next entry
                    }
                }
            }
            i++;
        }

        if (bottomIndex > 5 + topIndex){
            topIndex++;
            bottomIndex--;
        }

        while(bottomIndex > 13 + topIndex) {
            topIndex++;
            bottomIndex--;
// emit ConsoleLog(">System.finalizeVariables 4 topIndex bottomIndex");
// emit ConsoleLogNumber(topIndex);
// emit ConsoleLogNumber(bottomIndex);
        }

        uint256 ethPriceSum;
        uint256 pegPriceSum;
        uint256 ethTotalWeight;
        uint256 pegTotalWeight;
        i = topIndex;
        while (i < bottomIndex) { // Iterate through valid price
            ethPriceSum += feedsSortedByEthPrice[PRICE_INDEX][i] * feedsSortedByEthPrice[ALLOCATION_INDEX][i];
            ethTotalWeight += feedsSortedByEthPrice[ALLOCATION_INDEX][i];
            pegPriceSum += feedsSortedByPegPrice[PRICE_INDEX][i] * feedsSortedByPegPrice[ALLOCATION_INDEX][i];
            pegTotalWeight += feedsSortedByPegPrice[ALLOCATION_INDEX][i];
            i++;
        }
        uint256 averageEthPrice = ethPriceSum == 0 ? 0 : ethPriceSum / ethTotalWeight;
        uint256 averagePegPrice = pegPriceSum == 0 ? 0 : pegPriceSum / pegTotalWeight;
        dailySystemVariables[finalizeDay % 7].ethPrice = averageEthPrice;
        dailySystemVariables[finalizeDay % 7].pegPrice = averagePegPrice;

emit ConsoleLog(">System.finalizeVariables 6 averageEthPrice topIndex bottomIndex min max");
emit ConsoleLogNumber(averageEthPrice);
emit ConsoleLogNumber(topIndex);
emit ConsoleLogNumber(bottomIndex);
if(bottomIndex != topIndex) {emit ConsoleLogNumber(feedsSortedByEthPrice[PRICE_INDEX][bottomIndex - 1]);} else {emit ConsoleLog("N/A");}
emit ConsoleLogNumber(feedsSortedByEthPrice[PRICE_INDEX][topIndex]);

        if (bottomIndex == topIndex) { // There are no instant prices reported
            dailySystemVariables[finalizeDay % 7].priceState = DelayedPriceReportingState.Empty;
        } else if ((feedsSortedByEthPrice[PRICE_INDEX][topIndex] - feedsSortedByEthPrice[PRICE_INDEX][bottomIndex - 1]) * 100 > averageEthPrice * 25 ) { // Max - Min > 20% * Avg - Disputed state
            dailySystemVariables[finalizeDay % 7].priceState = DelayedPriceReportingState.Dispute;
        } else if ((feedsSortedByEthPrice[PRICE_INDEX][topIndex] - feedsSortedByEthPrice[PRICE_INDEX][bottomIndex - 1]) * 100 > averageEthPrice * 5 ) { // Max - Min > 5% * Avg - Unstable state
            dailySystemVariables[finalizeDay % 7].priceState = DelayedPriceReportingState.Unstable;
        } else { // We are in stable state
            dailySystemVariables[finalizeDay % 7].priceState = DelayedPriceReportingState.Stable;
        }

        dailySystemVariables[finalizeDay % 7].startDay = finalizeDay;
    }

    function setSystemVariables(uint32 finalizeDay) private {
        int256 pegEquilibriumMetric;
        int256 previousPegEquilibriumMetric = dailySystemVariables[(finalizeDay - 1) % 7].pegEquilibriumMetric;
        uint256 pegPrice = dailySystemVariables[finalizeDay % 7].pegPrice;
        if(previousPegEquilibriumMetric <= 0 && pegPrice < 10 ** PRICE_DECIMALS) {
            pegEquilibriumMetric = previousPegEquilibriumMetric - int(10 ** PRICE_DECIMALS - pegPrice);
            dailySystemVariables[(finalizeDay - 1) % 7].pegInstabilityDaysInRow++;
        } else if (previousPegEquilibriumMetric >= 0 && pegPrice > 10 ** PRICE_DECIMALS) {
            pegEquilibriumMetric = previousPegEquilibriumMetric + int(pegPrice - 10 ** PRICE_DECIMALS);
            dailySystemVariables[(finalizeDay - 1) % 7].pegInstabilityDaysInRow++;
        } else {
            pegEquilibriumMetric = 0;
            dailySystemVariables[(finalizeDay - 1) % 7].pegInstabilityDaysInRow = 0;
        }

        dailySystemVariables[finalizeDay % 7].pegEquilibriumMetric = pegEquilibriumMetric;

        int256 loanFeeTargetRateInt = int(baseLoanFeeRate) - pegEquilibriumMetric * 10 / 100;
        uint256 loanFeeTargetRate = loanFeeTargetRateInt > int(priceFeedRevenueRate) ? uint(loanFeeTargetRateInt) : priceFeedRevenueRate;
        dailySystemVariables[finalizeDay % 7].targetLoansFeeRate = loanFeeTargetRate;
        uint256 loanFeeRate;
        uint256 previousLoanFeeRate = dailySystemVariables[(finalizeDay - 1) % 7].loansFeeRate;
        if(previousLoanFeeRate == 0 && dailySystemVariables[finalizeDay % 7].ethPrice == 0) {previousLoanFeeRate = baseLoanFeeRate;}
        previousLoanFeeRate = previousLoanFeeRate - (previousLoanFeeRate % onePercent);
        if(loanFeeTargetRate >= onePercent + previousLoanFeeRate ) {
            loanFeeRate = previousLoanFeeRate + onePercent;
        } else if (loanFeeTargetRate + onePercent <= previousLoanFeeRate){
            loanFeeRate = previousLoanFeeRate - onePercent;
        } else {
            loanFeeRate = previousLoanFeeRate;
        }

        dailySystemVariables[finalizeDay % 7].loansFeeRate = loanFeeRate;

        dailySystemVariables[finalizeDay % 7].feedsRevenueRate = priceFeedRevenueRate;

        uint256 targetSavingsInterestRate = loanFeeTargetRate > priceFeedRevenueRate ? 2 * (loanFeeTargetRate - priceFeedRevenueRate) : 0;
        dailySystemVariables[finalizeDay % 7].targetSavingsInterestRate = targetSavingsInterestRate;
        uint256 maxFeasibleSavingsInterestRate = totalRegisteredSavings > 0 ? 4 * savingsPoolBalance / totalRegisteredSavings : 5 * baseSavingsInterestRate;
        uint256 feasibleTargetSavingsInterestRate = targetSavingsInterestRate < maxFeasibleSavingsInterestRate ? targetSavingsInterestRate : maxFeasibleSavingsInterestRate;
        uint256 previousSavingsInterestRate = dailySystemVariables[(finalizeDay - 1) % 7].savingsInterestRate;
        if(previousSavingsInterestRate == 0 && dailySystemVariables[finalizeDay % 7].ethPrice == 0) {previousSavingsInterestRate = baseSavingsInterestRate;}
        previousSavingsInterestRate = previousSavingsInterestRate - (previousSavingsInterestRate % halfPercent);
        uint256 savingsInterestRate;
        if(feasibleTargetSavingsInterestRate > halfPercent + previousSavingsInterestRate) {
            savingsInterestRate = previousSavingsInterestRate + halfPercent;
        } else if (feasibleTargetSavingsInterestRate + halfPercent < previousSavingsInterestRate) {
            savingsInterestRate = previousSavingsInterestRate - halfPercent;
        } else {
            savingsInterestRate = feasibleTargetSavingsInterestRate - (feasibleTargetSavingsInterestRate % halfPercent);
        }
        dailySystemVariables[finalizeDay % 7].savingsInterestRate = savingsInterestRate;
    }

    uint256 public baseLoanFeeRate = 2 * 10 ** PRICE_DECIMALS / 100;
    uint256 public baseSavingsInterestRate = 2 * 10 ** PRICE_DECIMALS / 100;
    uint256 public maxSavingsInterestRate = 20 * 10 ** PRICE_DECIMALS / 100;
    uint256 public priceFeedRevenueRate = 1 * 10 ** PRICE_DECIMALS / 100;
    uint256 public halfPercent = 1 * 10 ** PRICE_DECIMALS / 2 / 100;
    uint256 public onePercent = 1 * 10 ** PRICE_DECIMALS / 100;

    function bubbleSortEntries
    (
        uint256[MEDIUM_TRUST_FEEDS][PRICE_AND_ALLOCATION] memory arrayOfEntries,
        uint32 index,
        uint32 topIndex
    )
    private
    {
        if (index > topIndex && arrayOfEntries[PRICE_INDEX][index] > arrayOfEntries[PRICE_INDEX][index - 1]) {
            uint256 swapPrice;
            uint256 swapAllocation;

            swapPrice = arrayOfEntries[PRICE_INDEX][index];
            swapAllocation = arrayOfEntries[ALLOCATION_INDEX][index];

            arrayOfEntries[PRICE_INDEX][index] = arrayOfEntries[PRICE_INDEX][index - 1];
            arrayOfEntries[ALLOCATION_INDEX][index] = arrayOfEntries[ALLOCATION_INDEX][index - 1];

            arrayOfEntries[PRICE_INDEX][index - 1] = swapPrice;
            arrayOfEntries[ALLOCATION_INDEX][index - 1] = swapAllocation;

            bubbleSortEntries(arrayOfEntries, index - 1, topIndex);
        }
    }

    function getDelayedPrice() public view returns (DelayedPriceReportingState, uint256) {
        SystemVariables storage variables = dailySystemVariables[lastFinalizedDay % 7];
        return (variables.priceState, variables.ethPrice);
    }

    uint32 constant SECONDS_PER_DAY = 86400; // SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY = 60 * 60 * 24

    function calculateInterest(uint256 _lastInterestTime, uint256 _callTime, uint256 _registeredBalance) public pure returns (uint256) {
        uint256 returnValue = (_callTime - _lastInterestTime) / SECONDS_PER_DAY;
        returnValue *= 2 * _registeredBalance;
        returnValue /= 100;
        returnValue /= 365;
        return returnValue;
    }

    uint256 constant public PRICE_DECIMALS = 18;

    function getFeedRevenueRate() public pure returns (uint256) {
        uint256 feedRevenueRate = 1 * 10 ** PRICE_DECIMALS;
        feedRevenueRate /= 100;
        return feedRevenueRate;
    }

    function getLoanFeeRate() public pure returns (uint256) {
        uint256 loanFeeRate = 4 * 10 ** PRICE_DECIMALS;
        loanFeeRate /= 100;
        return loanFeeRate;
    }

    function getLoanCollateralThresholdRatio() public pure returns (uint256) {
        uint256 loanCollateralThresholdRatio = 150 * 10 ** PRICE_DECIMALS;
        loanCollateralThresholdRatio /= 100;
        return loanCollateralThresholdRatio;
    }

    uint256 public savingsPoolBalance;
    function setSavingsPoolBalance(uint256 _savingsPoolBalance) public {
        require(msg.sender == systemSavingsAddress, "caller must be system savings contract");
        savingsPoolBalance = _savingsPoolBalance;
    }

    uint256 public totalRegisteredSavings;
    function setTotalRegisteredSavings(uint256 _totalRegisteredSavings) public {
        require(msg.sender == systemSavingsAddress, "caller must be system savings contract");
        totalRegisteredSavings = _totalRegisteredSavings;
    }

    enum InstantPriceReportingState { Unspecified, Empty, Stable, Unstable, Dispute }
    InstantPriceReportingState public instantPriceReportingState = InstantPriceReportingState.Empty;
    uint256 public lastInstantPrice;

    function getInstantPrice() public view returns (InstantPriceReportingState, uint256) {
        return (instantPriceReportingState, lastInstantPrice);
    }

    mapping (address => TrustedPriceFeedState) public trustedPriceFeedMap;
    struct TrustedPriceFeedState {
        bool isTrustedPriceFeed;
        uint256 lastInstantEthPrice;
        uint256 lastInstantCallTime;
    }

    function reportInstantPrice(address _callingPriceFeedAddress, PriceFeed.InstantPrice memory _instantPrice) public {
        require(msg.sender == systemFeedsAddress, "caller must be system feeds contract");
        setCallTime();

        trustedPriceFeedMap[_callingPriceFeedAddress].isTrustedPriceFeed = true;
        trustedPriceFeedMap[_callingPriceFeedAddress].lastInstantEthPrice = _instantPrice.ethPrice;
        trustedPriceFeedMap[_callingPriceFeedAddress].lastInstantCallTime = _instantPrice.callTime;

        uint256[HIGH_TRUST_FEEDS] memory sortedEthPrices; // Largest value at index 0 (top), Smallest value at last index (bottom)
        uint256 sum;
        uint32 count;
        for (uint32 i = 0; i < HIGH_TRUST_FEEDS; i++) { // Iterate through valid prices
            TrustedPriceFeedState storage trustedFeedState = trustedPriceFeedMap[feedFinalizedStateList[i].priceFeedAddress];
            if(trustedFeedState.isTrustedPriceFeed){
                if(trustedFeedState.lastInstantEthPrice != 0) {
                    if ((callTime - trustedFeedState.lastInstantCallTime) / SECONDS_PER_DAY == 0) {
                        sum += trustedFeedState.lastInstantEthPrice;
                        sortedEthPrices[count] = trustedFeedState.lastInstantEthPrice;
                        bubbleSort(sortedEthPrices, count);
                        count++;
                    }
                }
            }
        }
        uint256 averageEthPrice = sum / count;

        // Pick instant price to be just the position below median
        uint32 topIndex = 0;
        uint32 bottomIndex = count - 1;
        while(bottomIndex > 2 + topIndex) {
            topIndex++;
            bottomIndex--;
        }
        lastInstantPrice = sortedEthPrices[bottomIndex];

        if (count == 0) { // There are no instant prices reported
            instantPriceReportingState = InstantPriceReportingState.Empty;
        } else if ((sortedEthPrices[0] - sortedEthPrices[count - 1]) * 100 > averageEthPrice * 20 ) { // Max - Min > 20% * Avg - Disputed state
            instantPriceReportingState = InstantPriceReportingState.Dispute;
        } else if ((sortedEthPrices[0] - sortedEthPrices[count - 1]) * 100 > averageEthPrice * 5 ) { // Max - Min > 5% * Avg - Unstable state
            instantPriceReportingState = InstantPriceReportingState.Unstable;
        } else { // We are in stable state
            instantPriceReportingState = InstantPriceReportingState.Stable;
        }
    }

    function bubbleSort(uint256[HIGH_TRUST_FEEDS] memory array, uint32 index) private {
        if (index > 0 && array[index] > array[index - 1]) {
            uint256 swap = array[index];
            array[index] = array[index - 1];
            array[index - 1] = swap;

            bubbleSort(array, index - 1);
        }
    }

    uint256 public callTime;
    function setCallTime() private
    {
        callTime = block.timestamp;
    }

    event ConsoleLog(string message);
    event ConsoleLogNumber(uint256 number);

}   