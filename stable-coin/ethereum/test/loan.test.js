const TestLoanController = artifacts.require("TestLoanController");

contract('Loan', accounts => {
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

    // see [Loan creation agent - external account vs controller contract](./scenarios/#loan-creation-agent---external-account-vs-controller-contract)
    it('can be created by external account', async () => {
        const newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed, secondPriceFeed)
        let readOwnerAddress = await newLoan.owner.call()
        assert.equal(users.loanOwner, readOwnerAddress)

        let isLoan = await contracts.systemLoans.loanMap.call(newLoan.address)
        assert.isTrue(isLoan)

        const loanSystemLoansAddress = await newLoan.systemLoans.call()
        const loanSystemAddress = await newLoan.system.call()
        assert.equal(contracts.systemLoans.address, loanSystemLoansAddress)
        assert.equal(contracts.system.address, loanSystemAddress)
    });

   // see [Loan creation agent - external account vs controller contract](./scenarios/#loan-creation-agent---external-account-vs-controller-contract)
   it('can be created by controller contract', async () => {   
        const loanControllerOwner = users.loanOwner;
        const testLoanController = await TestLoanController.new(contracts.systemLoans.address, { from: loanControllerOwner })

        let readLoanOwnerAddress = await testLoanController.owner.call()
        assert.equal(users.loanOwner, readLoanOwnerAddress)

        let readLoanAddress = await testLoanController.loan.call()
        let newLoan = await helpers.Loan.at(readLoanAddress)

        let loanStruct = await contracts.systemLoans.loanMap.call(newLoan.address)
        let isLoan = loanStruct
        assert.isTrue(isLoan)

        const loanSystemAddress = await newLoan.system.call()
        assert.equal(contracts.system.address, loanSystemAddress)

        let ethDeposit = 1.23
        await testLoanController.allocatePriceFeeds(multiAllocations, {from: loanControllerOwner});
        await testLoanController.depositEth({ value: helpers.toOnChainString(ethDeposit), from: loanControllerOwner })

        const loanEthBalance = await web3.eth.getBalance(newLoan.address)
        assert.equal(helpers.toOnChainDouble(ethDeposit), loanEthBalance)
    });

    // See [Getting a loan](./scenarios.md#getting-a-loan)
    it('can allocate price feeds after creation', async () => {
        const newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed)

        let defaultAllocation_pre = await helpers.getFeedAllocation(contracts, defaultPriceFeed);
        let secondAllocation_pre = await helpers.getFeedAllocation(contracts, secondPriceFeed);
        const depositTotal_pre = await contracts.systemLoans.depositTotal.call()

        await newLoan.allocatePriceFeeds(multiAllocations, {from: users.loanOwner});
        
        let defaultAllocation = await helpers.getFeedAllocation(contracts, defaultPriceFeed);
        let secondAllocation = await helpers.getFeedAllocation(contracts, secondPriceFeed);
        const depositTotal = await contracts.systemLoans.depositTotal.call()

        assert.equal(0, defaultAllocation - defaultAllocation_pre);
        assert.equal(0, secondAllocation - secondAllocation_pre);
        assert.equal(0, depositTotal - depositTotal_pre);
    });

    // See [Getting a loan](./scenarios.md#getting-a-loan)
    it('can deposit ETH with multiple allocated price feeds', async () => {
        let ethDeposit = 1.23;

        let defaultAllocation_pre = await helpers.getFeedAllocation(contracts, defaultPriceFeed);
        let secondAllocation_pre = await helpers.getFeedAllocation(contracts, secondPriceFeed);
        const depositTotal_pre = await contracts.systemLoans.depositTotal.call()
        const issuanceTotal_pre = await contracts.systemLoans.issuanceTotal.call()

        let newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed, secondPriceFeed);
        await newLoan.depositEth({value: helpers.toOnChainString(ethDeposit), from: users.loanOwner});        

        const loanEthBalance = await web3.eth.getBalance(newLoan.address)
        assert.equal(helpers.toOnChainString(ethDeposit), loanEthBalance)

        const depositTotal = await contracts.systemLoans.depositTotal.call()
        let defaultAllocation = await helpers.getFeedAllocation(contracts, defaultPriceFeed);
        let secondAllocation = await helpers.getFeedAllocation(contracts, secondPriceFeed);
        const issuanceTotal = await contracts.systemLoans.issuanceTotal.call()

        assert.equal(helpers.toOnChainString(ethDeposit) , depositTotal - depositTotal_pre)
        assert.equal(0, issuanceTotal - issuanceTotal_pre);
        assert.equal(0, secondAllocation - secondAllocation_pre);
        assert.equal(0, defaultAllocation - defaultAllocation_pre);
    });

    // See [Getting a loan](./scenarios.md#getting-a-loan)
    it('can be used to issue currency with single allocation', async () => {
        let ethPrice = 200.0;
        let ethDeposit = 1.23;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100));

        const issuanceTotal_pre = await contracts.systemLoans.issuanceTotal.call()
        let defaultAllocation_pre = await helpers.getFeedAllocation(contracts, defaultPriceFeed);

        let newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed);
        await newLoan.depositEth({value: helpers.toOnChainString(ethDeposit), from: users.loanOwner});        
        await newLoan.issueCurrency(helpers.toOnChainString(currencyIssuance), {from: users.loanOwner});

        const issuanceTotal = await contracts.systemLoans.issuanceTotal.call()
        let defaultAllocation = await helpers.getFeedAllocation(contracts, defaultPriceFeed);

        assert.equal(issuanceTotal - issuanceTotal_pre, currencyIssuance * 10 ** helpers.PRICE_DECIMALS)
        assert.equal(defaultAllocation - defaultAllocation_pre, helpers.toOnChainString(currencyIssuance));
        
    });

    // See [Getting a loan](./scenarios.md#getting-a-loan)
    it('can be used to issue currency with multiple allocations', async () => {
        let ethPrice = 200.0;
        let ethDeposit = 1.23;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100.0));

        const issuanceTotal_pre = await contracts.systemLoans.issuanceTotal.call()
        let defaultAllocation_pre = await helpers.getFeedAllocation(contracts, defaultPriceFeed);
        let secondAllocation_pre = await helpers.getFeedAllocation(contracts, secondPriceFeed);

        let newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed, secondPriceFeed);
        await newLoan.depositEth({value: helpers.toOnChainString(ethDeposit), from: users.loanOwner});     
        await newLoan.issueCurrency(helpers.toOnChainString(currencyIssuance), {from: users.loanOwner});

        const issuanceTotal = await contracts.systemLoans.issuanceTotal.call()
        let defaultAllocation = await helpers.getFeedAllocation(contracts, defaultPriceFeed);
        let secondAllocation = await helpers.getFeedAllocation(contracts, secondPriceFeed);

        assert.equal(issuanceTotal - issuanceTotal_pre, currencyIssuance * 10 ** helpers.PRICE_DECIMALS)
        assert.equal(defaultAllocation - defaultAllocation_pre, 7 * currencyIssuance * 10 ** helpers.PRICE_DECIMALS / 10);   
        assert.equal(secondAllocation - secondAllocation_pre, 3 * currencyIssuance * 10 ** helpers.PRICE_DECIMALS / 10);
    });

    // see [Custom changes to a loan](./scenarios.md#custom-changes-to-a-loan)
    it('can issue currency then change feed allocation', async () => {
        let ethPrice = 200.0;
        let ethDeposit = 1.23;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100.0));

        const issuanceTotal_pre = await contracts.systemLoans.issuanceTotal.call()
 
        let newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed);
        await newLoan.depositEth({value: helpers.toOnChainString(ethDeposit), from: users.loanOwner});        
 
        let defaultAllocation_pre = await helpers.getFeedAllocation(contracts, defaultPriceFeed);
        let secondAllocation_pre = await helpers.getFeedAllocation(contracts, secondPriceFeed);
 
        await newLoan.issueCurrency(helpers.toOnChainString(currencyIssuance), {from: users.loanOwner});
        await newLoan.allocatePriceFeeds(multiAllocations, {from: users.loanOwner});

        const issuanceTotal = await contracts.systemLoans.issuanceTotal.call()
        let defaultAllocation = await helpers.getFeedAllocation(contracts, defaultPriceFeed);
        let secondAllocation = await helpers.getFeedAllocation(contracts, secondPriceFeed);

        assert.equal(helpers.toOnChainDouble(currencyIssuance), issuanceTotal - issuanceTotal_pre)
        assert.equal(helpers.toOnChainDouble(0.7 * currencyIssuance), defaultAllocation - defaultAllocation_pre);   
        assert.equal(helpers.toOnChainDouble(0.3 * currencyIssuance), secondAllocation - secondAllocation_pre);
    });

    // See [Getting a loan](./scenarios.md#getting-a-loan)
    it('can be used to issue and withdraw currency', async () => {
        let ethPrice = 200.0;
        let ethDeposit = 1.23;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100.0));
        let currencyWithdrawal = helpers.roundPrice(0.6 * currencyIssuance);
        let secondCurrencyWithdrawal = helpers.roundPrice(0.4 * currencyIssuance);

        const moneyUserBalance_pre = await contracts.peggedToken.balanceOf(users.moneyUser);
      
        let newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed);
        await newLoan.depositEth({value: helpers.toOnChainString(ethDeposit), from: users.loanOwner});        
        await newLoan.issueCurrency(helpers.toOnChainString(currencyIssuance), {from: users.loanOwner});
        await newLoan.withdrawCurrency(users.moneyUser, helpers.toOnChainString(currencyWithdrawal), {from: users.loanOwner});

        const moneyUserBalance = await contracts.peggedToken.balanceOf(users.moneyUser);
        const loanCurrencyBalance = await contracts.peggedToken.balanceOf(newLoan.address);

        assert.equal(helpers.toOnChainDouble(currencyWithdrawal), moneyUserBalance - moneyUserBalance_pre);
        assert.equal(helpers.toOnChainDouble(secondCurrencyWithdrawal), loanCurrencyBalance.toString());

        await newLoan.withdrawCurrency(users.moneyUser, helpers.toOnChainString(secondCurrencyWithdrawal),  {from: users.loanOwner});

        const moneyUserBalance_post = await contracts.peggedToken.balanceOf(users.moneyUser);
        const loanCurrencyBalance_post = await contracts.peggedToken.balanceOf(newLoan.address);
        
        assert.equal(helpers.toOnChainDouble(currencyIssuance), moneyUserBalance_post - moneyUserBalance_pre);
        assert.equal(0, loanCurrencyBalance_post.toString());
    });

   // see [Custom changes to a loan](./scenarios.md#custom-changes-to-a-loan)
   // see [Closing a loan](./scenarios#closing-a-loan)
   it('can be used to deposit, issue, withdraw, deposit and return currency', async () => {
        let ethPrice = 200.0;
        let ethDeposit = 1.23;
        let currencyIssuance = helpers.roundPrice(ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100.0));
        let currencyWithdrawal = helpers.roundPrice(0.6 * currencyIssuance);
        let currencyReturn = helpers.roundPrice(0.4 * currencyIssuance);
        let currencyDeposit = helpers.roundPrice(0.1 * currencyIssuance);

        const moneyUserBalance_pre = await contracts.peggedToken.balanceOf(users.moneyUser);
        const issuanceTotal_pre = await contracts.systemLoans.issuanceTotal.call()
      
        let newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed);
        await newLoan.depositEth({value: helpers.toOnChainString(ethDeposit), from: users.loanOwner});        
        await newLoan.issueCurrency(helpers.toOnChainString(currencyIssuance), {from: users.loanOwner});
        await newLoan.withdrawCurrency(users.moneyUser, helpers.toOnChainString(currencyWithdrawal), {from: users.loanOwner});

        const moneyUserBalance = await contracts.peggedToken.balanceOf(users.moneyUser);
        const loanCurrencyBalance = await contracts.peggedToken.balanceOf(newLoan.address);
        const issuanceTotal = await contracts.systemLoans.issuanceTotal.call()
        const currentIssuance = await newLoan.currentIssuance.call()

        assert.equal(helpers.toOnChainDouble(currencyWithdrawal), moneyUserBalance - moneyUserBalance_pre);
        assert.equal(helpers.toOnChainDouble(currencyIssuance - currencyWithdrawal), loanCurrencyBalance.toString());
        assert.equal(helpers.toOnChainDouble(currencyIssuance), currentIssuance.toString());
        assert.equal(helpers.toOnChainDouble(currencyIssuance), issuanceTotal - issuanceTotal_pre);

        await contracts.peggedToken.transfer(newLoan.address, helpers.toOnChainString(currencyDeposit), {from: users.moneyUser});
        await newLoan.returnCurrency(helpers.toOnChainString(currencyReturn),  {from: users.loanOwner});

        const moneyUserBalance_post = await contracts.peggedToken.balanceOf(users.moneyUser);
        const loanCurrencyBalance_post = await contracts.peggedToken.balanceOf(newLoan.address);
        const issuanceTotal_post = await contracts.systemLoans.issuanceTotal.call()        
        const currentIssuance_post = await newLoan.currentIssuance.call()

        assert.equal(helpers.toOnChainDouble(currencyWithdrawal - currencyDeposit), moneyUserBalance_post - moneyUserBalance_pre);
        assert.equal(helpers.toOnChainDouble(currencyDeposit), loanCurrencyBalance_post.toString());
        assert.equal(helpers.toOnChainDouble(currencyReturn), issuanceTotal - issuanceTotal_post);
        assert.equal(helpers.toOnChainDouble(currencyWithdrawal), currentIssuance_post.toString());
    });

   // see [Custom changes to a loan](./scenarios.md#custom-changes-to-a-loan)
   it('can be used to withdraw ETH after issuing currency', async () => {
        let ethPrice = 200.0;
        let ethDeposit = 1.23;
        let currencyIssuance = helpers.roundPrice(0.6 * ethDeposit * ethPrice / (helpers.LEVERAGE_THRESHOLD_PERCENT / 100.0));
        let ethWithdrawal = helpers.roundPrice(0.4 * ethDeposit);

        let newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed);
        await newLoan.depositEth({value: helpers.toOnChainString(ethDeposit), from: users.loanOwner});        
        await newLoan.issueCurrency(helpers.toOnChainString(currencyIssuance), {from: users.loanOwner});

        const loanOwnerEthBalance_pre = await web3.eth.getBalance(users.moneyUser)

        await newLoan.withdrawEth(users.moneyUser, helpers.toOnChainString(ethWithdrawal), {from: users.loanOwner});

        const loanOwnerEthBalance = await web3.eth.getBalance(users.moneyUser)
        assert.equal(helpers.toOnChainDouble(ethWithdrawal), loanOwnerEthBalance - loanOwnerEthBalance_pre)
    });

  

}); 