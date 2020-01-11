pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./System.sol";
import "./PriceFeed.sol";

contract SystemFeeds {

    //address public systemAddress;
    System public system;
    address public systemLoansAddress;
    uint256 public firstTime;

    constructor(
        address _systemAddress
    ) public {
        require(_systemAddress != address(0), "_systemAddress should not be 0");
        system = System(_systemAddress);
        firstTime = system.firstTime();
    }

    function initialize(address _systemLoansAddress) public {
        require(systemLoansAddress == address(0), "systemLoansAddress should be 0");
        systemLoansAddress = _systemLoansAddress;
    }

    uint32 constant SECONDS_PER_DAY = 86400; // SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY = 60 * 60 * 24
    uint32 constant DAYS_PER_WEEK = 7;
    uint32 constant WEEKS_PER_PERIOD = 5; // 35 days = ~1 month
    uint32 constant PERIODS_PER_PERIOD2S = 5; // 175 days = ~0.48 years
    uint32 constant PERIOD2S_PER_PERIOD3S = 5; // 875 days = ~2.4 years
    uint32 constant PERIOD3S_PER_PERIOD4S = 5; // 4378 days = ~12 years
    uint32 constant PERIOD4S_PER_PERIOD5S = 5; // 21875 days = ~60 years

    uint256 public callTime;
    function setCallTime() private {
        callTime = block.timestamp;
    }

    address public lastNewAddress;

    function createPriceFeed() public returns(address newPriceFeedAddress) {
        emit ConsoleLog(">SystemFeeds.createPriceFeed");

        PriceFeed newPriceFeed = new PriceFeed(msg.sender, address(system));
        newPriceFeedAddress = address(newPriceFeed);
        priceFeedMap[newPriceFeedAddress].isPriceFeed = true;
        priceFeedMap[newPriceFeedAddress].finalizedStateIndex = -1;
        priceFeedMap[newPriceFeedAddress].initializedStateIndex = -1;
        lastNewAddress = newPriceFeedAddress;
        return newPriceFeedAddress;
    }

    mapping (address => PriceFeedStruct) public priceFeedMap;
    struct PriceFeedStruct {
        bool isPriceFeed;
        uint256 totalAllocation;
        uint256 totalDownVote;
        int32 finalizedStateIndex;
        int32 initializedStateIndex;
        uint8 daysSkipped;
    }

    uint32 public finalizedDay;

    function postHistoricalPrice(PriceFeed.HistoricalPrice memory historicalPrice) public {
        emit ConsoleLog(">SystemFeeds.postHistoricalPrice");
        require(priceFeedMap[msg.sender].isPriceFeed, "sender should be valid price feed contract");
        setCallTime();

        processHistoricalPrice(historicalPrice);
    }

    uint256 constant public PRICE_RATE_DECIMALS = 10;
    uint32 constant public HIGH_TRUST_FEED_COUNT = 5; // Maximum number of high trust price feeds
    uint32 constant public MEDIUM_TRUST_FEED_COUNT = 25; // Maximum number of medium trust price feeds
    uint32 constant public FEED_LISTS_COUNT = 2; //
    PriceFeedState[FEED_LISTS_COUNT][MEDIUM_TRUST_FEED_COUNT] public priceFeedStateLists;
    struct PriceFeedState {
        address priceFeedAddress;
        uint256 totalAllocation;
        bool isFinalized;
    }

   //function processHistoricalPrice(HistoricalPrice memory historicalPrice) private {
   function processHistoricalPrice(PriceFeed.HistoricalPrice memory historicalPrice) private {
        // uint32 callDay = uint32((callTime - firstTime) / SECONDS_PER_DAY);
        // require(callDay = priceDay + 1, "price day is a day before call day")
        uint32 priceDay = uint32((historicalPrice.priceTime - firstTime) / SECONDS_PER_DAY);
        require(finalizedDay < priceDay, "price day occurs on or before last finalized day");

        uint32 j = uint32(priceDay % 2); // initializedListIndex

//if(flippedState % 2 == 0) {
emit ConsoleLog(">SystemFeeds.processHistoricalPrice");


        if (finalizedDay + 1 < priceDay) // Decide if we need to finalize the last initialized day and initialize another
        {
emit ConsoleLog("finalizedDay + 1 < priceDay");

            // 1. Finalize last initialized day (commonly 2 days ago or before = 1 day before price day or before)
            uint32 finalizeListIndex = uint32((finalizedDay + 1) % 2); //Finalized list index
            //  1.a. Ensure last finalized feed state list is duplicated, is ready for nextinitialization
            for (uint32 i = 0; i < MEDIUM_TRUST_FEED_COUNT; i++) {
                if(priceFeedStateLists[i][j].priceFeedAddress != address(0)) {
                    if(!priceFeedStateLists[i][j].isFinalized) {
                        priceFeedMap[priceFeedStateLists[i][j].priceFeedAddress].daysSkipped++;
                        priceFeedStateLists[i][j].isFinalized = true;
                        // ToDo - Issue a penalty for skipping a single days - consider giving some of the slashing to calling feed's pool for gas cost
                        // ToDo - After 2 days of skipping, flag and remove from list for 7 days, all proceeds go to savings pool
                    }
                }
                priceFeedStateLists[i][(finalizeListIndex + 1) % 2] = priceFeedStateLists[i][finalizeListIndex]; // Copy old finalized entry to current finalized entry
                if(priceFeedStateLists[i][finalizeListIndex].priceFeedAddress != address(0)) {
                    priceFeedMap[priceFeedStateLists[i][finalizeListIndex].priceFeedAddress].finalizedStateIndex = int32(i);
                }
            }

            finalizedDay = priceDay - 1;

            // 2. ToDo - [Rare] Finalize empty (non-initialized) gap days if appropriate - Can I skip this?
            //  2.a. Do not modify state array

            // 3. Initialize current price day (1 day ago)
            //  3.a. Reset indexes and use the copied state array, to start initializing
            for (uint32 i = 0; i < MEDIUM_TRUST_FEED_COUNT; i++) {
                if(priceFeedStateLists[i][j].priceFeedAddress != address(0)) {
                    priceFeedStateLists[i][j].isFinalized = false;
                }
            }
        }

//}
//if(flippedState % 2 == 0) {

        // Continue processing yesterday's price feed states based on current historical price report
        priceFeedMap[msg.sender].daysSkipped = 0; // Processing now so cumulative days skipped is 0
        if(priceFeedMap[msg.sender].totalAllocation != 0) { // Skip if the current feed has no allocation
            uint32 startIndex;
            if(priceFeedMap[msg.sender].initializedStateIndex == -1) { // If feed state is not in the list start from the bottom
                startIndex = uint32(MEDIUM_TRUST_FEED_COUNT); // the price feed state does not fit on the array
                for (int32 i = int32(MEDIUM_TRUST_FEED_COUNT - 1); i >= 0; i--) { // Iterate through initialized feed states starting from calling feed's posistion or the bottom
                    if(priceFeedStateLists[uint32(i)][j].priceFeedAddress == address(0)) { // Skip if current state index is not empty
                        if(i == 0 || priceFeedStateLists[uint32(i)-1][j].priceFeedAddress != address(0)) { // If reacehd first non-empty state or at top of empty list, set calling price feed state
                            priceFeedStateLists[uint32(i)][j].priceFeedAddress = msg.sender;
                            priceFeedStateLists[uint32(i)][j].totalAllocation = priceFeedMap[msg.sender].totalAllocation;
                            priceFeedMap[msg.sender].initializedStateIndex = int32(i);
                            priceFeedStateLists[uint32(i)][j].isFinalized = true;
                            startIndex = uint32(i);
                        }
                    }
                }
            } else { // If feed state is already in the list, start there
                startIndex = uint32(priceFeedMap[msg.sender].initializedStateIndex);
                require(priceFeedStateLists[startIndex][j].isFinalized == false, "cannot report the same price twice in a day");
                priceFeedStateLists[startIndex][j].isFinalized = true;
                priceFeedStateLists[startIndex][j].totalAllocation = priceFeedMap[msg.sender].totalAllocation;
            }

            for (int32 i = int32(startIndex); i >= 0; i--) { // Iterate through initialized feed states starting from calling feed's posistion or the bottom
                if(priceFeedStateLists[uint32(i)][j].priceFeedAddress == address(0)) { // Skip if current state index is not empty
                    if(i == 0 || priceFeedStateLists[uint32(i)-1][j].priceFeedAddress != address(0)) { // If reacehd first non-empty state or at top of empty list, set calling price feed state
                        priceFeedStateLists[uint32(i)][j].priceFeedAddress = msg.sender;
                        priceFeedStateLists[uint32(i)][j].totalAllocation = priceFeedMap[msg.sender].totalAllocation;
                        priceFeedMap[msg.sender].initializedStateIndex = int32(i);
                        priceFeedStateLists[uint32(i)][j].isFinalized = true;
                    }
                }

                if(i > 0 && priceFeedStateLists[uint32(i)][j].priceFeedAddress == msg.sender) { // Skip if calling feed state failed to advance to this point, or if we reached top of list
                    if(priceFeedMap[msg.sender].totalAllocation > priceFeedMap[priceFeedStateLists[uint32(i)-1][j].priceFeedAddress].totalAllocation) { // Skip bubbling feed state up if total allocation is not greater than next entry
                        swapFeedStates(j, uint32(i));
                    }
                }
            }
        }
    }

    function swapFeedStates(uint32 listIndex, uint32 index) private {
        emit ConsoleLog(">swapFeedStates listIndex index");
        emit ConsoleLog(uint2str(uint256(listIndex)));
        emit ConsoleLog(uint2str(uint256(index)));
        require(priceFeedStateLists[index][listIndex].priceFeedAddress != address(0), "swapped feed state i cannot be empty");
        require(priceFeedStateLists[index-1][listIndex].priceFeedAddress != address(0), "swapped feed state i-1 cannot be empty");

        // Swap feed state structs
        PriceFeedState memory currentFeedState = priceFeedStateLists[index][listIndex];
        priceFeedStateLists[index][listIndex] = priceFeedStateLists[index - 1][listIndex];
        priceFeedStateLists[index - 1][listIndex] = currentFeedState;

        // Update price feed map initialized index
        priceFeedMap[priceFeedStateLists[index][listIndex].priceFeedAddress].initializedStateIndex = int32(index);
        priceFeedMap[priceFeedStateLists[index - 1][listIndex].priceFeedAddress].initializedStateIndex = int32(index - 1);
    }

    function isPriceFeed(address _priceFeedAddress) public returns (bool) {
        return priceFeedMap[_priceFeedAddress].isPriceFeed;
    }

    function incrementPriceFeedAllocation(address _priceFeedAddress, uint256 _value) public {
        require(msg.sender == systemLoansAddress, "caller must be system loans contract");
        require(priceFeedMap[_priceFeedAddress].isPriceFeed, "_priceFeedAddress sholuld be a valid price feed");
        priceFeedMap[_priceFeedAddress].totalAllocation += _value;
    }

    function decrementPriceFeedAllocation(address _priceFeedAddress, uint256 _value) public {
        require(msg.sender == systemLoansAddress, "caller must be system loans contract");
        require(priceFeedMap[_priceFeedAddress].isPriceFeed, "_priceFeedAddress sholuld be a valid price feed");
        priceFeedMap[_priceFeedAddress].totalAllocation -= _value;
    }

    function incrementDownVote(address _priceFeedAddress, uint256 _value) public {
        require(msg.sender == systemLoansAddress, "caller must be system loans contract");
        require(priceFeedMap[_priceFeedAddress].isPriceFeed, "_priceFeedAddress sholuld be a valid price feed");
        priceFeedMap[_priceFeedAddress].totalDownVote += _value;
    }

    function decrementDownVote(address _priceFeedAddress, uint256 _value) public {
        require(msg.sender == systemLoansAddress, "caller must be system loans contract");
        require(priceFeedMap[_priceFeedAddress].isPriceFeed, "_priceFeedAddress sholuld be a valid price feed");
        priceFeedMap[_priceFeedAddress].totalDownVote -= _value;
    }

    function getInstantRate() public returns (uint256) {
        require(msg.sender == systemLoansAddress, "caller must be system loans contract");
        return priceFeed_latestInstantPrice.medianEthRate;
    }

    PriceFeed.InstantPrice[HIGH_TRUST_FEED_COUNT] public priceFeed_latestInstantPrices;
    PriceFeed.InstantPrice public priceFeed_latestInstantPrice;

    function postInstantPrice(PriceFeed.InstantPrice memory _instantPrice) public {
        require(priceFeedMap[msg.sender].isPriceFeed, "sender should be valid price feed contract");
        priceFeed_latestInstantPrice = _instantPrice;
    }

    /// @dev Used for debugging
    uint public flippedState;
    function flipState() public {
        emit ConsoleLog(">SystemFeeds.flipState");
        flippedState++;
        // if(flippedState % 2 == 0) {
    }

    /// @dev Used for debugging
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

    /// @dev Used for debugging
    function char(byte b) public pure returns (byte c) {
        if (uint8(b) < 10) return byte(uint8(b) + 0x30);
        else return byte(uint8(b) + 0x57);
    }

    /// @dev Used for debugging
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

    /// @dev Used for debugging
    event ConsoleLog(string message);
}