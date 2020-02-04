contract('PeggedToken', accounts => {
    const creator = accounts[0];
    const moneyUser = accounts[1];  
    let helpers = require("./helpers.js");  

    it('has appropriate initial account balances', async () => {        
        const peggedToken = await helpers.PeggedToken.deployed()
        
        const balance = await peggedToken.balanceOf(creator)
        assert.equal(helpers.toOnChainDouble(1.0), balance)

        const moneyUserBalance = await peggedToken.balanceOf(moneyUser)
        assert.equal(0, moneyUserBalance)
    });

    it('can handle transfers', async () => {        
        const peggedToken = await helpers.PeggedToken.deployed()
        
        await peggedToken.transfer(moneyUser, helpers.toOnChainString(0.2))

        const balance = await peggedToken.balanceOf(creator)
        assert.equal(helpers.toOnChainDouble(0.8), balance.toString())

        const moneyUserBalance = await peggedToken.balanceOf(moneyUser)
        assert.equal(helpers.toOnChainDouble(0.2), moneyUserBalance.toString())
    });
});