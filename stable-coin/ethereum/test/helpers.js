const PeggedToken = artifacts.require("PeggedToken");
const System = artifacts.require("System");
const SystemFeeds = artifacts.require("SystemFeeds");
const SystemLoans = artifacts.require("SystemLoans");
const SystemSavings = artifacts.require("SystemSavings");
const SystemLiquidations = artifacts.require("SystemLiquidations");
const Loan = artifacts.require("Loan");
const PriceFeed = artifacts.require("PriceFeed");
const SavingsAccount = artifacts.require("SavingsAccount");
const LiquidatorAccount = artifacts.require("LiquidatorAccount");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const PRICE_DECIMALS = 18;
const SECONDS_PER_DAY = 86400;
const DAYS_PER_WEEK = 7;
const LEVERAGE_THRESHOLD_PERCENT = 150.0;
const MEDIUM_TRUST_FEEDS = 25;
const HIGH_TRUST_FEEDS = 5;

async function advanceTime(time)
{
    await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [time], id: new Date().getTime()}, (err1) => { if (err1) return reject(err1) } )
    await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", id: new Date().getTime()}, (err1) => { if (err1) return reject(err1) } )
    const latestBlock = await web3.eth.getBlock('latest')
    return latestBlock.timestamp;
}

async function mine()
{
    await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", id: new Date().getTime()}, (err1) => { if (err1) return reject(err1) } )
}

async function latestTimestamp()
{
    const latestBlock = await web3.eth.getBlock('latest');
    return parseInt(latestBlock.timestamp);
}

const emptyAllocation = {priceFeedAddress: ZERO_ADDRESS, percentAllocation: 0, isAllocation: false };
function getAllocation(address, allocation, isAllocation = true) { return {priceFeedAddress: address, percentAllocation: allocation, isAllocation: isAllocation } }
function getAllocations(allocation1 , allocation2 = emptyAllocation, allocation3 = emptyAllocation, allocation4 = emptyAllocation, allocation5 = emptyAllocation) { return [allocation1, allocation2, allocation3, allocation4, allocation5] }

function getFeedAllocations(priceFeed, otherPriceFeed) {
    let allocations;
    if (otherPriceFeed == undefined) {
        const allocation = getAllocation(priceFeed.address.toString(), 100)
        allocations = getAllocations(allocation)
    } else {
        const allocation1 = getAllocation(priceFeed.address.toString(), 70)
        const allocation2 = getAllocation(otherPriceFeed.address.toString(), 30)
        allocations = getAllocations(allocation1, allocation2)
    }
    return allocations;
}

async function createLoanDepositAndIssue(contracts, users, ethDeposit, currencyIssuance, priceFeed, otherPriceFeed)
{
    const newLoan = await createLoan(contracts, users, priceFeed, otherPriceFeed);
    await newLoan.depositEth({value: toOnChainString(ethDeposit), from: users.loanOwner});
    await newLoan.issueCurrency(toOnChainString(currencyIssuance),  {from: users.loanOwner});
    return newLoan;
}

async function createLoan(contracts, users, priceFeed, otherPriceFeed)
{
    let allocations = getFeedAllocations(priceFeed, otherPriceFeed);
    await contracts.systemLoans.createLoan({from: users.loanOwner})
    const newLoanAddress = await contracts.systemLoans.lastNewAddress.call()                
    const newLoan = await Loan.at(newLoanAddress)
    await newLoan.allocatePriceFeeds(allocations, {from: users.loanOwner});  
    return newLoan;
}

async function createPriceFeed(contracts, users) {
    await contracts.systemFeeds.createPriceFeed({ from: users.priceFeedOwner })
    const newPriceFeedAddress = await contracts.systemFeeds.lastNewAddress.call()
    const newPriceFeed = await PriceFeed.at(newPriceFeedAddress)
    return newPriceFeed;
}

async function createLiquidatorAccount(contracts, users)
{
    await contracts.systemLiquidations.createLiquidatorAccount({from: users.liquidatorAccountOwner})
    const newLiquidatorAccountAddress = await contracts.systemLiquidations.lastNewAddress.call()                
    const newLiquidatorAccount = await LiquidatorAccount.at(newLiquidatorAccountAddress)
    return newLiquidatorAccount;
}

