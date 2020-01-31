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

    function reportDelayedPrices(PriceFeed .DelayedPrice memory _historicalPrice) public {
        require(owner == msg.sender, "sender should be owner");

        priceFeed.reportDelayedPrices(_historicalPrice);
    }

    function reportInstantPrice(uint256 ethPrice) public {
        require(owner == msg.sender, "sender should be owner");

        priceFeed.reportInstantPrice(ethPrice);
    }

}