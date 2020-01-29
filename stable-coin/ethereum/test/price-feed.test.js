const TestPriceFeedController = artifacts.require("TestPriceFeedController");

contract('PriceFeed', accounts => {  
    let helpers = require("./helpers.js");
    let exceptions = require("./exceptions.js");
    let contracts, users;
    let defaultPriceFeed;

    before(async function () {
        contracts = await helpers.ensureContractsDeployed();
        users = helpers.getUsers(accounts);

        let ethPrice = 200.0;
        let pegPrice = 1.0;
        let ethDeposit = 1.23456;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));
        
        defaultPriceFeed = await helpers.windDownAndBootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice);
     });

    // See [External account controller](./scenarios.md#external-account-controller)
    it('can be created by external user', async () => {
        await contracts.systemFeeds.createPriceFeed({ from: users.priceFeedOwner })
        const newPriceFeedAddress = await contracts.systemFeeds.lastNewAddress.call()
        const newPriceFeed = await helpers.PriceFeed.at(newPriceFeedAddress)

        let readOwnerAddress = await newPriceFeed.owner.call()
        assert.equal(users.priceFeedOwner, readOwnerAddress)

        let priceFeedStruct = await contracts.systemFeeds.priceFeedMap.call(newPriceFeed.address)
        let isPriceFeed = priceFeedStruct.isPriceFeed
        assert.isTrue(isPriceFeed)

        const priceFeedSystemAddress = await newPriceFeed.system.call()
        assert.equal(contracts.system.address, priceFeedSystemAddress)
    });

    // See [Contract controller](./scenarios.md#contract-controller)
    it('can be created by controller contract', async () => {
        const priceFeedControllerOwner = users.priceFeedOwner;
        const testPriceFeedController = await TestPriceFeedController.new(contracts.systemFeeds.address, { from: priceFeedControllerOwner })

        let readControllerOwnerAddress = await testPriceFeedController.owner.call()
        assert.equal(users.priceFeedOwner, readControllerOwnerAddress)

        let readPriceFeedAddress = await testPriceFeedController.priceFeed.call()
        let newPriceFeed = await helpers.PriceFeed.at(readPriceFeedAddress)

        let priceFeedStruct = await contracts.systemFeeds.priceFeedMap.call(readPriceFeedAddress)
        let isPriceFeed = priceFeedStruct.isPriceFeed
        assert.isTrue(isPriceFeed)

        const priceFeedSystemAddress = await newPriceFeed.system.call()
        assert.equal(contracts.system.address, priceFeedSystemAddress)

        let priceTime = await helpers.advanceOneDay();
        const delayedPrice = helpers.getDelayedPriceStruct(200.0, 1.0, priceTime)
        await testPriceFeedController.reportDelayedPrices(delayedPrice, { from: priceFeedControllerOwner })
    });

    // See [Feed reporting delayed prices](./scenarios.md#feed-reporting-delayed-prices)
    it('can be used to report delayed prices', async () => {
        let ethPrice = 200.0;
        let pegPrice = 1.1;
        let ethDeposit = 1.2345678;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));

        // Bootstrap the price feed by reporting initial prices, and allocating issuance using a new loan 
        let newPriceFeed = await helpers.bootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice);

        // Report prices for the next day
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);

        // Verify the price feed general state
        let priceFeedStruct = await helpers.getFeedState(contracts, newPriceFeed)
        assert.equal(helpers.toOnChainDouble(ethPrice), priceFeedStruct.lastEthPrice);

        // Verify the processing state index is valid
        let stateIndex = parseInt(priceFeedStruct.processingStateIndex.toString());
        assert.isTrue(stateIndex >= 0 && stateIndex < helpers.MEDIUM_TRUST_FEEDS);

        // Verify the processing state contents
        let feedState = await helpers.getProcessingState(contracts, stateIndex);
        assert.equal(helpers.toOnChainString(ethPrice), feedState.ethPrice);
        assert.equal(helpers.toOnChainString(pegPrice), feedState.pegPrice);
        assert.equal(newPriceFeed.address, feedState.priceFeedAddress);
        assert.equal(true, feedState.isProcessed);
    });

    // See [Feed reporting instant prices](./scenarios.md#feed-reporting-instant-prices)
    it('can be used to report instant prices', async () => {
        let ethPrice = 200.0;
        let instantEthPrice = 210.2;
        let pegPrice = 1.2;
        let ethDeposit = 12.3456789;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));

        // Bootstrap the price feed by reporting initial prices, and allocating issuance using a new loan 
        let newPriceFeed = await helpers.bootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice);

        // Report prices for the next day to finalize processing previous day
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);

        let [instantReportingState, instantPrice] = await helpers.getInstantPriceAndState(contracts);
        assert.equal(helpers.InstantReportingState.Empty, instantReportingState);
        assert.equal(0, instantPrice)

        await newPriceFeed.reportInstantPrice(helpers.toOnChainString(instantEthPrice), { from: users.priceFeedOwner });
     
        ([instantReportingState, instantPrice] = await helpers.getInstantPriceAndState(contracts));
        assert.equal(helpers.InstantReportingState.Stable, instantReportingState);
        assert.equal(helpers.toOnChainDouble(instantEthPrice), instantPrice)
    });

    // See [Price feed trust transitions](./scenarios.md#price-feed-trust-transitions)
    it('can transition up in trust order then transition down', async () => {
        let ethPrice = 200.0;
        let pegPrice = 1.0;
        let ethDeposit = 1.2345678;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));
        let otherEthDeposit = 2.2345678;
        let otherCurrencyIssuance = helpers.roundPrice(otherEthDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));
        let additionalEthDeposit = 2.0;
        let additionalCurrencyIssuance = helpers.roundPrice(additionalEthDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));
       
        const priceFeed = await helpers.createPriceFeed(contracts, users)
        const otherPriceFeed = await helpers.createPriceFeed(contracts, users)
        let loan = await helpers.createLoanDepositAndIssue(contracts, users, ethDeposit, currencyIssuance, priceFeed);
        let otherLoan = await helpers.createLoanDepositAndIssue(contracts, users, otherEthDeposit, otherCurrencyIssuance, otherPriceFeed);

        // Verify that the price feed is not part of trusted feed list
        let priceFeedState = await helpers.getFeedState(contracts, priceFeed);
        assert.equal(priceFeedState.finalizedStateIndex, 2 ** 32 - 1)
        assert.equal(priceFeedState.processingStateIndex, 2 ** 32 - 1)

        let priceTime = await helpers.advanceOneDay()
        await helpers.reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime)
        await helpers.reportDelayedPrice(users, otherPriceFeed, ethPrice, pegPrice, priceTime)

        // Verify that price feed is now part of processing trusted feed list
        let [finalizedFeedState, processingFeedState] = await helpers.getFeedProcessStates(contracts, priceFeed);
        await helpers.getFeedProcessStates(contracts, otherPriceFeed);        
        assert.equal(undefined, finalizedFeedState)
        assert.equal(priceFeed.address, processingFeedState.priceFeedAddress)

        let additionalLoan = await helpers.createLoanDepositAndIssue(contracts, users, additionalEthDeposit, additionalCurrencyIssuance, priceFeed);
        priceTime = await helpers.advanceOneDay()
        await helpers.reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime)
        await helpers.reportDelayedPrice(users, otherPriceFeed, ethPrice, pegPrice, priceTime);

        // Verify that price feed is higher than the other price feed in trusted list
        priceFeedState = await helpers.getFeedState(contracts, priceFeed);
        let otherPriceFeedState = await helpers.getFeedState(contracts, otherPriceFeed);
        assert.isTrue(priceFeedState.processingStateIndex < otherPriceFeedState.processingStateIndex);

        priceTime = await helpers.advanceOneDay()
        await additionalLoan.returnCurrency(helpers.toOnChainString(additionalCurrencyIssuance - 0.1), {from: users.loanOwner})
        await otherLoan.returnCurrency(helpers.toOnChainString(0.1), {from: users.loanOwner})
        await helpers.reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime)
        await helpers.reportDelayedPrice(users, otherPriceFeed, ethPrice, pegPrice, priceTime);

        // Verify that price feed is now lower than the other price feed in trusted list
        priceFeedState = await helpers.getFeedState(contracts, priceFeed);
        otherPriceFeedState = await helpers.getFeedState(contracts, otherPriceFeed);
        assert.isTrue(priceFeedState.processingStateIndex > otherPriceFeedState.processingStateIndex);   
    });

    // See [Price feed banning](./scenarios.md#price-feed-banning)
    it('can ban feeds that skip more than a week', async () => {
        let ethPrice = 200.0;
        let pegPrice = 1.1;
        let ethDeposit = 1.2345678;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));
        let otherEthDeposit = 2.2345678;
        let otherCurrencyIssuance = helpers.roundPrice(otherEthDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));
    
        const priceFeed = await helpers.createPriceFeed(contracts, users)
        const otherPriceFeed = await helpers.createPriceFeed(contracts, users)
        let priceTime = await helpers.latestTimestamp() - helpers.SECONDS_PER_DAY;
        await helpers.reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime)
        await helpers.reportDelayedPrice(users, otherPriceFeed, ethPrice, pegPrice, priceTime)
        await helpers.createLoanDepositAndIssue(contracts, users, ethDeposit, currencyIssuance, priceFeed);
        await helpers.createLoanDepositAndIssue(contracts, users, otherEthDeposit, otherCurrencyIssuance, otherPriceFeed);

        // Get the price feeds into the trusted feed list
        priceTime = await helpers.advanceOneDay()
        await helpers.reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime)
        await helpers.reportDelayedPrice(users, otherPriceFeed, ethPrice, pegPrice, priceTime)

        // Report prices after 4 days
        priceTime = await helpers.advanceTime(helpers.SECONDS_PER_DAY * 4) - helpers.SECONDS_PER_DAY;
        await helpers.reportDelayedPrice(users, otherPriceFeed, ethPrice, pegPrice, priceTime)

        // Report prices after 4 days
        priceTime = await helpers.advanceTime(helpers.SECONDS_PER_DAY * 4) - helpers.SECONDS_PER_DAY;
        await helpers.reportDelayedPrice(users, otherPriceFeed, ethPrice, pegPrice, priceTime)

        // Verify the feed that reports every 4 days is not banned, one that skips 8 days is banned
        let priceFeedState = await helpers.getFeedState(contracts, priceFeed);
        let otherPriceFeedState = await helpers.getFeedState(contracts, otherPriceFeed);
        assert.equal(true, priceFeedState.isBanned);
        assert.equal(false, otherPriceFeedState.isBanned);

        priceTime = await helpers.advanceOneDay()
        await helpers.reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime)
        await helpers.reportDelayedPrice(users, otherPriceFeed, ethPrice, pegPrice, priceTime)

        priceFeedState = await helpers.getFeedState(contracts, priceFeed);
        assert.equal(priceFeedState.finalizedStateIndex, 2 ** 32 - 1)
        assert.equal(priceFeedState.processingStateIndex, 2 ** 32 - 1)
   });
}); 