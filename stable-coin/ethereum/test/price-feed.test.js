const PeggedToken = artifacts.require("PeggedToken");
const System = artifacts.require("System");
const SystemFeeds = artifacts.require("SystemFeeds");
const SystemLoans = artifacts.require("SystemLoans");
const Loan = artifacts.require("Loan");
const PriceFeed = artifacts.require("PriceFeed");
const TestPriceFeedController = artifacts.require("TestPriceFeedController");
const TOKEN_DECIMALS = 18;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract('PriceFeed', accounts => {
    const systemCreator = accounts[0];
    const moneyUserAccount = accounts[1];
    const loanOwner = accounts[2];
    const priceFeedOwner = accounts[3];
    let helpers = require("./helpers.js");
    let exceptions = require("./exceptions.js");

    let system, systemFeeds;
    let systemFirstTime;

    before(async function () {
        system = await System.deployed()
        systemFeeds = await SystemFeeds.deployed()
        systemLoans = await SystemLoans.deployed()

        let firstTime = await system.firstTime.call();
        systemFirstTime = parseInt(firstTime.toString());

        await systemFeeds.createPriceFeed({ from: priceFeedOwner })
        newPriceFeedAddress1 = await systemFeeds.lastNewAddress.call()
        await systemFeeds.createPriceFeed({ from: priceFeedOwner })
        newPriceFeedAddress2 = await systemFeeds.lastNewAddress.call()

        const emptyAllocation = { priceFeedAddress: ZERO_ADDRESS, percentAllocation: 0, isAllocation: false }
        const singleAllocation1 = { priceFeedAddress: newPriceFeedAddress1.toString(), percentAllocation: 100, isAllocation: true }
        singleAllocations = [singleAllocation1, emptyAllocation, emptyAllocation, emptyAllocation, emptyAllocation]

        await helpers.advanceTime(86400); // Push clock forward 1 day to avoid conflicts. and to make sure priceDay is at least 1, so it does not conflict with lastFinalizedDay=0

    });

    const emptyAllocation = {priceFeedAddress: ZERO_ADDRESS, percentAllocation: 0, isAllocation: false };
    function getAllocation(address, allocation, isAllocation = true) { return {priceFeedAddress: address, percentAllocation: allocation, isAllocation: isAllocation } }
    function getAllocations(allocation1 , allocation2 = emptyAllocation, allocation3 = emptyAllocation, allocation4 = emptyAllocation, allocation5 = emptyAllocation) { return [allocation1, allocation2, allocation3, allocation4, allocation5] }


    it('can be created by external user', async () => {
        const newPriceFeed = await createPriceFeed()

        let readOwnerAddress = await newPriceFeed.owner.call()
        assert.equal(priceFeedOwner, readOwnerAddress)

        let priceFeedStruct = await systemFeeds.priceFeedMap.call(newPriceFeed.address)
        let isPriceFeed = priceFeedStruct.isPriceFeed
        assert.isTrue(isPriceFeed)

        const priceFeedSystemAddress = await newPriceFeed.system.call()
        assert.equal(system.address, priceFeedSystemAddress)
    });

    async function createPriceFeed() {
        await systemFeeds.createPriceFeed({ from: priceFeedOwner })
        const newPriceFeedAddress = await systemFeeds.lastNewAddress.call()
        const newPriceFeed = await PriceFeed.at(newPriceFeedAddress)
        return newPriceFeed;
    }

    it('can be created by controller contract', async () => {
        const priceFeedControllerOwner = priceFeedOwner;
        const testPriceFeedController = await TestPriceFeedController.new(systemFeeds.address, { from: priceFeedControllerOwner })

        let readControllerOwnerAddress = await testPriceFeedController.owner.call()
        assert.equal(priceFeedOwner, readControllerOwnerAddress)

        let readPriceFeedAddress = await testPriceFeedController.priceFeed.call()
        let newPriceFeed = await PriceFeed.at(readPriceFeedAddress)

        let priceFeedStruct = await systemFeeds.priceFeedMap.call(readPriceFeedAddress)
        let isPriceFeed = priceFeedStruct.isPriceFeed
        assert.isTrue(isPriceFeed)

        const priceFeedSystemAddress = await newPriceFeed.system.call()
        assert.equal(system.address, priceFeedSystemAddress)

        await helpers.advanceTime(86400); // Push clock forward 1 day to avoid conflicts. and to make sure priceDay is at least 1, so it does not conflict with lastFinalizedDay=0
  
        let priceTime = await helpers.latestTimestamp()
        let advancedTime = 86400;
        let callTime = await helpers.advanceTime(advancedTime);
        let timeDifference = callTime - (advancedTime + priceTime);
        assert.isTrue(timeDifference >= 0 && timeDifference <= 5) // Intermittently the time may advance by 1 second due to timing


        const historicalPrice = { medianEthRate: 200, medianPegRate: 1.0, priceTime: priceTime, callTime: callTime }
        await testPriceFeedController.postHistoricalPrice(historicalPrice, { from: priceFeedControllerOwner })
    });

    it('can be used to report instant prices', async () => {
        const newPriceFeed = await createPriceFeed()

        //await helpers.advanceTime(86400); // Push clock forward 1 day to avoid conflicts. and to make sure priceDay is at least 1, so it does not conflict with lastFinalizedDay=0
        let priceTime = await helpers.latestTimestamp()
        let advancedTime = 3600;
        let callTime = await helpers.advanceTime(advancedTime);
        let timeDifference = callTime - (advancedTime + priceTime);
        assert.isTrue(timeDifference >= 0 && timeDifference <= 5) // Intermittently the time may advance by 1 second due to timing

        const instantPrice = { medianEthRate: 210.2 * 10 ** 10, priceTime: priceTime, callTime: callTime }
        await newPriceFeed.postInstantPrice(instantPrice, { from: priceFeedOwner })
    });

    it('can be used to report historical prices', async () => {
        const newPriceFeed = await createPriceFeed()

        let ethValue = 123456;
        await createLoanWithAllocation(newPriceFeed, ethValue)

        // await advanceOneDay(); // Push clock forward 1 day to avoid conflicts. and to make sure priceDay is at least 1, so it does not conflict with lastFinalizedDay=0
        let [priceTime, callTime] = await advanceOneDay()

        await systemFeeds.flipState()

        const historicalPrice = { medianEthRate: 200 * 10 ** 10, medianPegRate: 1 * 10 ** 10, priceTime: parseInt(priceTime.toString()), callTime: parseInt(callTime.toString()) }
        await newPriceFeed.postHistoricalPrice(historicalPrice, { from: priceFeedOwner })

        let finalizedList = await getFinalizedStateArray();
        let initializedList = await getInitializedStateArray();
        await getPriceFeedStruct(newPriceFeed.address);
    });

    async function advanceOneDay()
    {
        let priceTime = await helpers.latestTimestamp()
        console.log(priceTime)
        let advancedTime = 86400;
        let callTime = await helpers.advanceTime(advancedTime);
        let timeDifference = callTime - (advancedTime + priceTime);
        assert.isTrue(timeDifference >= 0 && timeDifference <= 5) // Intermittently the time may advance by 1 second due to timing
        return [priceTime, callTime];
    }

    async function getPriceFeedStates(priceFeedAddress)
    {
        let finalizedFeedState = getPriceFeedState(await getFinalizedStateArray(), priceFeedAddress);
        let initializedFeedState = getPriceFeedState(await getInitializedStateArray(), priceFeedAddress);
        return [finalizedFeedState, initializedFeedState];
    }

    async function getPriceFeedStatesFromMap(priceFeedAddress)
    {
        let priceFeedStruct = await systemFeeds.priceFeedMap.call(priceFeedAddress)
        let finalizedStateArray = await getFinalizedStateArray(true);
        let initializedStateArray = await getInitializedStateArray(true)
        let finalizedFeedState = finalizedStateArray[priceFeedStruct.finalizedStateIndex]
        let initializedFeedState = initializedStateArray[priceFeedStruct.initializedStateIndex]
        return [finalizedFeedState, initializedFeedState];
    }

    async function postPrice(priceFeed, ethPrice, pegPrice, priceTime, callTime)
    {
        let historicalPrice = { medianEthRate: ethPrice * 10 ** 10, medianPegRate: pegPrice * 10 ** 10, priceTime: priceTime, callTime: callTime }
        await priceFeed.postHistoricalPrice(historicalPrice, { from: priceFeedOwner })
    }

    it('can transition up in trust order the transition down', async () => {
        const priceFeed = await createPriceFeed()
        const otherPriceFeed = await createPriceFeed()

        let ethValue = 23456;
        let loan = await createLoanWithAllocation(priceFeed, ethValue)
        let otherLoan = await createLoanWithAllocation(otherPriceFeed, 123456)

        let priceFeedStruct = await getPriceFeedStruct(priceFeed.address);
        assert.equal(priceFeedStruct.finalizedStateIndex, -1)
        assert.equal(priceFeedStruct.initializedStateIndex, -1)
        let [finalizedFeedState, initializedFeedState] = await getPriceFeedStates(priceFeed.address)
        assert.equal(finalizedFeedState, undefined)
        assert.equal(initializedFeedState, undefined)

        let priceTime, callTime;
        [priceTime, callTime] = await advanceOneDay()
        await postPrice(priceFeed, 200.0, 1.0, priceTime, callTime)
        await postPrice(otherPriceFeed, 200.0, 1.0, priceTime, callTime)

        priceFeedStruct = await getPriceFeedStruct(priceFeed.address);
        let otherPriceFeedStruct = await getPriceFeedStruct(otherPriceFeed.address, true);
        assert.equal(priceFeedStruct.finalizedStateIndex, -1)
        assert.notEqual(priceFeedStruct.initializedStateIndex, -1);
        assert.isTrue(priceFeedStruct.initializedStateIndex > otherPriceFeedStruct.initializedStateIndex);
        ([finalizedFeedState, initializedFeedState] = await getPriceFeedStates(priceFeed.address));
        let [finalizedFeedStateFromMap, initializedFeedStateFromMap] = await getPriceFeedStatesFromMap(priceFeed.address);
        assert.equal(undefined, finalizedFeedStateFromMap)
        assert.equal(priceFeed.address, initializedFeedStateFromMap.priceFeedAddress);

        ([priceTime, callTime] = await advanceOneDay());
        let additionalEthValue = 200000;
        loan.depositEth({value: additionalEthValue, from: loanOwner})
        await postPrice(priceFeed, 200.0, 1.0, priceTime, callTime)
        await postPrice(otherPriceFeed, 200.0, 1.0, priceTime, callTime)

        priceFeedStruct = await getPriceFeedStruct(priceFeed.address);
        otherPriceFeedStruct = await getPriceFeedStruct(otherPriceFeed.address, true);
        assert.notEqual(priceFeedStruct.finalizedStateIndex, -1)
        assert.notEqual(priceFeedStruct.initializedStateIndex, -1);
        assert.isTrue(priceFeedStruct.initializedStateIndex < otherPriceFeedStruct.initializedStateIndex);
        ([finalizedFeedState, initializedFeedState] = await getPriceFeedStates(priceFeed.address));
        ([finalizedFeedStateFromMap, initializedFeedStateFromMap] = await getPriceFeedStatesFromMap(priceFeed.address));
        assert.equal(priceFeed.address, finalizedFeedStateFromMap.priceFeedAddress)
        assert.equal(priceFeed.address, initializedFeedStateFromMap.priceFeedAddress);

        ([priceTime, callTime] = await advanceOneDay());
        loan.withdrawEth(loanOwner, additionalEthValue, {from: loanOwner});
        await postPrice(priceFeed, 200.0, 1.0, priceTime, callTime)
        await postPrice(otherPriceFeed, 200.0, 1.0, priceTime, callTime);

        priceFeedStruct = await getPriceFeedStruct(priceFeed.address);
        otherPriceFeedStruct = await getPriceFeedStruct(otherPriceFeed.address, true);
        ([finalizedFeedState, initializedFeedState] = await getPriceFeedStates(priceFeed.address));
        assert.isTrue(priceFeedStruct.initializedStateIndex > otherPriceFeedStruct.initializedStateIndex);
    });

    async function createLoanWithAllocation(priceFeed, ethDeposit)
    {
        const allocation = getAllocation(priceFeed.address.toString(), 100)
        allocations = getAllocations(allocation)
        await systemLoans.createLoan({from: loanOwner})
        const newLoanAddress = await systemLoans.lastNewAddress.call()                
        const newLoan = await Loan.at(newLoanAddress)
        await newLoan.allocatePriceFeeds(allocations, {from: loanOwner});  
        await newLoan.depositEth({value: ethDeposit, from: loanOwner});
        return newLoan;
    }

    async function getFinalizedStateArray(skipLog)
    {
        let finalizedDay = await systemFeeds.finalizedDay.call()
        let FinalizedListIndex = (parseInt(finalizedDay) % 2)
        if (skipLog != true) {console.log(">finalizedStateList - listIndex: " + FinalizedListIndex + ", finalizedDay: " + finalizedDay)}
        return await getStateArray(FinalizedListIndex, skipLog)
    }

    async function getInitializedStateArray(skipLog)
    {
        let finalizedDay = await systemFeeds.finalizedDay.call()
        let initializedListIndex = ((parseInt(finalizedDay) + 1) % 2)
        if (skipLog != true) {console.log(">initializedStateList - listIndex = " + initializedListIndex + ", finalizedDay: " + finalizedDay)}
        return await getStateArray(initializedListIndex, skipLog)
    }

    function getPriceFeedState(stateArray, priceFeedAddress)
    {
        for (let i = 0; i < 25; i++)
        {     
            if(stateArray[i].priceFeedAddress == priceFeedAddress) {
                return stateArray[i]
            }
        }
        return undefined;
    }

    async function getStateArray(listIndex, skipLog)
    {
        let stateList = [];
        for (let i = 0; i < 25; i++)
        {        
            let feedState = await systemFeeds.priceFeedStateLists.call(i, listIndex)
            if(i < 5 && skipLog != true) {console.log(`[${i}] totalAllocation: ${feedState.totalAllocation.toString()}, isFinalized: ${feedState.isFinalized}, priceFeedAddress: ${feedState.priceFeedAddress}`)}
            stateList[i] = feedState
        }
        return stateList
    }

    async function getPriceFeedStruct(priceFeedAddress, skipLog)
    {
        let priceFeedStruct = await systemFeeds.priceFeedMap.call(priceFeedAddress)
        
        let message = `totalAllocation: ${priceFeedStruct.totalAllocation.toString()}, finalizedStateIndex: ${priceFeedStruct.finalizedStateIndex.toString()}, `
        message += `initializedStateIndex: ${priceFeedStruct.initializedStateIndex.toString()}, isPriceFeed: ${priceFeedStruct.isPriceFeed}, daysSkipped: ${priceFeedStruct.daysSkipped.toString()}`
        if (skipLog != true) { console.log(message) }
 
        return priceFeedStruct;
    }
}); 