function getDelayedPriceStruct(ethPrice, pegPrice, priceTime) {
    return { ethPrice: toOnChainString(ethPrice), pegPrice: toOnChainString(pegPrice), priceTime: priceTime, callTime: 0};
}

function toOnChainString(price) {
    return parseInt(Math.round(price * 10 ** (PRICE_DECIMALS / 2))).toString() + (10 ** (PRICE_DECIMALS / 2)).toString().replace(/1/g,"");
    //return parseInt(Math.floor(price * 10 ** (PRICE_DECIMALS / 2))).toString() + (10 ** (PRICE_DECIMALS / 2)).toString().replace(/1/g,"");
}

function toOnChainDouble(price) {
    return Math.round(price * 10 ** (PRICE_DECIMALS / 2)) * 10 ** (PRICE_DECIMALS / 2);
    //return Math.floor(price * 10 ** (PRICE_DECIMALS / 2)) * 10 ** (PRICE_DECIMALS / 2);
}

function roundPrice(number, roundDown = false)
{
    if(roundDown) {
         return Math.floor(number * 10 ** (PRICE_DECIMALS / 2)) / 10 ** (PRICE_DECIMALS / 2);
    } else{
       return Math.round(number * 10 ** (PRICE_DECIMALS / 2)) / 10 ** (PRICE_DECIMALS / 2);
    }
}

function roundOnChainPrice(number, roundDown = false)
{
    if(roundDown) {
         return Math.floor(number / 10 ** (PRICE_DECIMALS / 2)) * 10 ** (PRICE_DECIMALS / 2);
    } else{
       return Math.round(number / 10 ** (PRICE_DECIMALS / 2)) * 10 ** (PRICE_DECIMALS / 2);
    }
}

async function ensureContractsDeployed() {
    const peggedToken = await PeggedToken.deployed()
    const system = await System.deployed()
    const systemFeeds = await SystemFeeds.deployed()
    const systemLoans = await SystemLoans.deployed()
    const systemSavings = await SystemSavings.deployed()
    const systemLiquidations = await SystemLiquidations.deployed()
    return { system: system, systemLiquidations: systemLiquidations, systemSavings: systemSavings, systemFeeds: systemFeeds, systemLoans: systemLoans, peggedToken: peggedToken}
}

// Wind down the system by advancing more than a week time and reporting delayed prices
async function windDownSystem(contracts, users, ethPrice = 200.0, pegPrice = 1.0) {
    const somePriceFeed = await createPriceFeed(contracts, users);
    let oneWeekPlusInSeconds = SECONDS_PER_DAY * (DAYS_PER_WEEK + 1);
    let latestTimestamp = await advanceTime(oneWeekPlusInSeconds); 
    let priceTime = latestTimestamp - SECONDS_PER_DAY;       
    await reportDelayedPrice(users, somePriceFeed, ethPrice, pegPrice, priceTime)
    return somePriceFeed;
}

// Bootstrap the system in 3 steps
async function bootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice = 200.0, pegPrice = 1.0, priceFeed = undefined) {
    // 1. Create price feed and report prices
    if(priceFeed == undefined) {
        priceFeed = await createPriceFeed(contracts, users);
    }
    let priceTime = await advanceOneDay();
    await reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime)

    // 2. Create loan allocating that price feed and issue currency
    const newLoan = await createLoan(contracts, users, priceFeed);
    await newLoan.depositEth({value: toOnChainString(ethDeposit), from: users.loanOwner});        
    await newLoan.issueCurrency(toOnChainString(currencyIssuance), {from: users.loanOwner});

    // 3. Wait a day and report prices using the feed
    priceTime = await advanceOneDay();
    await reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime)
    priceTime = await advanceOneDay();
    await reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime)

    return priceFeed;
}

async function windDownAndBootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice = 200.0, pegPrice = 1.0) {
    let priceFeed = await windDownSystem(contracts, users, ethPrice, pegPrice);
    priceFeed = await bootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice, priceFeed)
    return priceFeed;
}

async function advanceOneDay()
{
    let priceTime = await latestTimestamp()
    await advanceTime(SECONDS_PER_DAY);
    return priceTime;
}

