const PeggedToken = artifacts.require("PeggedToken");
const System = artifacts.require("System");
const SystemFeeds = artifacts.require("SystemFeeds");
const SystemLoans = artifacts.require("SystemLoans");
const PriceFeed = artifacts.require("PriceFeed");
const Loan = artifacts.require("Loan");
const TOKEN_DECIMALS = 18;
const RATE_DECIMALS = 6;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract('Loan.Negative', accounts => {
    const systemCreator = accounts[0];
    const moneyUser = accounts[1];    
    const loanOwner = accounts[2];
    const priceFeedOwner = accounts[3];
    const someTestUser = accounts[9];
    let catchRevert = require("./exceptions.js").catchRevert;
    let system, systemFeeds;
    let defaultAllocations;

    before(async function () {
        system = await System.deployed()
        systemFeeds = await SystemFeeds.deployed()
        systemLoans = await SystemLoans.deployed()

        await systemFeeds.createPriceFeed({from: priceFeedOwner})
        const defaultPriceFeedAddress = await systemFeeds.lastNewAddress.call()   
        const defaultPriceFeed = await PriceFeed.at(defaultPriceFeedAddress)
        let timestamp = await latestTimestamp()
        const instantPrice = { medianEthRate : 200 * 10 ** 10, priceTime : timestamp , callTime: timestamp }

        await defaultPriceFeed.postInstantPrice(instantPrice, {from: priceFeedOwner})      

        const defaultAllocation = getAllocation(defaultPriceFeed.address.toString(), 100)
        defaultAllocations = getAllocations(defaultAllocation)
    });

    const emptyAllocation = {priceFeedAddress: ZERO_ADDRESS, percentAllocation: 0, isAllocation: false };
    function getAllocation(address, allocation, isAllocation = true) { return {priceFeedAddress: address, percentAllocation: allocation, isAllocation: isAllocation } }
    function getAllocations(allocation1 , allocation2 = emptyAllocation, allocation3 = emptyAllocation, allocation4 = emptyAllocation, allocation5 = emptyAllocation) { return [allocation1, allocation2, allocation3, allocation4, allocation5] }

    it('is not usable if not created through system', async () => {       
        // Create a loan contract incorrectly in the following ways:
        // 1. Call made directly by user - NOT the system contract 
        // 2. Address passed is not the owner user/contract, it is ZERO_ADDRESS          
        const newLoan = await Loan.new(accounts[5], accounts[6], accounts[7], {from: accounts[8]})
        const newLoanOwner = await newLoan.owner.call()
        const newLoan_System = await newLoan.system.call()
        const newLoan_SystemLoans = await newLoan.systemLoans.call()
        const newLoan_PeggedToken = await newLoan.peggedToken.call()
        assert.equal(accounts[5], newLoanOwner)
        assert.equal(accounts[6], newLoan_System)
        assert.equal(accounts[7], newLoan_PeggedToken)
        assert.equal(accounts[8], newLoan_SystemLoans)

        // Expecting any calls made onto the contract to revert
        await catchRevert(newLoan.depositEth({value: 10 ** 5, from: someTestUser}));
        await catchRevert(newLoan.issueCurrency(10 ** 7, {from: someTestUser}));
    });

    it('cannot be used by users other than owner', async () => {
        const newLoan = await createLoan()
        
        await catchRevert(newLoan.depositEth({value: 10 ** 5, from: someTestUser}));
        await catchRevert(newLoan.issueCurrency(10 ** 7, {from: someTestUser}));
    });

    async function createLoan()
    {
        await systemLoans.createLoan({from: loanOwner})
        const newLoanAddress = await systemLoans.lastNewAddress.call()                
        const newLoan = await Loan.at(newLoanAddress)
        return newLoan;
    }

    it('cannot be deposited into without price feed allocation', async () => {
        const newLoan = await createLoan()
        
        await catchRevert(newLoan.depositEth({value: 10 ** 5, from: loanOwner}));

        const loanEthBalance = await web3.eth.getBalance(newLoan.address)
        assert.equal(0, loanEthBalance.toString())
    });

    it('cannot issue more currency than allowed by threshold', async () => {
        const newLoan = await createLoan()
        await newLoan.allocatePriceFeeds(defaultAllocations, {from: loanOwner});   
        await newLoan.depositEth({value: 10 ** 5, from: loanOwner});

        await catchRevert(newLoan.issueCurrency(10 ** 8,  {from: loanOwner}));
    });

    it('cannot transfer more than issued currency', async () => {
        const newLoan = await createLoan()
        await newLoan.allocatePriceFeeds(defaultAllocations, {from: loanOwner});   
        await newLoan.depositEth({value: 10 ** 5, from: loanOwner});
        newLoan.issueCurrency(10 ** 7,  {from: loanOwner});

        await catchRevert(newLoan.withdrawCurrency(moneyUser, 1.1 * 10 ** 7,  {from: loanOwner}));
    });

    it('cannot reverse issue more than issued currency', async () => {
        const newLoan = await createLoan()        
        await newLoan.allocatePriceFeeds(defaultAllocations, {from: loanOwner});   
        await newLoan.depositEth({value: 10 ** 5, from: loanOwner});
        newLoan.issueCurrency(10 ** 7,  {from: loanOwner});

        await catchRevert(newLoan.returnCurrency(1.1 * 10 ** 7,  {from: loanOwner}));
    });

    it('cannot withdraw more ETH than allowed by threshold', async () => {
        const newLoan = await createLoan()        
        await newLoan.allocatePriceFeeds(defaultAllocations, {from: loanOwner});   
        await newLoan.depositEth({value: 10 ** 5, from: loanOwner});
        newLoan.issueCurrency(10 ** 7,  {from: loanOwner});

        await catchRevert(newLoan.withdrawEth(loanOwner, 10 ** 5, {from: loanOwner}));
    });

    async function latestTimestamp()
    {
        const latestBlock = await web3.eth.getBlock('latest');
        return parseInt(latestBlock.timestamp);
    }
}); 