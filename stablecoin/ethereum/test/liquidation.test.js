const TestLiquidatorAccountController = artifacts.require("TestLiquidatorAccountController");

contract('LiquidatorAccount', accounts => {
    let helpers = require("./helpers.js");
    let exceptions = require("./exceptions.js");
    let contracts, users;
    let defaultPriceFeed, secondPriceFeed, multiAllocations;

    before(async function () {
        contracts = await helpers.ensureContractsDeployed();
        users = helpers.getUsers(accounts);

        let ethPrice = 200.0;
        let pegPrice = 1.0;
        let ethDeposit = 1.23456;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));
        
        defaultPriceFeed = await helpers.windDownAndBootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice);
        
        secondPriceFeed = await helpers.createPriceFeed(contracts, users);
        multiAllocations = helpers.getFeedAllocations(defaultPriceFeed, secondPriceFeed)
    });

    // see 
    it('can be created by external account', async () => {
        const newLiquidatorAccount = await helpers.createLiquidatorAccount(contracts, users)
        let readLiquidatorAccountAddress = await newLiquidatorAccount.owner.call()
        assert.equal(users.liquidatorAccountOwner, readLiquidatorAccountAddress)

        let liquidatorAccountState = await contracts.systemLiquidations.liquidatorAccountMap.call(newLiquidatorAccount.address)
        let isLiquidatorAccount = liquidatorAccountState.isLiquidatorAccount;
        assert.isTrue(isLiquidatorAccount)

        const loanSystemLiquidationsAddress = await newLiquidatorAccount.systemLiquidations.call()
        const loanSystemAddress = await newLiquidatorAccount.system.call()
        assert.equal(contracts.systemLiquidations.address, loanSystemLiquidationsAddress)
        assert.equal(contracts.system.address, loanSystemAddress)
    });

   // see 
   it('can be created by controller contract', async () => {   
        const liquidatorAccountControllerOwner = users.liquidatorAccountOwner;
        const testLiquidatorAccountController = await TestLiquidatorAccountController.new(contracts.systemLiquidations.address, { from: liquidatorAccountControllerOwner })

        let readLiquidatorAccountOwnerAddress = await testLiquidatorAccountController.owner.call()
        assert.equal(users.liquidatorAccountOwner, readLiquidatorAccountOwnerAddress)

        let readLiquidatorAccountAddress = await testLiquidatorAccountController.liquidatorAccount.call()
        let newLiquidatorAccount = await helpers.LiquidatorAccount.at(readLiquidatorAccountAddress)

        let liquidatorAccountState = await contracts.systemLiquidations.liquidatorAccountMap.call(newLiquidatorAccount.address)
        let isLiquidatorAccount = liquidatorAccountState.isLiquidatorAccount;
        assert.isTrue(isLiquidatorAccount)

        const liquidatorAccountSystemAddress = await newLiquidatorAccount.system.call()
        assert.equal(contracts.system.address, liquidatorAccountSystemAddress)

        let ethDeposit = 0.123
        await testLiquidatorAccountController.depositEth({ value: helpers.toOnChainString(ethDeposit), from: liquidatorAccountControllerOwner })
    });

    it('can be liquidated by valid request', async () => {
        let ethPrice_pre = 200.0;
        let ethPrice = 100.0;
        let pegPrice = 1.0;
        let ethDeposit = 1.23;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice_pre / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));

        let newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed);
        await newLoan.depositEth({value: helpers.toOnChainString(ethDeposit), from: users.loanOwner});        
        await newLoan.issueCurrency(helpers.toOnChainString(currencyIssuance), {from: users.loanOwner});
        await newLoan.withdrawCurrency(users.loanOwner, helpers.toOnChainString(currencyIssuance), {from: users.loanOwner});

        await helpers.advanceOneDayAndReportPrice(users, defaultPriceFeed, ethPrice, pegPrice);

        await contracts.peggedToken.transfer(users.someTestUser, currencyIssuance, {from: users.loanOwner})
        await contracts.peggedToken.transfer(newLoan.address, currencyIssuance, {from: users.someTestUser})
        await newLoan.requestLiquidation(currencyIssuance, {from: users.someTestUser})

        await helpers.advanceOneDayAndReportPrice(users, defaultPriceFeed, ethPrice, pegPrice);

        await newLoan.processLiquidations({from: users.someTestUser})

        for (let i = 0; i < 7; i++) {
            await helpers.advanceOneDayAndReportPrice(users, defaultPriceFeed, ethPrice, pegPrice);
        }

        await newLoan.processLiquidations({from: users.someTestUser})
    });
}); 