function getUsers(accounts) {
    const systemCreator = accounts[0];
    const moneyUser = accounts[1];
    const loanOwner = accounts[2];
    const priceFeedOwner = accounts[3];
    const liquidatorAccountOwner = accounts[4];
    const someTestUser = accounts[9];
    return {systemCreator: systemCreator, liquidatorAccountOwner: liquidatorAccountOwner, moneyUser: moneyUser, loanOwner: loanOwner, priceFeedOwner: priceFeedOwner, someTestUser: someTestUser};
}

async function advanceOneDayAndReportPrice(users, priceFeed, ethPrice, pegPrice) {
    let priceTime = await advanceOneDay();
    let delayedPrice = getDelayedPriceStruct(ethPrice, pegPrice , priceTime);
    await priceFeed.reportDelayedPrices(delayedPrice, { from: users.priceFeedOwner });
}

async function reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime) {
    let delayedPrice = getDelayedPriceStruct(ethPrice, pegPrice , priceTime);
    await priceFeed.reportDelayedPrices(delayedPrice, { from: users.priceFeedOwner });
}

async function getFeedProcessStates(contracts, priceFeed, log = false)
{
    let priceFeedState = await getFeedState(contracts, priceFeed, log);
    let finalizedState;
    if (priceFeedState.finalizedStateIndex != 2 ** 32 - 1) { finalizedState = await getFinalizedState(contracts, priceFeedState.finalizedStateIndex, log); }
    let processingState;
    if (priceFeedState.processingStateIndex != 2 ** 32 - 1) { processingState = await getProcessingState(contracts, priceFeedState.processingStateIndex, log); } 
    return [finalizedState, processingState];
}

async function getFinalizedState(contracts, index, log = false)
{
    let feedState = await contracts.system.feedFinalizedStateList.call(index)
    if(log) {console.log(`>Finalized[${index}] - totalAllocation: ${feedState.rankingMetric.toString()}, priceFeedAddress: ${feedState.priceFeedAddress.substring(0,6)}, isProcessed: ${feedState.isProcessed}`)}
    return feedState;
}

async function getProcessingState(contracts, index, log = false)
{
    let feedState = await contracts.systemFeeds.feedProcessingStateList.call(index)
    if(log) {console.log(`>Processing[${index}] - rankingMetric: ${feedState.rankingMetric.toString()}, priceFeedAddress: ${feedState.priceFeedAddress.substring(0,6)}, isProcessed: ${feedState.isProcessed}`)}
    return feedState;
}

async function getFeedAllocation(contracts, priceFeed, log = false) {
    //const priceFeedStruct = await contracts.systemFeeds.priceFeedMap(priceFeed.address.toString());
    const priceFeedStruct = await getFeedState(contracts, priceFeed, log)
    const priceFeedAllocation = priceFeedStruct.totalAllocation;
    return priceFeedAllocation;
}

async function getFeedState(contracts, priceFeed, log = false)
{
    let priceFeedState = await contracts.systemFeeds.priceFeedMap.call(priceFeed.address)
    
    let message = `>State[${priceFeed.address}] - totalAllocation: ${priceFeedState.totalAllocation.toString()}, finalizedStateIndex: ${priceFeedState.finalizedStateIndex.toString()}, `
    message += `processingStateIndex: ${priceFeedState.processingStateIndex.toString()}, isPriceFeed: ${priceFeedState.isPriceFeed}, `
    message += `lastPriceDay: ${priceFeedState.lastPriceDay.toString()}, lastPenaltyDay: ${priceFeedState.lastPenaltyDay.toString()}, `
    message += `isBanned: ${priceFeedState.isBanned.toString()}, revenuePoolBalance: ${priceFeedState.revenuePoolBalance.toString()}, `
    message += `lastEthPrice: ${priceFeedState.lastEthPrice.toString()}, `
    if (log) { console.log(message) }

    return priceFeedState;
}

var DelayedPriceReportingState = {
    Unspecified : {value: 0, name: "Unspecified"}, 
    Empty: {value: 1, name: "Empty"}, 
    Stable : {value: 2, name: "Stable"},
    Unstable : {value: 3, name: "Unstable"},
    Dispute : {value: 4, name: "Dispute"},
    VALUES : undefined
};
DelayedPriceReportingState.VALUES = [
    DelayedPriceReportingState.Unspecified,
    DelayedPriceReportingState.Empty,
    DelayedPriceReportingState.Stable,
    DelayedPriceReportingState.Unstable,
    DelayedPriceReportingState.Dispute
];

