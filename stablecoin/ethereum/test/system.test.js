contract('System', accounts => {
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

    it('can record system variables from only one feed', async () => {
        let ethPrice = 200.0;
        let pegPrice = 1.0;
        let ethDeposit = 1.2345678;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));

        // Bootstrap the price feed by reporting initial prices, and allocating issuance using a new loan 
        let newPriceFeed = await helpers.bootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice);

        // Report prices for the next day
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);
 
        let lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        let lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
  
        assert.equal(helpers.toOnChainDouble(ethPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.ethPrice));
        assert.equal(helpers.toOnChainDouble(pegPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.pegPrice));
        assert.equal(lastFinalizedDay.toString(), lastFinalizedSystemVariables.startDay.toString());

        // Report prices for the next day
        let ethPrice2 = 199.0;
        let pegPrice2 = 1.0;
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice2, pegPrice2);
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice2, pegPrice2);

        lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
    
        assert.equal(helpers.toOnChainDouble(ethPrice2), helpers.roundOnChainPrice(lastFinalizedSystemVariables.ethPrice));
        assert.equal(helpers.toOnChainDouble(pegPrice2), helpers.roundOnChainPrice(lastFinalizedSystemVariables.pegPrice));
        assert.equal(lastFinalizedDay.toString(), lastFinalizedSystemVariables.startDay.toString());
    });

    it('can record system variables from two feeds', async () => {
        let ethPrice = 200.0;
        let pegPrice = 1.0;
        let ethPrice2 = 210.0;
        let pegPrice2 = 1.0;
        let ethDeposit = 1.2345678;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));

        // Bootstrap the price feed by reporting initial prices, and allocating issuance using a new loan 
        let newPriceFeed = await helpers.windDownAndBootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice);
        let newPriceFeed2 = await helpers.createPriceFeed(contracts, users)
        await helpers.createLoanDepositAndIssue(contracts, users, ethDeposit, currencyIssuance, newPriceFeed2);
        // Report prices for the next day
        let priceTime = await helpers.advanceOneDay()
        await helpers.reportDelayedPrice(users, newPriceFeed, ethPrice, pegPrice, priceTime);
        await helpers.reportDelayedPrice(users, newPriceFeed2, ethPrice2, pegPrice2, priceTime);
 
        let lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        let lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
        let priceStateEnum = helpers.getEnumFromOnChain(helpers.DelayedPriceReportingState, lastFinalizedSystemVariables.priceState);
  
        assert.equal(helpers.toOnChainDouble(ethPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.ethPrice));
        assert.equal(helpers.toOnChainDouble(pegPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.pegPrice));
        assert.equal(lastFinalizedDay.toString(), lastFinalizedSystemVariables.startDay.toString());
        assert.equal(helpers.DelayedPriceReportingState.Stable, priceStateEnum);

        // Report prices for the next day

        priceTime = await helpers.advanceOneDay()
        await helpers.reportDelayedPrice(users, newPriceFeed, ethPrice, pegPrice, priceTime);
        await helpers.reportDelayedPrice(users, newPriceFeed2, ethPrice2, pegPrice2, priceTime);

        lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
        priceStateEnum = helpers.getEnumFromOnChain(helpers.DelayedPriceReportingState, lastFinalizedSystemVariables.priceState);

        assert.equal(helpers.toOnChainDouble(ethPrice2 + ethPrice) / 2, helpers.roundOnChainPrice(lastFinalizedSystemVariables.ethPrice));
        assert.equal(helpers.toOnChainDouble(pegPrice2 + pegPrice) / 2, helpers.roundOnChainPrice(lastFinalizedSystemVariables.pegPrice));
        assert.equal(lastFinalizedDay.toString(), lastFinalizedSystemVariables.startDay.toString());
        assert.equal(helpers.DelayedPriceReportingState.Stable, priceStateEnum);   
    });

    function generateArray(baseNumber, increment, frequency = helpers.MEDIUM_TRUST_FEEDS) {
        let array = [];
        for (let i = 0; i < frequency; i++) {
            array[i] = baseNumber + i * increment;
        }
        return array;
    }

    it('can record system variables from 25 feeds', async () => {
        let priceFeedCount = 25;
        let ethPrices = generateArray(200.0, 1.0, priceFeedCount)
        let pegPrices = generateArray(1.0, 0.01, priceFeedCount)
        let ethDeposit = 0.012345678;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrices[0] / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));
        let priceFeeds = [];

        priceFeeds[0] = await helpers.windDownAndBootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrices[0], pegPrices[0]);
        for (let i = 1; i < ethPrices.length; i++) {
            priceFeeds[i] = await helpers.createPriceFeed(contracts, users)
            await helpers.createLoanDepositAndIssue(contracts, users, ethDeposit, currencyIssuance, priceFeeds[i]);
        }

        let priceTime = await helpers.advanceOneDay()
        for (let i = 0; i < ethPrices.length; i++) {
            await helpers.reportDelayedPrice(users, priceFeeds[i], ethPrices[i], pegPrices[i], priceTime);
        }
 
        let lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        let lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
        let priceStateEnum = helpers.getEnumFromOnChain(helpers.DelayedPriceReportingState, lastFinalizedSystemVariables.priceState);
  
        assert.equal(helpers.toOnChainDouble(ethPrices[0]), helpers.roundOnChainPrice(lastFinalizedSystemVariables.ethPrice));
        assert.equal(helpers.toOnChainDouble(pegPrices[0]), helpers.roundOnChainPrice(lastFinalizedSystemVariables.pegPrice));
        assert.equal(lastFinalizedDay.toString(), lastFinalizedSystemVariables.startDay.toString());
        assert.equal(helpers.DelayedPriceReportingState.Stable, priceStateEnum);

        priceTime = await helpers.advanceOneDay()
        for (let i = 0; i < ethPrices.length; i++) {
            await helpers.reportDelayedPrice(users, priceFeeds[i], ethPrices[i], pegPrices[i], priceTime);
        }

        lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
        priceStateEnum = helpers.getEnumFromOnChain(helpers.DelayedPriceReportingState, lastFinalizedSystemVariables.priceState);

        // _ + 1  + 2  + 3  + 4  +  _ + _ + _ + _ + _ + 10 + 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + _ + _ + _ + _ + _ + _
        // _ + 10 + 10 + 10 + 10 +  _ + _ + _ + _ + _ + 12 + 11 + 11 + 11 + 11 + 10 + 10 + 10 + 10 + _ + _ + _ + _ + _ + _

        assert.equal(helpers.toOnChainDouble((7 * ethPrices[10] + 6 * ethPrices[11]) / 13), helpers.roundOnChainPrice(lastFinalizedSystemVariables.ethPrice));
        assert.equal(helpers.toOnChainDouble((7 * pegPrices[10] + 6 * pegPrices[11]) / 13), helpers.roundOnChainPrice(lastFinalizedSystemVariables.pegPrice));
        assert.equal(lastFinalizedDay.toString(), lastFinalizedSystemVariables.startDay.toString());
        assert.equal(helpers.DelayedPriceReportingState.Unstable, priceStateEnum);   
    });

    it('can handle overdemand of currency', async () => {
        let ethPrice = 200.0;
        let pegPrice = 1.10;
        let ethDeposit = 1.2345678;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));

        // Bootstrap the price feed by reporting initial prices, and allocating issuance using a new loan 
        let newPriceFeed = await helpers.bootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice);

        // Report prices for the next day
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);
 
        let lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        let lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
  
        assert.equal(helpers.toOnChainDouble(ethPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.ethPrice));
        assert.equal(helpers.toOnChainDouble(pegPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.pegPrice));
        assert.equal(lastFinalizedDay.toString(), lastFinalizedSystemVariables.startDay.toString());

        console.log(`>ETH price: ${lastFinalizedSystemVariables.ethPrice} - Peg price: ${lastFinalizedSystemVariables.pegPrice}`)
        console.log(`Loan fee: ${lastFinalizedSystemVariables.loansFeeRate} - Feed revenue rate: ${lastFinalizedSystemVariables.feedsRevenueRate} - Interest rate: ${lastFinalizedSystemVariables.savingsInterestRate}`)
        console.log(`Target loan fee: ${lastFinalizedSystemVariables.targetLoansFeeRate} - Target interest rate: ${lastFinalizedSystemVariables.targetSavingsInterestRate}`)
        console.log(`Peg equilibrium metric: ${lastFinalizedSystemVariables.pegEquilibriumMetric} - Instability days in row: ${lastFinalizedSystemVariables.instabilityDaysInRow}`)

        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);

        lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
    
        assert.equal(helpers.toOnChainDouble(ethPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.ethPrice));
        assert.equal(helpers.toOnChainDouble(pegPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.pegPrice));
        assert.equal(lastFinalizedDay.toString(), lastFinalizedSystemVariables.startDay.toString());

        console.log(`>ETH price: ${lastFinalizedSystemVariables.ethPrice} - Peg price: ${lastFinalizedSystemVariables.pegPrice}`)
        console.log(`Loan fee: ${lastFinalizedSystemVariables.loansFeeRate} - Feed revenue rate: ${lastFinalizedSystemVariables.feedsRevenueRate} - Interest rate: ${lastFinalizedSystemVariables.savingsInterestRate}`)
        console.log(`Target loan fee: ${lastFinalizedSystemVariables.targetLoansFeeRate} - Target interest rate: ${lastFinalizedSystemVariables.targetSavingsInterestRate}`)
        console.log(`Peg equilibrium metric: ${lastFinalizedSystemVariables.pegEquilibriumMetric} - Instability days in row: ${lastFinalizedSystemVariables.instabilityDaysInRow}`)
 
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);
        lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
        console.log(`>ETH price: ${lastFinalizedSystemVariables.ethPrice} - Peg price: ${lastFinalizedSystemVariables.pegPrice}`)
        console.log(`Loan fee: ${lastFinalizedSystemVariables.loansFeeRate} - Feed revenue rate: ${lastFinalizedSystemVariables.feedsRevenueRate} - Interest rate: ${lastFinalizedSystemVariables.savingsInterestRate}`)
        console.log(`Target loan fee: ${lastFinalizedSystemVariables.targetLoansFeeRate} - Target interest rate: ${lastFinalizedSystemVariables.targetSavingsInterestRate}`)
        console.log(`Peg equilibrium metric: ${lastFinalizedSystemVariables.pegEquilibriumMetric} - Instability days in row: ${lastFinalizedSystemVariables.instabilityDaysInRow}`)
 
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);
        lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
        console.log(`>ETH price: ${lastFinalizedSystemVariables.ethPrice} - Peg price: ${lastFinalizedSystemVariables.pegPrice}`)
        console.log(`Loan fee: ${lastFinalizedSystemVariables.loansFeeRate} - Feed revenue rate: ${lastFinalizedSystemVariables.feedsRevenueRate} - Interest rate: ${lastFinalizedSystemVariables.savingsInterestRate}`)
        console.log(`Target loan fee: ${lastFinalizedSystemVariables.targetLoansFeeRate} - Target interest rate: ${lastFinalizedSystemVariables.targetSavingsInterestRate}`)
        console.log(`Peg equilibrium metric: ${lastFinalizedSystemVariables.pegEquilibriumMetric} - Instability days in row: ${lastFinalizedSystemVariables.instabilityDaysInRow}`)
    });

    it('can handle oversupply of currency', async () => {
        let ethPrice = 200.0;
        let pegPrice = 0.90;
        let ethDeposit = 1.2345678;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));

        // Bootstrap the price feed by reporting initial prices, and allocating issuance using a new loan 
        let newPriceFeed = await helpers.bootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice);

        // Report prices for the next day
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);
 
        let lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        let lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
  
        assert.equal(helpers.toOnChainDouble(ethPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.ethPrice));
        assert.equal(helpers.toOnChainDouble(pegPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.pegPrice));
        assert.equal(lastFinalizedDay.toString(), lastFinalizedSystemVariables.startDay.toString());

        console.log(`>ETH price: ${lastFinalizedSystemVariables.ethPrice} - Peg price: ${lastFinalizedSystemVariables.pegPrice}`)
        console.log(`Loan fee: ${lastFinalizedSystemVariables.loansFeeRate} - Feed revenue rate: ${lastFinalizedSystemVariables.feedsRevenueRate} - Interest rate: ${lastFinalizedSystemVariables.savingsInterestRate}`)
        console.log(`Target loan fee: ${lastFinalizedSystemVariables.targetLoansFeeRate} - Target interest rate: ${lastFinalizedSystemVariables.targetSavingsInterestRate}`)
        console.log(`Peg equilibrium metric: ${lastFinalizedSystemVariables.pegEquilibriumMetric} - Instability days in row: ${lastFinalizedSystemVariables.instabilityDaysInRow}`)

        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);

        lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
    
        assert.equal(helpers.toOnChainDouble(ethPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.ethPrice));
        assert.equal(helpers.toOnChainDouble(pegPrice), helpers.roundOnChainPrice(lastFinalizedSystemVariables.pegPrice));
        assert.equal(lastFinalizedDay.toString(), lastFinalizedSystemVariables.startDay.toString());

        console.log(`>ETH price: ${lastFinalizedSystemVariables.ethPrice} - Peg price: ${lastFinalizedSystemVariables.pegPrice}`)
        console.log(`Loan fee: ${lastFinalizedSystemVariables.loansFeeRate} - Feed revenue rate: ${lastFinalizedSystemVariables.feedsRevenueRate} - Interest rate: ${lastFinalizedSystemVariables.savingsInterestRate}`)
        console.log(`Target loan fee: ${lastFinalizedSystemVariables.targetLoansFeeRate} - Target interest rate: ${lastFinalizedSystemVariables.targetSavingsInterestRate}`)
        console.log(`Peg equilibrium metric: ${lastFinalizedSystemVariables.pegEquilibriumMetric} - Instability days in row: ${lastFinalizedSystemVariables.instabilityDaysInRow}`)
 
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);
        lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
        console.log(`>ETH price: ${lastFinalizedSystemVariables.ethPrice} - Peg price: ${lastFinalizedSystemVariables.pegPrice}`)
        console.log(`Loan fee: ${lastFinalizedSystemVariables.loansFeeRate} - Feed revenue rate: ${lastFinalizedSystemVariables.feedsRevenueRate} - Interest rate: ${lastFinalizedSystemVariables.savingsInterestRate}`)
        console.log(`Target loan fee: ${lastFinalizedSystemVariables.targetLoansFeeRate} - Target interest rate: ${lastFinalizedSystemVariables.targetSavingsInterestRate}`)
        console.log(`Peg equilibrium metric: ${lastFinalizedSystemVariables.pegEquilibriumMetric} - Instability days in row: ${lastFinalizedSystemVariables.instabilityDaysInRow}`)
 
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice);
        lastFinalizedDay = await contracts.system.lastFinalizedDay.call();
        lastFinalizedSystemVariables = await contracts.system.dailySystemVariables.call(lastFinalizedDay % 7);
        console.log(`>ETH price: ${lastFinalizedSystemVariables.ethPrice} - Peg price: ${lastFinalizedSystemVariables.pegPrice}`)
        console.log(`Loan fee: ${lastFinalizedSystemVariables.loansFeeRate} - Feed revenue rate: ${lastFinalizedSystemVariables.feedsRevenueRate} - Interest rate: ${lastFinalizedSystemVariables.savingsInterestRate}`)
        console.log(`Target loan fee: ${lastFinalizedSystemVariables.targetLoansFeeRate} - Target interest rate: ${lastFinalizedSystemVariables.targetSavingsInterestRate}`)
        console.log(`Peg equilibrium metric: ${lastFinalizedSystemVariables.pegEquilibriumMetric} - Instability days in row: ${lastFinalizedSystemVariables.instabilityDaysInRow}`)
    });

    // it('can handle depleting savings pool during overdemand', async () => {
    // it('can handle multiple oversupply and undersupply cycles', async () => {
}); 