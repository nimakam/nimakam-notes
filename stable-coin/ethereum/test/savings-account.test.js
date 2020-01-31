const TestSavingsAccountController = artifacts.require("TestSavingsAccountController");

contract('SavingsAccount', accounts => {
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
        
        ethDeposit = 51.23456;
        currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100), true);
        let currencyWithdrawal = helpers.roundPrice(0.8 * currencyIssuance);
        let currencyReturn = helpers.roundPrice(0.1 * currencyIssuance);

        let newLoan = await helpers.createLoanDepositAndIssue(contracts, users, ethDeposit, currencyIssuance, defaultPriceFeed);
        await newLoan.withdrawCurrency(users.moneyUser, helpers.toOnChainString(currencyWithdrawal), { from : users.loanOwner });
        // Forces loan fee payment which forces savings pool increase - 22.234395353,422487671
        await helpers.advanceTime(helpers.SECONDS_PER_DAY * 30)
        await newLoan.returnCurrency(helpers.toOnChainString(currencyReturn), { from : users.loanOwner });
    });

    // See [External account controller](./scenarios.md#external-account-controller)
    // See [Creating a savings account](./scenarios.md#creating-a-savings-account)
    it('can be created by external user', async () => {
        const newSavingsAccount = await helpers.createSavingsAccount(contracts, users)

        let readOwnerAddress = await newSavingsAccount.owner.call()
        assert.equal(users.moneyUser, readOwnerAddress)

        let isSavingsAccount = await contracts.systemSavings.savingsAccountMap.call(newSavingsAccount.address)
        //let isPriceFeed = priceFeedStruct.isPriceFeed
        assert.isTrue(isSavingsAccount)

        const savingsAccountSystemSavingsAddress = await newSavingsAccount.systemSavings.call()
        assert.equal(contracts.systemSavings.address, savingsAccountSystemSavingsAddress)
    });

    // See [Contract controller](./scenarios.md#contract-controller)
    // See [Creating a savings account](./scenarios.md#creating-a-savings-account)
    it('can be created by controller contract', async () => {
        const savingsAccountControllerOwner = users.moneyUser;
        const testSavingsAccountController = await TestSavingsAccountController.new(contracts.systemSavings.address, { from: savingsAccountControllerOwner })

        let readControllerOwnerAddress = await testSavingsAccountController.owner.call()
        assert.equal(users.moneyUser, readControllerOwnerAddress)

        let readSavingsAccountAddress = await testSavingsAccountController.savingsAccount.call()
        let newSavingsAccount = await helpers.SavingsAccount.at(readSavingsAccountAddress)

        let isSavingsAccount = await contracts.systemSavings.savingsAccountMap.call(readSavingsAccountAddress)
        assert.isTrue(isSavingsAccount)

        const savingsAccountSystemSavingsAddress = await newSavingsAccount.systemSavings.call()
        assert.equal(contracts.systemSavings.address, savingsAccountSystemSavingsAddress)
  
        let currencySavings = 1.23456;
        await contracts.peggedToken.transfer(readSavingsAccountAddress, helpers.toOnChainString(currencySavings), { from : users.moneyUser})
        await testSavingsAccountController.registerCurrencySkipInterest(helpers.toOnChainString(currencySavings), { from: savingsAccountControllerOwner })
    });

    // See [Accumulating interest on savings account](./scenarios.md#accumulating-interest-on-savings-account)
    it('can be used to register currency and accumulate interest', async () => {
        let currencySavings = 123.456;
        let savingsDays = 5 * 7;
        let expectedInterest = currencySavings * savingsDays * 2 / 100 / 365;

        let savingsInterestPool_pre = await contracts.systemSavings.savingsPoolBalance.call();        
        const newSavingsAccount = await helpers.createSavingsAccount(contracts, users)
        await contracts.peggedToken.transfer(newSavingsAccount.address, helpers.toOnChainString(currencySavings), { from: users.moneyUser } )
        let savingsBalance_pre = await contracts.peggedToken.balanceOf(newSavingsAccount.address)

        await newSavingsAccount.registerCurrencySkipInterest(helpers.toOnChainString(currencySavings), { from: users.moneyUser })
        
        // Advance time by the length of savings held
        await helpers.advanceTime(helpers.SECONDS_PER_DAY * savingsDays)
        
        await newSavingsAccount.accumulateInterest({ from: users.moneyUser })

        let savingsBalance = await contracts.peggedToken.balanceOf(newSavingsAccount.address) 
        let savingsInterestPool = await contracts.systemSavings.savingsPoolBalance.call();

        assert.equal(helpers.toOnChainDouble(expectedInterest), helpers.roundOnChainPrice(savingsBalance - savingsBalance_pre));
        assert.equal(helpers.toOnChainDouble(expectedInterest), helpers.roundOnChainPrice(savingsInterestPool_pre - savingsInterestPool));
    });

    // See [Closing a savings account](./scenarios.md#closing-a-savings-account)
    it('can be used to register currency then withdraw all currency with interest', async () => {
        let currencySavings = 123.456;
        let savingsDays = 5 * 7;
        let expectedInterest = currencySavings * savingsDays * 2 / 100 / 365;

        let savingsInterestPool_pre = await contracts.systemSavings.savingsPoolBalance.call();        
        const newSavingsAccount = await helpers.createSavingsAccount(contracts, users)
        await contracts.peggedToken.transfer(newSavingsAccount.address, helpers.toOnChainString(currencySavings), { from: users.moneyUser } )
        let savingsBalance_pre = await contracts.peggedToken.balanceOf(newSavingsAccount.address)
        let moneyUserBalance_pre = await contracts.peggedToken.balanceOf(users.moneyUser)

        await newSavingsAccount.registerCurrencySkipInterest(helpers.toOnChainString(currencySavings), { from: users.moneyUser })

        // Advance time by the length of savings held
        await helpers.advanceTime(helpers.SECONDS_PER_DAY * savingsDays)

        await newSavingsAccount.withdrawAllCurrencyWithInterest(users.moneyUser, { from: users.moneyUser })

        let savingsBalance = await contracts.peggedToken.balanceOf(newSavingsAccount.address) 
        let savingsInterestPool = await contracts.systemSavings.savingsPoolBalance.call();
        let moneyUserBalance = await contracts.peggedToken.balanceOf(users.moneyUser)

        assert.equal(helpers.toOnChainDouble(currencySavings), helpers.roundOnChainPrice(savingsBalance_pre - savingsBalance));
        assert.equal(helpers.toOnChainDouble(expectedInterest), helpers.roundOnChainPrice(savingsInterestPool_pre - savingsInterestPool));
        assert.equal(helpers.toOnChainDouble(expectedInterest + currencySavings), helpers.roundOnChainPrice(moneyUserBalance - moneyUserBalance_pre));
    });
});     