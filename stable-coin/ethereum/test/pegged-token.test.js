const PeggedToken = artifacts.require("PeggedToken");
const TOKEN_DECIMALS = 18;


contract('PeggedToken', accounts => {
    const creator = accounts[0];
    const moneyUser = accounts[1];  
    let helpers = require("./helpers.js");  

    it('has appropriate initial account balances', async () => {        
        const peggedToken = await PeggedToken.deployed()
        
        const balance = await peggedToken.balanceOf(creator)
        assert.equal(1.0 * 10 ** TOKEN_DECIMALS, balance)

        const moneyUserBalance = await peggedToken.balanceOf(moneyUser)
        assert.equal(0, moneyUserBalance)
    });

    it('can handle transfers', async () => {        
        const peggedToken = await PeggedToken.deployed()
        
        await peggedToken.transfer(moneyUser, (0.2 * 10 ** TOKEN_DECIMALS).toString())

        const balance = await peggedToken.balanceOf(creator)
        assert.equal(0.8 * 10 ** TOKEN_DECIMALS, balance.toString())

        const moneyUserBalance = await peggedToken.balanceOf(moneyUser)
        assert.equal(0.2 * 10 ** TOKEN_DECIMALS, moneyUserBalance.toString())
    });

}); 



//web3.currentProvider.send({ jsonrpc: '2.0', method: 'evm_revert', params:[snapId], id: id, }, (err1) => { if (err1) return reject(err1) })

//snapId = web3.currentProvider.send({ jsonrpc: '2.0', method: 'evm_snapshot', id: id, }, (err1) => { if (err1) return reject(err1) });

//web3.currentProvider.send({ jsonrpc: '2.0', method: 'evm_snapshot', id: id });
    //     web3.currentProvider.sendAsync({ jsonrpc: '2.0', method: 'evm_snapshot', id: id, }, (err1,res) => { if (err1) return reject(err1); return resolve(res); });




    // beforeEach(() => {
    //     snapId = web3.currentProvider.send({ jsonrpc: '2.0', method: 'evm_snapshot', id: id, }, (err1) => { if (err1) return reject(err1) });
    // //     web3.currentProvider.sendAsync({ jsonrpc: '2.0', method: 'evm_snapshot', id: id, }, (err1,res) => { if (err1) return reject(err1); return resolve(res); });
    // });


    // afterEach(() => {
    //     web3.currentProvider.send({ jsonrpc: '2.0', method: 'evm_revert', params:[snapId], id: id, }, (err1) => { if (err1) return reject(err1) })
    // });



    //web3.currentProvider.send({ jsonrpc: '2.0', method: 'evm_revert', params:[snapId], id: id })
    // web3.currentProvider.send({ jsonrpc: '2.0', method: 'evm_revert', params:[snapId], id: id, }, (err1,res) => { if (err1) return reject(err1); return resolve(res); })
