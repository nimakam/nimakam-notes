const PeggedToken = artifacts.require("PeggedToken");
const System = artifacts.require("System");
const SystemFeeds = artifacts.require("SystemFeeds");
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

    let system, systemFeeds;
    let systemFirstTime;

    before(async function () {
        system = await System.deployed()        
        systemFeeds = await SystemFeeds.deployed()        

        let firstTime = await system.firstTime.call();
        systemFirstTime = parseInt(firstTime.toString());

        await systemFeeds.createPriceFeed({from: priceFeedOwner})
        newPriceFeedAddress1 = await systemFeeds.lastNewAddress.call()
        await systemFeeds.createPriceFeed({from: priceFeedOwner})
        newPriceFeedAddress2 = await systemFeeds.lastNewAddress.call()                
 
        const emptyAllocation = {priceFeedAddress: ZERO_ADDRESS, percentAllocation: 0, isAllocation: false }
        const singleAllocation1 = {priceFeedAddress: newPriceFeedAddress1.toString(), percentAllocation: 100, isAllocation: true }
        singleAllocations = [singleAllocation1, emptyAllocation, emptyAllocation, emptyAllocation, emptyAllocation]
    });    

    it('is not usable if not created through system', async () => {
        const newPriceFeed = await createPriceFeed()

        let readOwnerAddress = await newPriceFeed.owner.call()
        assert.equal(priceFeedOwner, readOwnerAddress)

        let priceFeedStruct = await systemFeeds.priceFeedMap.call(newPriceFeed.address)
        let isPriceFeed = priceFeedStruct.isPriceFeed
        assert.isTrue(isPriceFeed)

        const priceFeedSystemAddress = await newPriceFeed.system.call()
        assert.equal(system.address, priceFeedSystemAddress)
    });

    async function createPriceFeed()
    {
        await systemFeeds.createPriceFeed({from: priceFeedOwner})
        const newPriceFeedAddress = await systemFeeds.lastNewAddress.call()                
        const newPriceFeed = await PriceFeed.at(newPriceFeedAddress)
        return newPriceFeed;
    }
}); 