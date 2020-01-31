let snapId;
let id = 1;

//const StableToken = artifacts.require("StableToken");
module.exports = function(callback) {
    console.log("test");

    web3.currentProvider.send({ jsonrpc: '2.0', method: 'evm_revert', params:[snapId], id: id, }, (err1) => { if (err1) return reject(err1) })

    console.log("test2");
    //callback();
}





