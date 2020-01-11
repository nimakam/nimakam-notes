async function advanceTime(time)
{
    await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [time], id: new Date().getTime()}, (err1) => { if (err1) return reject(err1) } )
    await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", id: new Date().getTime()}, (err1) => { if (err1) return reject(err1) } )
    const latestBlock = await web3.eth.getBlock('latest')
    //console.log("\t>Advanced time by " + time + " - latest block timestamp: " + latestBlock.timestamp)
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

module.exports = {
    latestTimestamp : async function() { return await latestTimestamp(); },
    mine : async function() { await mine(); },
    advanceTime : async function(time) { return await advanceTime(time); }
};