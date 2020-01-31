pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./PeggedToken.sol";
import "./System.sol";
import "./PriceFeed.sol";
import "./Loan.sol";

contract SystemFeeds {

    System public system;
    PeggedToken public peggedToken;
    address public systemLoansAddress;
    uint256 public firstTime;

    constructor(
        address _peggedTokenAddress,
        address _systemAddress
    ) public {
        require(address(system) == address(0), "system address should be 0");
        require(_systemAddress != address(0), "_systemAddress should not be 0");
        require(address(peggedToken) == address(0), "peggedToken address should be 0");
        require(_peggedTokenAddress != address(0), "_peggedTokenAddress should not be 0");
        system = System(_systemAddress);
        peggedToken = PeggedToken(_peggedTokenAddress);
        firstTime = system.firstTime();
    }

    function initialize(address _systemLoansAddress) public {
        require(systemLoansAddress == address(0), "systemLoansAddress should be 0");
        require(_systemLoansAddress != address(0), "_systemLoansAddress should not be 0");
        systemLoansAddress = _systemLoansAddress;
    }

    address public lastNewAddress;
    function createPriceFeed() public returns(address newPriceFeedAddress) {
        PriceFeed newPriceFeed = new PriceFeed(msg.sender, address(system));
        newPriceFeedAddress = address(newPriceFeed);
        priceFeedMap[newPriceFeedAddress].isPriceFeed = true;
        priceFeedMap[newPriceFeedAddress].finalizedStateIndex = MAX_UINT32;
        priceFeedMap[newPriceFeedAddress].processingStateIndex = MAX_UINT32;
        lastNewAddress = newPriceFeedAddress;
        return newPriceFeedAddress;
    }

    function isPriceFeed(address _priceFeedAddress) public returns (bool) {
        return priceFeedMap[_priceFeedAddress].isPriceFeed;
    }

    mapping (address => PriceFeedState) public priceFeedMap;
    struct PriceFeedState {
        bool isPriceFeed;
        bool isBanned;
        uint32 finalizedStateIndex;
        uint32 processingStateIndex;
        uint32 lastPriceDay;
        uint32 lastPenaltyDay;
        uint256 totalAllocation;
        //uint256 totalDownVote;
        uint256 revenuePoolBalance;
        uint256 lastEthPrice;
        //uint256 lastPegPrice;
        //uint256 lastPriceTime;
    }

    uint32 public finalizedDay = MAX_UINT32;
    uint32 constant MAX_UINT32 = uint32(2 ** 32 - 1);

    function reportInstantPrice(PriceFeed.InstantPrice memory _instantPrice) public {
        require(priceFeedMap[msg.sender].isPriceFeed, "caller address should be a valid price feed");
        require(priceFeedMap[msg.sender].finalizedStateIndex != MAX_UINT32, "caller feed should be in finalized medium trust list");

        system.reportInstantPrice(msg.sender, _instantPrice);
    }

    function reportDelayedPrices(PriceFeed.DelayedPrice memory delayedPrice) public {
        require(priceFeedMap[msg.sender].isPriceFeed, "caller address sholuld be a valid price feed");

        priceFeedMap[msg.sender].lastEthPrice = delayedPrice.ethPrice;
        //priceFeedMap[msg.sender].lastPegPrice = delayedPrice.pegPrice;
        //priceFeedMap[msg.sender].lastPriceTime = delayedPrice.priceTime;

        processDelayedPrice(delayedPrice);
    }

    uint32 constant SECONDS_PER_DAY = 86400; // SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY = 60 * 60 * 24
    uint32 constant public HIGH_TRUST_FEEDS = 5; // Maximum number of high trust price feeds
    uint32 constant public MEDIUM_TRUST_FEEDS = 25; // Maximum number of medium trust price feeds
    uint32 constant public PROCESS_LISTS = 2;
    FeedProcessState[MEDIUM_TRUST_FEEDS] public feedProcessingStateList;
    struct FeedProcessState {
        address priceFeedAddress;
        uint256 rankingMetric;
        uint256 totalAllocation;
        uint256 ethPrice;
        uint256 pegPrice;
        bool isProcessed;
    }

    function tryFinalizeDelayedPrices() private {
        //uint32 priceDay = uint32((block.timestamp - firstTime) / SECONDS_PER_DAY);
        //require(finalizedDay == MAX_UINT32 || finalizedDay < priceDay, "price day occurs after last finalized day");
        uint256 callTime = block.timestamp;
        uint32 priceDay = uint32((callTime - firstTime) / SECONDS_PER_DAY) - 1;

       // Decide if we need to finalize the last day we were processing
        if (finalizedDay + 1 < priceDay || (finalizedDay == MAX_UINT32 && 0 < priceDay)) {
            // 1. Finalize last processing/processed day (commonly 1 day before price day = 2 days ago)
            uint32 i = 0;
            while (i < MEDIUM_TRUST_FEEDS) {
                bool isBannedAndReplaced = false;
                FeedProcessState storage processFinalizedState = feedProcessingStateList[i];
                PriceFeedState storage finalizedFeedState = priceFeedMap[processFinalizedState.priceFeedAddress];
                if(processFinalizedState.priceFeedAddress != address(0)) {
                    if(priceDay - 1 > finalizedFeedState.lastPriceDay) {
                        enforceMissedReportPenalty(priceDay - 1, finalizedFeedState);
                        if(priceDay > 7 + finalizedFeedState.lastPriceDay) {
                            // ToDo - Penalize - all proceeds go to savings pool
                            isBannedAndReplaced = true; // Set flag so we reiterate from same index after replacement
                            finalizedFeedState.isBanned = true;
                            delete feedProcessingStateList[i];
                            for(uint32 n = i; n < MEDIUM_TRUST_FEEDS - 1; n++) {
                                if (feedProcessingStateList[n + 1].priceFeedAddress != address(0)) {
                                    swapFeedStates(n);
                                }
                            }
                            finalizedFeedState.finalizedStateIndex = MAX_UINT32;
                            finalizedFeedState.processingStateIndex = MAX_UINT32;
                        }
                    }
                }

                if(!isBannedAndReplaced) { // If banned and replaced, reiterate on the same index, since it has been swapped by next entry
                    if(processFinalizedState.priceFeedAddress != address(0)) {
                        finalizedFeedState.finalizedStateIndex = i;
                    }
                    i++;
                }
            }

            finalizedDay = priceDay - 1;
            // 2. Send finalized price feed state to monetary system. ToDo - [Rare] Finalize empty (non-initialized) gap days if appropriate - Can I skip this?
            system.finalizePriceFeedState(finalizedDay, feedProcessingStateList);


            // 3. Initialize current price day (1 day ago)
            for (uint32 i = 0; i < MEDIUM_TRUST_FEEDS; i++) {
                if(feedProcessingStateList[i].priceFeedAddress != address(0)) {
                    feedProcessingStateList[i].isProcessed = false;
                }
            }
        }
    }

    function processDelayedPrice(PriceFeed.DelayedPrice memory delayedPrice) private {
        PriceFeedState storage callingFeedState = priceFeedMap[msg.sender];
        require(callingFeedState.isPriceFeed, "caller address sholuld be a valid price feed");
        uint32 priceDay = uint32((delayedPrice.priceTime - firstTime) / SECONDS_PER_DAY);
        require(finalizedDay == MAX_UINT32 || finalizedDay < priceDay, "price day occurs after last finalized day");

        tryFinalizeDelayedPrices();

        // // Decide if we need to finalize the last day we were processing
        // if (finalizedDay + 1 < priceDay || (finalizedDay == MAX_UINT32 && 0 < priceDay)) {
        //     // 1. Finalize last processing/processed day (commonly 1 day before price day = 2 days ago)
        //     uint32 i = 0;
        //     while (i < MEDIUM_TRUST_FEEDS) {
        //         bool isBannedAndReplaced = false;
        //         FeedProcessState storage processFinalizedState = feedProcessingStateList[i];
        //         PriceFeedState storage finalizedFeedState = priceFeedMap[processFinalizedState.priceFeedAddress];
        //         if(processFinalizedState.priceFeedAddress != address(0)) {
        //             if(priceDay - 1 > finalizedFeedState.lastPriceDay) {
        //                 enforceMissedReportPenalty(priceDay - 1, finalizedFeedState);
        //                 if(priceDay > 7 + finalizedFeedState.lastPriceDay) {
        //                     // ToDo - Penalize - all proceeds go to savings pool
        //                     isBannedAndReplaced = true; // Set flag so we reiterate from same index after replacement
        //                     finalizedFeedState.isBanned = true;
        //                     delete feedProcessingStateList[i];
        //                     for(uint32 n = i; n < MEDIUM_TRUST_FEEDS - 1; n++) {
        //                         if (feedProcessingStateList[n + 1].priceFeedAddress != address(0)) {
        //                             swapFeedStates(n);
        //                         }
        //                     }
        //                     finalizedFeedState.finalizedStateIndex = MAX_UINT32;
        //                     finalizedFeedState.processingStateIndex = MAX_UINT32;
        //                 }
        //             }
        //         }

        //         if(!isBannedAndReplaced) { // If banned and replaced, reiterate on the same index, since it has been swapped by next entry
        //             if(processFinalizedState.priceFeedAddress != address(0)) {
        //                 finalizedFeedState.finalizedStateIndex = i;
        //             }
        //             i++;
        //         }
        //     }

        //     finalizedDay = priceDay - 1;
        //     // 2. Send finalized price feed state to monetary system. ToDo - [Rare] Finalize empty (non-initialized) gap days if appropriate - Can I skip this?
        //     system.finalizePriceFeedState(finalizedDay, feedProcessingStateList);


        //     // 3. Initialize current price day (1 day ago)
        //     for (uint32 i = 0; i < MEDIUM_TRUST_FEEDS; i++) {
        //         if(feedProcessingStateList[i].priceFeedAddress != address(0)) {
        //             feedProcessingStateList[i].isProcessed = false;
        //         }
        //     }
        // }

        callingFeedState.lastPriceDay = priceDay; // Processing now so last posted on current price day

        // Continue processing yesterday's price feed states based on current historical price report
        if(callingFeedState.totalAllocation != 0 && !callingFeedState.isBanned) { // Skip if the current feed has no allocation
            uint256 averageRevenueBalance = totalRegisteredRevenueBalances / MEDIUM_TRUST_FEEDS;
            FeedProcessState memory feedProcessState; // Set up feed state to what it will be after it is initialized
            feedProcessState.ethPrice = delayedPrice.ethPrice;
            feedProcessState.pegPrice = delayedPrice.pegPrice;
            feedProcessState.priceFeedAddress = msg.sender;
            feedProcessState.rankingMetric = callingFeedState.totalAllocation * (callingFeedState.revenuePoolBalance + averageRevenueBalance);
            feedProcessState.totalAllocation = callingFeedState.totalAllocation;
            feedProcessState.isProcessed = true;

            // Ensure current feed state is in the appropriate place on list
            uint32 startIndex = uint32(MEDIUM_TRUST_FEEDS); // the price feed state does not fit on the array
            if(callingFeedState.processingStateIndex == MAX_UINT32) { // If feed state is not in the list start from the bottom
                uint32 i = MEDIUM_TRUST_FEEDS - 1;
                while(i >= 0) {
                    if(feedProcessingStateList[i].priceFeedAddress == address(0)) { // Skip if current state index is not empty
                        if(i == 0 || feedProcessingStateList[i-1].priceFeedAddress != address(0)) { // If reacehd first non-empty state or at top of empty list, set calling price feed state
                            callingFeedState.processingStateIndex = i;
                            feedProcessingStateList[i] = feedProcessState;
                            startIndex = i;
                        }
                    }
                    if(i != 0) {i--;} else {break;}
                }
            } else {
                // If feed state is already in the list, just start there
                startIndex = uint32(callingFeedState.processingStateIndex);
                require(feedProcessingStateList[startIndex].isProcessed == false, "cannot report the same price twice in a day");
                feedProcessingStateList[startIndex] = feedProcessState;
            }

            if(startIndex != 0) {  // Skip if we are starting at top of list
                // Bubble sort down any feed state that has less total allocation than current node
                uint32 m = startIndex - 1;
                while(m >= 0) {
                    PriceFeedState storage m_priceFeedState = priceFeedMap[feedProcessingStateList[m].priceFeedAddress];
                    if(feedProcessState.rankingMetric > m_priceFeedState.totalAllocation * (m_priceFeedState.revenuePoolBalance + averageRevenueBalance)) {
                        for(uint32 n = m; n < startIndex - 1; n++) {
                            PriceFeedState storage n_priceFeedState = priceFeedMap[feedProcessingStateList[n].priceFeedAddress];
                            PriceFeedState storage n_1_priceFeedState = priceFeedMap[feedProcessingStateList[n + 1].priceFeedAddress];
                            if(n_1_priceFeedState.totalAllocation * (n_1_priceFeedState.revenuePoolBalance + averageRevenueBalance) > n_priceFeedState.totalAllocation * (n_priceFeedState.revenuePoolBalance + averageRevenueBalance)) {
                                swapFeedStates(n);
                            }
                        }
                    }
                    if(m != 0) {m--;} else {break;}
                }

                // In the case where list was already full, place it on bottom of sorted list if total allocation is greater
                if (startIndex == MEDIUM_TRUST_FEEDS) {
                    PriceFeedState storage last_priceFeedState = priceFeedMap[feedProcessingStateList[MEDIUM_TRUST_FEEDS - 1].priceFeedAddress];
                    if (feedProcessState.rankingMetric > last_priceFeedState.totalAllocation * (last_priceFeedState.revenuePoolBalance + averageRevenueBalance)) {
                        feedProcessingStateList[MEDIUM_TRUST_FEEDS - 1] = feedProcessState;
                        startIndex = MEDIUM_TRUST_FEEDS - 1;
                    }
                }

                // Bubble up the current feed state as long as it has a greater allocation total
                if(startIndex < MEDIUM_TRUST_FEEDS) {
                    while(startIndex != 0) {
                        // Check if we can move up in list, compare total allocation with entry right above
                        PriceFeedState storage s_1_priceFeedState = priceFeedMap[feedProcessingStateList[startIndex - 1].priceFeedAddress];
                        if(feedProcessState.rankingMetric > s_1_priceFeedState.totalAllocation * (s_1_priceFeedState.revenuePoolBalance + averageRevenueBalance)) {
                            swapFeedStates(startIndex - 1);
                            startIndex--; // Move up in list
                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }

    function enforceMissedReportPenalty(uint256 dayBeingFinalized, PriceFeedState memory _priceFeedStruct) private {
        if(_priceFeedStruct.lastPriceDay < dayBeingFinalized) {
            if(_priceFeedStruct.lastPriceDay > _priceFeedStruct.lastPenaltyDay) {
                _priceFeedStruct.lastPenaltyDay = _priceFeedStruct.lastPriceDay;
            }
            uint256 totalPenalty;
            for(uint256 i = _priceFeedStruct.lastPenaltyDay + 1; i <= dayBeingFinalized; i++) {
                uint256 dayPenalty = _priceFeedStruct.revenuePoolBalance * (i - _priceFeedStruct.lastPriceDay) * 3 / 100;
                totalPenalty += dayPenalty;
            }

            //TODO: Re-enable this for penalize logic to work.
            // _priceFeedStruct.revenuePoolBalance -= totalPenalty;
            // SystemSavings systemSavings = SystemSavings(systemSavingsAddress);
            // peggedToken.transfer(address(systemSavings), totalPenalty);
            // systemSavings.registerSavingsPoolTransfer(totalPenalty);

            // uint256 currentCurrencyBalance = peggedToken.balanceOf(address(this));
            // require (totalRegisteredRevenueBalances <= currentCurrencyBalance, "currency balance should be greater than registered amount");
        }
    }

    function swapFeedStates(uint32 index) private {
        // Swap feed state structs
        FeedProcessState memory currentFeedState = feedProcessingStateList[index];
        feedProcessingStateList[index] = feedProcessingStateList[index + 1];
        feedProcessingStateList[index + 1] = currentFeedState;

        // Update price feed map initialized index
        priceFeedMap[feedProcessingStateList[index].priceFeedAddress].processingStateIndex = index;
        priceFeedMap[feedProcessingStateList[index + 1].priceFeedAddress].processingStateIndex = index + 1;
    }

    uint32 constant public MAX_ALLOCATIONS = 5; // Maximum loan price feed allocations

    function getPriceFromAllocation(Loan.PriceFeedAllocation[MAX_ALLOCATIONS] memory _priceFeedAllocations) public returns (uint256) {
        uint256 sum;
        uint256 allocationSum;
        for (uint256 i = 0; i < 5; i++) {
            Loan.PriceFeedAllocation memory feedAllocation = _priceFeedAllocations[i];
            PriceFeedState memory priceFeedState = priceFeedMap[feedAllocation.priceFeedAddress];
            if(feedAllocation.isAllocation) {
                if(priceFeedState.lastEthPrice != 0) {
                    sum += priceFeedState.lastEthPrice * feedAllocation.percentAllocation;
                    allocationSum += feedAllocation.percentAllocation;
                }
            }
        }

        if(allocationSum != 0) {
            return sum / allocationSum;
        } else {return 0;}
    }

    uint256 public totalRegisteredRevenueBalances;

    function registerFeedRevenueTransfer(address _priceFeedAddress, uint256 _transferValue) public {
        require(systemLoansAddress != address(0), "systemLoansAddress should be initialized");
        require(msg.sender == systemLoansAddress, "caller must be system loans contract");
        require(priceFeedMap[_priceFeedAddress].isPriceFeed, "_priceFeedAddress sholuld be a valid price feed");

        priceFeedMap[_priceFeedAddress].revenuePoolBalance += _transferValue;
        totalRegisteredRevenueBalances += _transferValue;

        uint256 currentCurrencyBalance = peggedToken.balanceOf(address(this));
        require (totalRegisteredRevenueBalances <= currentCurrencyBalance, "currency balance should be greater than registered amount");
    }


    function changePriceFeedAllocation(address _priceFeedAddress, uint256 _value, bool isDecrement) public {
        require(systemLoansAddress != address(0), "systemLoansAddress should be initialized");
        require(msg.sender == systemLoansAddress, "caller must be system loans contract");
        require(priceFeedMap[_priceFeedAddress].isPriceFeed, "_priceFeedAddress sholuld be a valid price feed");
        if(isDecrement) {
            priceFeedMap[_priceFeedAddress].totalAllocation -= _value;
        } else {
            priceFeedMap[_priceFeedAddress].totalAllocation += _value;
        }
    }


    // function changeDownVoteAllocation(address _priceFeedAddress, uint256 _value, bool isDecrement) public {
    //     require(systemLoansAddress != address(0), "systemLoansAddress should be initialized");
    //     require(msg.sender == systemLoansAddress, "caller must be system loans contract");
    //     require(priceFeedMap[_priceFeedAddress].isPriceFeed, "_priceFeedAddress sholuld be a valid price feed");
    //     if(isDecrement) {
    //         priceFeedMap[_priceFeedAddress].totalDownVote -= _value;
    //     }
    //     else {
    //         priceFeedMap[_priceFeedAddress].totalDownVote += _value;
    //     }
    // }

    event ConsoleLog(string message);
    event ConsoleLogNumber(uint number);
}