const PeggedToken = artifacts.require("PeggedToken");
const System = artifacts.require("System");
const SystemFeeds = artifacts.require("SystemFeeds");
const SystemLoans = artifacts.require("SystemLoans");
const Loan = artifacts.require("Loan");
const TestLoanController = artifacts.require("TestLoanController");
const PriceFeed = artifacts.require("PriceFeed");
const TOKEN_DECIMALS = 18;
const RATE_DECIMALS = 6;
const MAX_ALLOCATIONS = 5;
const ALLOCATION_100_PERCENT = 100;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract('Loan', accounts => {
    const systemCreator = accounts[0];
    const moneyUser = accounts[1];    
    const loanOwner = accounts[2];
    const priceFeedOwner = accounts[3];
    let system, peggedToken, systemFeeds, systemLoans;
    let defaultPriceFeed, secondPriceFeed, defaultAllocations, multiAllocations

    before(async function () {
        system = await System.deployed()
        systemFeeds = await SystemFeeds.deployed()
        systemLoans = await SystemLoans.deployed()
        peggedToken = await PeggedToken.deployed()

        // console.log("\t>System address: " + system.address)
        // console.log("\t>SystemFeeds address: " + systemFeeds.address)
        // console.log("\t>SystemLoans address: " + systemLoans.address)
        // console.log("\t>PeggedToken address: " + peggedToken.address)

        defaultPriceFeed = await createPriceFeed();
        let timestamp = await latestTimestamp()
        const instantPrice = { medianEthRate : 200 * 10 ** 10, priceTime : timestamp , callTime: timestamp }
        await defaultPriceFeed.postInstantPrice(instantPrice, {from: priceFeedOwner})
        const latestInstantPrice = await systemFeeds.priceFeed_latestInstantPrice.call()
        //assert.equal(200 * 10 ** RATE_DECIMALS, latestInstantPrice.value.toString())  

        const defaultAllocation = getAllocation(defaultPriceFeed.address.toString(), 100)
        defaultAllocations = getAllocations(defaultAllocation)

        secondPriceFeed = await createPriceFeed();
        const allocation1 = getAllocation(defaultPriceFeed.address.toString(), 71)
        const allocation2 = getAllocation(secondPriceFeed.address.toString(), 29)
        multiAllocations = getAllocations(allocation1, allocation2)
    });

    const emptyAllocation = {priceFeedAddress: ZERO_ADDRESS, percentAllocation: 0, isAllocation: false };
    function getAllocation(address, allocation, isAllocation = true) { return {priceFeedAddress: address, percentAllocation: allocation, isAllocation: isAllocation } }
    function getAllocations(allocation1 , allocation2 = emptyAllocation, allocation3 = emptyAllocation, allocation4 = emptyAllocation, allocation5 = emptyAllocation) { return [allocation1, allocation2, allocation3, allocation4, allocation5] }

    async function createPriceFeed()
    {
        await systemFeeds.createPriceFeed({from: priceFeedOwner})
        newPriceFeedAddress = await systemFeeds.lastNewAddress.call()  
        const priceFeed = await PriceFeed.at(newPriceFeedAddress)
        // console.log("\t>new PriceFeed address: " + priceFeed.address)

        return priceFeed
    }    

    it('can be created by external account', async () => {       
        const newLoan = await createLoan()
        let readOwnerAddress = await newLoan.owner.call()
        assert.equal(loanOwner, readOwnerAddress)

        let isLoan = await systemLoans.loanMap.call(newLoan.address)
        assert.isTrue(isLoan)

        const loanSystemLoansAddress = await newLoan.systemLoans.call()
        const loanSystemAddress = await newLoan.system.call()
        assert.equal(system.address, loanSystemAddress)
        assert.equal(system.address, loanSystemAddress)
    });

    async function createLoan()
    {
        await systemLoans.createLoan({from: loanOwner})
        const newLoanAddress = await systemLoans.lastNewAddress.call()                
        const newLoan = await Loan.at(newLoanAddress)
        return newLoan;
    }

    it('can be created by controller contract', async () => {   
        const loanControllerOwner = loanOwner;
        const testLoanController = await TestLoanController.new(systemLoans.address, { from: loanControllerOwner })

        let readLoanOwnerAddress = await testLoanController.owner.call()
        assert.equal(loanOwner, readLoanOwnerAddress)

        let readLoanAddress = await testLoanController.loan.call()
        let newLoan = await Loan.at(readLoanAddress)

        let loanStruct = await systemLoans.loanMap.call(newLoan.address)
        let isLoan = loanStruct
        assert.isTrue(isLoan)

        const loanSystemAddress = await newLoan.system.call()
        assert.equal(system.address, loanSystemAddress)

        let _ethValue = 123456

        await testLoanController.allocatePriceFeeds(multiAllocations, {from: loanControllerOwner});
        await testLoanController.depositEth({ value: _ethValue, from: loanControllerOwner })

        const loanEthBalance = await web3.eth.getBalance(newLoan.address)
        assert.equal(_ethValue, loanEthBalance)
    });

    it('can allocate price feeds after creation', async () => {
        const newLoan = await createLoan(123456)

        const old_loan_priceFeedAllocation1 = await systemFeeds.priceFeedMap(defaultPriceFeed.address.toString());
        const old_loan_priceFeedAllocationNumber1 = old_loan_priceFeedAllocation1.totalAllocation;
        const old_loan_priceFeedAllocation2 = await systemFeeds.priceFeedMap(secondPriceFeed.address.toString());
        const old_loan_priceFeedAllocationNumber2 = old_loan_priceFeedAllocation2.totalAllocation;
        const old_depositTotal = await systemLoans.depositTotal.call()

        await newLoan.allocatePriceFeeds(multiAllocations, {from: loanOwner});
        
        const new_loan_priceFeedAllocation1 = await systemFeeds.priceFeedMap(defaultPriceFeed.address.toString());
        const new_loan_priceFeedAllocationNumber1 = new_loan_priceFeedAllocation1.totalAllocation;
        const new_loan_priceFeedAllocation2 = await systemFeeds.priceFeedMap(secondPriceFeed.address.toString());
        const new_loan_priceFeedAllocationNumber2 = new_loan_priceFeedAllocation2.totalAllocation;
        const new_depositTotal = await systemLoans.depositTotal.call()

        assert.equal(0, new_loan_priceFeedAllocationNumber1 - old_loan_priceFeedAllocationNumber1);
        assert.equal(0, new_loan_priceFeedAllocationNumber2 - old_loan_priceFeedAllocationNumber2);
        assert.equal(0, new_depositTotal - old_depositTotal);
    });

    it('can deposit ETH with multiple allocated price feeds', async () => {
        const _ethValue = 123456
        const old_depositTotal = await systemLoans.depositTotal.call()
        const old_loan_priceFeedAllocation1 = await systemFeeds.priceFeedMap(defaultPriceFeed.address.toString());
        const old_loan_priceFeedAllocationNumber1 = old_loan_priceFeedAllocation1.totalAllocation.toString();
        const old_loan_priceFeedAllocation2 = await systemFeeds.priceFeedMap(secondPriceFeed.address.toString());
        const old_loan_priceFeedAllocationNumber2 = old_loan_priceFeedAllocation2.totalAllocation.toString();
        const newLoan = await createLoanAndDepositEth(_ethValue, true) 

        const loanEthBalance = await web3.eth.getBalance(newLoan.address)
        assert.equal(_ethValue, loanEthBalance)

        const new_depositTotal = await systemLoans.depositTotal.call()
        assert.equal(_ethValue , new_depositTotal - old_depositTotal)

        const loan_priceFeedAllocation1 = await systemFeeds.priceFeedMap(defaultPriceFeed.address.toString());
        const loan_priceFeedAllocationNumber1 = loan_priceFeedAllocation1.totalAllocation.toString();
        assert.equal(parseInt(71 * _ethValue / ALLOCATION_100_PERCENT), loan_priceFeedAllocationNumber1 - old_loan_priceFeedAllocationNumber1);

        const loan_priceFeedAllocation2 = await systemFeeds.priceFeedMap(secondPriceFeed.address.toString());
        const loan_priceFeedAllocationNumber2 = loan_priceFeedAllocation2.totalAllocation.toString();
        assert.equal(parseInt(29 * _ethValue / ALLOCATION_100_PERCENT), loan_priceFeedAllocationNumber2 - old_loan_priceFeedAllocationNumber2);

        // Sum of allocation balances may not equal the final value due to rounding errors.
        // assert.equal(_value, parseInt(loan_priceFeedAllocationNumber1) + parseInt(loan_priceFeedAllocationNumber2))
    });

    it('can deposit ETH then change feed allocation', async () => {
        const _value = 123456
        const newLoan = await createLoanAndDepositEth(_value)

        const old_loan_priceFeedAllocation1 = await systemFeeds.priceFeedMap(defaultPriceFeed.address.toString());
        const old_loan_priceFeedAllocationNumber1 = old_loan_priceFeedAllocation1.totalAllocation;
        const old_loan_priceFeedAllocation2 = await systemFeeds.priceFeedMap(secondPriceFeed.address.toString());
        const old_loan_priceFeedAllocationNumber2 = old_loan_priceFeedAllocation2.totalAllocation;
        const old_depositTotal = await systemLoans.depositTotal.call()

        await newLoan.allocatePriceFeeds(multiAllocations, {from: loanOwner});

        const new_depositTotal = await systemLoans.depositTotal.call()
        assert.equal(0 , new_depositTotal - old_depositTotal) // Deposit pool hasn't
        const loan_priceFeedAllocation1 = await systemFeeds.priceFeedMap(defaultPriceFeed.address.toString());
        const loan_priceFeedAllocationNumber1 = loan_priceFeedAllocation1.totalAllocation;
        assert.equal(parseInt(71 * _value / ALLOCATION_100_PERCENT) - _value, loan_priceFeedAllocationNumber1 - old_loan_priceFeedAllocationNumber1);
        const loan_priceFeedAllocation2 = await systemFeeds.priceFeedMap(secondPriceFeed.address.toString());
        const loan_priceFeedAllocationNumber2 = loan_priceFeedAllocation2.totalAllocation;
        assert.equal(parseInt(29 * _value / ALLOCATION_100_PERCENT), loan_priceFeedAllocationNumber2 - old_loan_priceFeedAllocationNumber2);

        // Sum of allocation balances may not equal the final value due to rounding errors
        // assert.equal(_value, parseInt(loan_priceFeedAllocationNumber1) + parseInt(loan_priceFeedAllocationNumber2))
    });

    async function createLoanAndDepositEth(ethDeposit, isMultiAllocation = false)
    {
        const newLoan = await createLoan()
        await newLoan.allocatePriceFeeds(!isMultiAllocation ? defaultAllocations : multiAllocations, {from: loanOwner});  
        await newLoan.depositEth({value: ethDeposit, from: loanOwner});
        return newLoan;
    }

    it('can be used to issue currency', async () => {
        const old_issuanceTotal = await systemLoans.issuanceTotal.call()

        await createLoanAndIssueCurrency(10 ** 5, 10 ** 7)  

        const issuanceTotal = await systemLoans.issuanceTotal.call()
        assert.equal(10 ** 7 , issuanceTotal - old_issuanceTotal)
    });

    async function createLoanAndIssueCurrency(ethDeposit, issueCurrency)
    {
        const newLoan = await createLoanAndDepositEth(ethDeposit)
        await newLoan.issueCurrency(issueCurrency.toString(),  {from: loanOwner});
        return newLoan;
    }

    it('can be used to issue and transfer currency', async () => {
        const old_moneyUserBalance = await peggedToken.balanceOf(moneyUser);
      
        const newLoan = await createLoanIssueAndWithdrawCurrency(10 ** 5, 10 ** 7, 0.6 * 10 ** 7);

        const new_moneyUserBalance = await peggedToken.balanceOf(moneyUser);
        assert.equal(0.6 * 10 ** 7 , new_moneyUserBalance - old_moneyUserBalance);
        const loanCurrencyBalance = await peggedToken.balanceOf(newLoan.address);
        assert.equal(0.4 * 10 ** 7 , loanCurrencyBalance.toString());

        await newLoan.withdrawCurrency(moneyUser, parseInt(0.4 * 10 ** 7),  {from: loanOwner});

        const newer_moneyUserBalance = await peggedToken.balanceOf(moneyUser);
        assert.equal(10 ** 7 , newer_moneyUserBalance - old_moneyUserBalance);
        const newer_loanCurrencyBalance = await peggedToken.balanceOf(newLoan.address);
        assert.equal(0 , newer_loanCurrencyBalance.toString());
    });

    async function createLoanIssueAndWithdrawCurrency(ethDeposit, issueCurrency, withdrawCurrency)
    {
        const newLoan = await createLoanAndIssueCurrency(ethDeposit, issueCurrency);

        await newLoan.withdrawCurrency(moneyUser, withdrawCurrency,  {from: loanOwner});
        return newLoan;
    }

    it('can be used to deposit and reverse currency issuance', async () => {
        const older_moneyUserBalance = await peggedToken.balanceOf(moneyUser);
        await createLoanIssueAndWithdrawCurrency(10 ** 5, 10 ** 7, 0.6 * 10 ** 7);
        const old_moneyUserBalance = await peggedToken.balanceOf(moneyUser);
        const newLoan = await createLoanIssueAndWithdrawCurrency(10 ** 5, 10 ** 7, 0.6 * 10 ** 7);

        const loanCurrencyBalance = await peggedToken.balanceOf(newLoan.address);
        assert.equal(0.4 * 10 ** 7 , loanCurrencyBalance.toString());

        await peggedToken.transfer(newLoan.address, 1.6 * 10 ** 7, {from: moneyUser})

        const loanCurrencyBalance2 = await peggedToken.balanceOf(newLoan.address);
        assert.equal(2.0 * 10 ** 7, loanCurrencyBalance2.toString())

        await newLoan.returnCurrency(10 ** 7,  {from: loanOwner});

        const loanCurrencyBalance3 = await peggedToken.balanceOf(newLoan.address);
        assert.equal(1.0 * 10 ** 7, loanCurrencyBalance3.toString())

        await newLoan.withdrawCurrency(moneyUser, 10 ** 7,  {from: loanOwner});

        const newer_moneyUserBalance = await peggedToken.balanceOf(moneyUser);
        assert.equal(0.6 * 10 ** 7 , newer_moneyUserBalance - older_moneyUserBalance);
        assert.equal(0 , newer_moneyUserBalance - old_moneyUserBalance);        
        const newer_loanCurrencyBalance = await peggedToken.balanceOf(newLoan.address);
        assert.equal(0 , newer_loanCurrencyBalance.toString());
    });

    it('can be used to withdraw ETH after issuing currency', async () => {
        const newLoan = await createLoanAndIssueCurrency(10 ** 15, 10 ** 17);
        const old_loanOwnerEthBalance = await web3.eth.getBalance(moneyUser)

        await newLoan.withdrawEth(moneyUser, 0.2 * 10 ** 15, {from: loanOwner});

        const new_loanOwnerEthBalance = await web3.eth.getBalance(moneyUser)
        assert.equal(0.2 * 10 ** 15, new_loanOwnerEthBalance - old_loanOwnerEthBalance)
    });

    async function latestTimestamp()
    {
        const latestBlock = await web3.eth.getBlock('latest');
        return parseInt(latestBlock.timestamp);
    }
}); 