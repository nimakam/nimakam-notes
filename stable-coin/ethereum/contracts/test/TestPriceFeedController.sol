pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "../System.sol";
import "../SystemFeeds.sol";
import "../PriceFeed.sol";

contract TestPriceFeedController {
    address public owner;
    PriceFeed public priceFeed;

    constructor(
        address _systemAddress
    ) public {
        owner = msg.sender;
        System system = System(_systemAddress);
        SystemFeeds systemFeeds = SystemFeeds(address(system.systemFeedsAddress));
        address priceFeedAddress = systemFeeds.createPriceFeed();
        priceFeed = PriceFeed(priceFeedAddress);
    }

    function postHistoricalPrice(PriceFeed.HistoricalPrice memory _historicalPrice) public {
        require(owner == msg.sender, "sender should be owner");

        priceFeed.postHistoricalPrice(_historicalPrice);
    }

    function postInstantPrice(PriceFeed.InstantPrice memory _instantPrice) public {
        require(owner == msg.sender, "sender should be owner");

        priceFeed.postInstantPrice(_instantPrice);
    }

}