contract('PriceFeed.Negative', accounts => {
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

    it('is not usable if not created through system', async () => {
        const newPriceFeed = await helpers.createPriceFeed(contracts, users)

        let readOwnerAddress = await newPriceFeed.owner.call()
        assert.equal(users.priceFeedOwner, readOwnerAddress)

        let priceFeedStruct = await contracts.systemFeeds.priceFeedMap.call(newPriceFeed.address)
        let isPriceFeed = priceFeedStruct.isPriceFeed
        assert.isTrue(isPriceFeed)

        const priceFeedSystemAddress = await newPriceFeed.system.call()
        assert.equal(contracts.system.address, priceFeedSystemAddress)
    });
}); 