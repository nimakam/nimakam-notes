contract('Loan.Negative', accounts => {
    let helpers = require("./helpers.js");
    let catchRevert = require("./exceptions.js").catchRevert;
    let defaultPriceFeed;

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

    // See [Loan negative scenarios](./scenarios.md#loan-negative-scenarios)
    it('is not usable if not created through system', async () => {       
        // Create a loan contract incorrectly in the following ways:
        // 1. Call made directly by user - NOT the system contract 
        // 2. Address passed is not the owner user/contract, it is ZERO_ADDRESS          
        const newLoan = await helpers.Loan.new(users.loanOwner, accounts[6], accounts[7], {from: accounts[8]})
        const newLoanOwner = await newLoan.owner.call()
        const newLoan_System = await newLoan.system.call()
        const newLoan_SystemLoans = await newLoan.systemLoans.call()
        const newLoan_PeggedToken = await newLoan.peggedToken.call()
        assert.equal(users.loanOwner, newLoanOwner)
        assert.equal(accounts[6], newLoan_System)
        assert.equal(accounts[7], newLoan_PeggedToken)
        assert.equal(accounts[8], newLoan_SystemLoans)

        // Expecting any calls made onto the contract to revert
        await catchRevert(newLoan.depositEth({value: helpers.toOnChainString(1.0), from: users.someTestUser}));
        await catchRevert(newLoan.issueCurrency(helpers.toOnChainString(100.0), {from: users.someTestUser}));
    });

    // See [Loan negative scenarios](./scenarios.md#loan-negative-scenarios)
    it('cannot be used by users other than owner', async () => {
        const newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed)
        
        await catchRevert(newLoan.depositEth({value: helpers.toOnChainString(1.0), from: users.someTestUser}));
        await catchRevert(newLoan.issueCurrency(helpers.toOnChainString(100.0), {from: users.someTestUser}));
    });

    // See [Loan negative scenarios](./scenarios.md#loan-negative-scenarios)
    it('cannot be deposited into without price feed allocation', async () => {
        await contracts.systemLoans.createLoan({from: users.loanOwner})
        const newLoanAddress = await contracts.systemLoans.lastNewAddress.call()                
        const newLoan = await helpers.Loan.at(newLoanAddress)
        
        await catchRevert(newLoan.depositEth({value: helpers.toOnChainString(1.0), from: users.loanOwner}));

        const loanEthBalance = await web3.eth.getBalance(newLoan.address)
        assert.equal(0, loanEthBalance.toString())
    });

    // See [Loan negative scenarios](./scenarios.md#loan-negative-scenarios)
    it('cannot issue more currency than allowed by threshold', async () => {
        const newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed)

        await newLoan.depositEth({value: helpers.toOnChainString(1.0), from: users.loanOwner});

        await catchRevert(newLoan.issueCurrency(helpers.toOnChainString(1000.0),  {from: users.loanOwner}));
        await catchRevert(newLoan.issueCurrency(helpers.toOnChainString(134.0),  {from: users.loanOwner}));
    });

    // See [Loan negative scenarios](./scenarios.md#loan-negative-scenarios)
    it('cannot transfer more than issued currency', async () => {
         const newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed)

        await newLoan.depositEth({value: helpers.toOnChainString(1.0), from: users.loanOwner});
        await newLoan.issueCurrency(helpers.toOnChainString(100.0),  {from: users.loanOwner});

        await catchRevert(newLoan.withdrawCurrency(users.moneyUser, helpers.toOnChainString(100.1),  {from: users.loanOwner}));
    });

    // See [Loan negative scenarios](./scenarios.md#loan-negative-scenarios)
    it('cannot return more than issued currency', async () => {
        const newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed)        
        const otherLoan = await helpers.createLoan(contracts, users, defaultPriceFeed)        
        
        await otherLoan.depositEth({value: helpers.toOnChainString(0.1), from: users.loanOwner});
        await otherLoan.issueCurrency(helpers.toOnChainString(10.0),  {from: users.loanOwner});
        await otherLoan.withdrawCurrency(users.moneyUser, helpers.toOnChainString(10.0),  {from: users.loanOwner});
      
        await newLoan.depositEth({value: helpers.toOnChainString(1.0), from: users.loanOwner});
        await newLoan.issueCurrency(helpers.toOnChainString(100.0),  {from: users.loanOwner});
        await contracts.peggedToken.transfer(newLoan.address, helpers.toOnChainString(1.0), {from: users.moneyUser})

        await catchRevert(newLoan.returnCurrency(helpers.toOnChainString(101.0),  {from: users.loanOwner}));
    });

    // See [Loan negative scenarios](./scenarios.md#loan-negative-scenarios)
    it('cannot withdraw more ETH than allowed by threshold', async () => {
        const newLoan = await helpers.createLoan(contracts, users, defaultPriceFeed)        

        await newLoan.depositEth({value: helpers.toOnChainString(1.5), from: users.loanOwner});
        await newLoan.issueCurrency(helpers.toOnChainString(200.0),  {from: users.loanOwner});

        await catchRevert(newLoan.withdrawEth(users.loanOwner, helpers.toOnChainString(0.1), {from: users.loanOwner}));
        await catchRevert(newLoan.withdrawEth(users.loanOwner, helpers.toOnChainString(10.0), {from: users.loanOwner}));
    });
}); 