pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./System.sol";
import "./SystemFeeds.sol";

contract PriceFeed {
    address public owner;
    SystemFeeds public systemFeeds;
    System public system;

    uint32 constant SECONDS_PER_MINUTE = 60;
    uint32 constant MINUTES_PER_HOUR = 60;
    uint32 constant HOURS_PER_DAY = 24;
    uint32 constant SECONDS_PER_DAY = SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY; // 86400
    uint32 constant DAYS_PER_WEEK = 7;
    uint32 constant WEEKS_PER_PERIOD = 5; // 35 days = ~1 month
    uint32 constant PERIODS_PER_PERIOD2S = 5; // 175 days = ~0.48 years
    uint32 constant PERIOD2S_PER_PERIOD3S = 5; // 875 days = ~2.4 years
    uint32 constant PERIOD3S_PER_PERIOD4S = 5; // 4378 days = ~12 years
    uint32 constant PERIOD4S_PER_PERIOD5S = 5; // 21875 days = ~60 years

    uint32 constant ETH_RATE_DECIMALS = 10;
    uint32 constant PEG_RATE_DECIMALS = 10;

    constructor(
        address _owner,
        address _systemAddress
    ) public {
        emit ConsoleLog(">PriceFeed.constructor");

        owner = _owner;
        systemFeeds = SystemFeeds(msg.sender);
        system = System(_systemAddress);
    }

    uint256 public callTime;
    function setCallTime() private
    {
        callTime = block.timestamp;
    }

    HistoricalPrice[DAYS_PER_WEEK] public dailyHistoricalPrices;
    struct HistoricalPrice {
        uint256 medianEthRate;
        uint256 medianPegRate;
        uint256 priceTime;
        uint256 callTime;
    }

    function postHistoricalPrice(
        HistoricalPrice memory historicalPrice
    )
    public
    {
        emit ConsoleLog(">PriceFeed.postHistoricalPrice");
        require(owner == msg.sender, "sender should be owner");
        setCallTime();

        validateHistoricalPriceTiming(historicalPrice);

        systemFeeds.postHistoricalPrice(historicalPrice);
    }

    function validateHistoricalPriceTiming(HistoricalPrice memory historicalPrice) private view
    {
        historicalPrice.callTime = callTime; // set reported time to call time even if it's not properly set

        uint32 call_daysSinceSystemStart = uint32((callTime - system.firstTime()) / SECONDS_PER_DAY);
        uint32 price_daysSinceSystemStart = uint32((historicalPrice.priceTime - system.firstTime()) / SECONDS_PER_DAY);
        require(call_daysSinceSystemStart == price_daysSinceSystemStart + 1, "price should be for 1 day ago");

        // uint32 price_dayOfSystemWeek = (price_daysSinceSystemStart) % DAYS_PER_WEEK;
        // uint32 daysSincePriceLastCallTime = uint32((callTime - dailyHistoricalPrices[price_dayOfSystemWeek].callTime) / SECONDS_PER_DAY);
        // require(daysSincePriceLastCallTime >= 7, "reported time should replace old value");
        // dailyHistoricalPrices[price_dayOfSystemWeek] = historicalPrice; // Assign reported daily price
    }

    InstantPrice public instantPrice;
    struct InstantPrice {
        uint256 medianEthRate;
        uint256 priceTime;
        uint256 callTime;
    }

    function postInstantPrice(InstantPrice memory _instantPrice) public {
        require(owner == msg.sender, "sender should be owner");
        setCallTime();
        _instantPrice.callTime = callTime;

        instantPrice = _instantPrice;

        systemFeeds.postInstantPrice(_instantPrice);
    }

    uint256 public processingWeekStartTime;
    function processTime() public
    {
        setCallTime();

        if (processingWeekStartTime == 0)
        {
            processingWeekStartTime = callTime;
        }

        if (callTime >= processingWeekStartTime + SECONDS_PER_DAY * DAYS_PER_WEEK)
        {
            processingWeekStartTime = ((callTime - system.firstTime()) / (SECONDS_PER_DAY * DAYS_PER_WEEK)) * (SECONDS_PER_DAY * DAYS_PER_WEEK) + system.firstTime();
        }
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