var InstantReportingState = {
    Unspecified : {value: 0, name: "Unspecified"}, 
    Empty: {value: 1, name: "Empty"}, 
    Stable : {value: 2, name: "Stable"},
    Unstable : {value: 3, name: "Unstable"},
    Dispute : {value: 4, name: "Dispute"},
    VALUES : undefined
};
InstantReportingState.VALUES = [
    InstantReportingState.Unspecified,
    InstantReportingState.Empty,
    InstantReportingState.Stable,
    InstantReportingState.Unstable,
    InstantReportingState.Dispute
];

function getEnum(enumeration, value) {
    if(enumeration.VALUES == undefined) {
        return undefined;
    }

    for (let i = 0; i < enumeration.VALUES.length; i++) {
        if (value == enumeration.VALUES[i].value) {
            return enumeration.VALUES[i];
        }
    }
}

function getEnumFromOnChain(enumeration, onChainValue) {
    return getEnum(enumeration, parseInt(onChainValue.toString()));
}

async function getInstantPriceAndState(contracts) {
    let instantPriceReportingState = await contracts.system.instantPriceReportingState.call();
    let instantPriceReportingStateEnum = getEnumFromOnChain(InstantReportingState, instantPriceReportingState);
    let lastInstantPrice = parseInt((await contracts.system.lastInstantPrice.call()).toString())
    return [instantPriceReportingStateEnum, lastInstantPrice];
}

async function createSavingsAccount(contracts, users) {
    await contracts.systemSavings.createSavingsAccount({ from: users.moneyUser })
    const newSavingsAccountAddress = await contracts.systemSavings.lastNewAddress.call()
    const newSavingsAccount = await SavingsAccount.at(newSavingsAccountAddress)
    return newSavingsAccount;
}

async function logDailySystemVariables(contracts) {
    console.log(">dailySystemVariables:")
    for(let i = 0; i < DAYS_PER_WEEK; i++) {
        let systemVariables = await contracts.system.dailySystemVariables.call(i);
        let message = `[${i}] - startDay: ${systemVariables.startDay} - ethPrice: ${systemVariables.ethPrice} - pegPrice: ${systemVariables.pegPrice} -`;
        console.log(message);
    }
}

async function logFeedProcessingStateList(contracts, fullList = false) {
    console.log(">feedProcessingStateList:")
    for(let i = 0; i < fullList ? MEDIUM_TRUST_FEEDS : HIGH_TRUST_FEEDS ; i++) {    
        await getProcessingState(contracts, i, true)        
    }
}

async function logFeedFinalizedStateList(contracts, fullList = false) {
    console.log(">feedFinalizedStateList:")
    for(let i = 0; i < fullList ? MEDIUM_TRUST_FEEDS : HIGH_TRUST_FEEDS ; i++) {
        await getFinalizedState(contracts, i, true)        
    }
}

async function getFirstTime(contracts) {
    let firstTime = await contracts.system.firstTime.call()
    return firstTime;
}


