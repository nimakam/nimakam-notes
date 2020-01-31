contract('System.Edge', accounts => {
    let helpers = require("./helpers.js");
    let exceptions = require("./exceptions.js");
    let contracts, users;

    before(async function () {
        contracts = await helpers.ensureContractsDeployed();
        users = helpers.getUsers(accounts);
    });

    // See [Initiating and terminating the system](./scenarios.md#initiating-and-terminating-the-system)
    it('can be wound down and bootstrapped', async () => {
        let ethPrice = 200.0;
        let pegPrice = 1.0;
        let ethDeposit = 1.23456;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));
       
        // Wind down the system by advancing more than a week time and reporting delayed prices
        await helpers.windDownSystem(contracts, users, ethPrice, pegPrice);

        // Verify trusted price feed list is empty by checking the top entry
        let finalizedTopState = await helpers.getFinalizedState(contracts, 0);
        assert.equal(finalizedTopState.priceFeedAddress, helpers.ZERO_ADDRESS);

        // Bootstrap the system by creating feed, allocated loan, issue currency and report prices after a day
        let newPriceFeed = await helpers.bootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice);

        // Verify trusted price feed list is no longer empty by checking the top entry
        let initializedTopState = await helpers.getProcessingState(contracts, 0);
        assert.notEqual(initializedTopState.priceFeedAddress, helpers.ZERO_ADDRESS);

        // Advance one day and report delayed price
        await helpers.advanceOneDayAndReportPrice(users, newPriceFeed, ethPrice, pegPrice)

        // Verify trusted price feed list is no longer empty by checking the top entry
        finalizedTopState = await helpers.getFinalizedState(contracts, 0);
        assert.notEqual(finalizedTopState.priceFeedAddress, helpers.ZERO_ADDRESS);

        // Wind down the system by advancing more than a week time and reporting delayed prices
        await helpers.windDownSystem(contracts, users, ethPrice, pegPrice);

        // Verify trusted price feed list is empty by checking the top entry
        finalizedTopState = await helpers.getFinalizedState(contracts, 0);
        assert.equal(finalizedTopState.priceFeedAddress, helpers.ZERO_ADDRESS);
    });
}); 