module.exports = {
    getFirstTime : async function(contracts) { return await getFirstTime(contracts); },
    logDailySystemVariables : async function(contracts) { return await logDailySystemVariables(contracts); },
    logFeedProcessingStateList : async function(contracts) { return await logFeedProcessingStateList(contracts); },
    logFeedFinalizedStateList : async function(contracts) { return await logFeedFinalizedStateList(contracts); },
    createPriceFeed : async function(contracts, users) { return await createPriceFeed(contracts, users); },
    getUsers : function(accounts) { return getUsers(accounts); },
    latestTimestamp : async function() { return await latestTimestamp(); },
    mine : async function() { await mine(); },
    advanceTime : async function(time) { return await advanceTime(time); },
    advanceOneDay : async function() { return await advanceOneDay(); },
    getAllocation : function(address, allocation, isAllocation = true) { return getAllocation(address, allocation, isAllocation); },
    getAllocations : function(allocation1 , allocation2 = emptyAllocation, allocation3 = emptyAllocation, allocation4 = emptyAllocation, allocation5 = emptyAllocation) { return getAllocations(allocation1, allocation2, allocation3, allocation4, allocation5); },
    getEmptyAllocation : function() { return emptyAllocation; },
    getFeedAllocations : function(priceFeed, otherPriceFeed, log) { return getFeedAllocations(priceFeed, otherPriceFeed, log); },
    createLiquidatorAccount : async function(contracts, users) { return await createLiquidatorAccount(contracts, users); },
    createLoan : async function(contracts, users, priceFeed, otherPriceFeed) { return await createLoan(contracts, users, priceFeed, otherPriceFeed); },
    createLoanDepositAndIssue : async function(contracts, users, ethDeposit, currencyIssuance, priceFeed, otherPriceFeed) { return await createLoanDepositAndIssue(contracts, users, ethDeposit, currencyIssuance, priceFeed, otherPriceFeed); },
    getDelayedPriceStruct: function(ethPrice, pegPrice, priceTime) { return getDelayedPriceStruct(ethPrice, pegPrice, priceTime); },
    roundOnChainPrice : function(price, roundDown) { return roundOnChainPrice(price, roundDown); },
    roundPrice : function(price, roundDown) { return roundPrice(price, roundDown); },
    toOnChainString : function(price) { return toOnChainString(price); },
    toOnChainDouble : function(price) { return toOnChainDouble(price); },
    getInstantPriceAndState : async function(contracts) { return await getInstantPriceAndState(contracts); },
    ensureContractsDeployed: async function() { return await ensureContractsDeployed(); },
    windDownSystem : async function(contracts, users, ethPrice, pegPrice) { return await windDownSystem(contracts, users, ethPrice, pegPrice); },
    bootstrapSystem : async function(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice) { return await bootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice); },
    windDownAndBootstrapSystem : async function(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice) { return await windDownAndBootstrapSystem(contracts, users, ethDeposit, currencyIssuance, ethPrice, pegPrice); },
    advanceOneDayAndReportPrice : async function(users, priceFeed, ethPrice, pegPrice) { return await advanceOneDayAndReportPrice(users, priceFeed, ethPrice, pegPrice); },
    reportDelayedPrice : async function(users, priceFeed, ethPrice, pegPrice, priceTime) { return await reportDelayedPrice(users, priceFeed, ethPrice, pegPrice, priceTime); },
    getFinalizedState : async function(contracts, index, log) { return await getFinalizedState(contracts, index, log); },
    getProcessingState : async function(contracts, index, log) { return await getProcessingState(contracts, index, log); },
    getFeedProcessStates : async function(contracts, priceFeed, log) { return await getFeedProcessStates(contracts, priceFeed, log); },
    getFeedAllocation : async function(contracts, priceFeed, logAllocation) { return await getFeedAllocation(contracts, priceFeed, logAllocation); },
    getFeedState : async function(contracts, priceFeed, logStruct) { return await getFeedState(contracts, priceFeed, logStruct); },
    getPriceAndCallTimes : async function() { return await getPriceAndCallTimes(); },
    getEnum : function(enumeration, value) { return getEnum(enumeration, value); },
    getEnumFromOnChain : function(enumeration, value) { return getEnumFromOnChain(enumeration, value); },
    createSavingsAccount : async function(contracts, users) { return await createSavingsAccount(contracts, users); },
    InstantReportingState : InstantReportingState,
    DelayedPriceReportingState : DelayedPriceReportingState,
    ZERO_ADDRESS : ZERO_ADDRESS,
    PRICE_DECIMALS : PRICE_DECIMALS,
    SECONDS_PER_DAY : SECONDS_PER_DAY,
    DAYS_PER_WEEK : DAYS_PER_WEEK,
    LEVERAGE_THRESHOLD_PERCENT : LEVERAGE_THRESHOLD_PERCENT,
    MEDIUM_TRUST_FEEDS : MEDIUM_TRUST_FEEDS,
    HIGH_TRUST_FEEDS : HIGH_TRUST_FEEDS,
    PeggedToken : PeggedToken,
    System : System,
    SystemFeeds : SystemFeeds,
    SystemLoans : SystemLoans,
    SystemSavings : SystemSavings,
    SystemLiquidations : SystemLiquidations,
    Loan : Loan,
    PriceFeed : PriceFeed,
    SavingsAccount : SavingsAccount,
    LiquidatorAccount : LiquidatorAccount,
};