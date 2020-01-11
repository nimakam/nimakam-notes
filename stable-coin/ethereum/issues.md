# Issues

## Open issues

### System contract is too large for deployment

Error while running truffle tests or migration, stating that migration was unsuccessful due to running out of gas.

`Error: while migrating System: Returned error: VM Exception while processing transaction: out of gas`

Current mitigation: breaking up the `System` and `PeggedToken` contracts into smaller parts per namespace: `System`, `SystemLoans`, `SystemFeeds`, `SystemSavings`, `PeggedToken` along with the existing individually created instances of `Loan`, `PriceFeed` and `SavingsAccount`

Unfortunately this mitigation complicates the set up and initialization of these contract, as well as increasses the complexity of ensuring adequate security for inter-contract calls.

### Linking contracts

- There is a concept of linking to utility libraries, but this mostly doesn't apply to our work.

### Balance consistency across contracts

There are a few separate contracts in the system like instances of `PriceFeed`, `Loan` and the singleton `System` contract itself. Changes in any of `PriceFeed`, or `Loans`, will lead to changes to aggregate balances in `System`. There is a need to ensure the aggregate values across all Loans and PriceFeeds are consistent with balances on System.

- Loan contract instance
  - ETH collateral balance
    - Aggregate value across all loans = System - ETH collateral balance
  - Pegged currency balance
    - Aggregate value across all loans = System - Pegged currency balance
  - Price feed allocations
    - Weighted aggregate value across all loans = System - Price feed allocation balance
- Pegged token instance
  - Pegged currency balance
    - Minted tokens should = System - pegged currency balance = Aggregate of Loan - pegged currency balance

### Accrual of fees and payments

Interacting with smart contracts is most convenient when requests are part of a transaction that is settled atomically. In some cases, such as in case of fees and progressive payments, the value of transactions accrue over time and require additional calls to the smart contract. This not only involves additional gas cost for recurring calls, but also introduces the cost of additional coordination, and optimizations on when to trigger each accrual. Here are the parts of the system that depend on this type of functionality.

- Loan instance contract
  - Fee accrual - Loan fee rate
- Savings account instance contract
  - Interest accrual - Savings interest rate

This functionality also requires storage of relevant rates over time, such that each accrual value can be calculated regardless of when the transactions started, and when the accrual is being triggered. In cases where these rates have a fine resolution (eg. per 1 hour), it becomes infeasible to store this fine resolution of data for anything other than the very recent past periods. This introduces the need for progressive archiving and consolidation of fine resolution rates into coarse resolution rates as time passes.

### Price feed dispute process

- When does the dispute detection process run?
- How and when to decide penalties?
- When do the penalties take effect

### Non-isolation of corruption

Given the current design, the Loan contracts and the singleton System contract are linked and not isolated well. Most calls into any loan contract for example will likely change state in the main System contract, by updating balances etc. This means a single corruption caused by one of these calls will corrupt the whole system. This is not limited to random, or accidental corruption. It really means that if corruption of state can be artificially caused by a malicious actor, they can possibly use it to profit from the system at the expense of others. And given the immutable nature of the system's design, the only remedy is for all users of the platform to withdraw their loans, and start over on a new fixed system, which is extremely costly for all involved, especially the loan holders, and even more disproportionately, the last few to close their loans.

Assumption: All calls on Ethereum are un-corruptible, they are 100% reliable with respect to the contract code. This is theoretically true.
Assumption: The smart contracts are simple and correct enough to eliminate the possibility of such corruption.

### Undesirable migration

There are few undesirable scenarios under which all the system's users would have to migrate to a new updated system. These include:

- Next version - If the community decides that the addition of specific functionality is absolutely needed, and not doing so is not a viable option
- Vulnerability discovery - If an exploitable vulnerability is discovered in the system that would allow attackers to profit in expense of other system users
  - Immediately exploitable - Urgent migration - very costly to users
  - Gradually exploitable - Planned migration - relatively less costly to users, still very undesirable

Under all these scenarios, due to the immutable nature of the contracts, the whole community would have to coordinate a migration effort. We can speculate on the following set of costs:

- Late closer problem - The very last few who want to close their loans in the legacy system, will likely have trouble finding liquidity for the pegged currency.
  - Late closer penalty - They may have to either pay a large premium to close their loan, leading to losses.
  - Lost collateral - They may not be able to acquire any pegged currency due to loss of supply, in which case their collateral will be kept locked indefinitely.

## Closed issues

### Automated testing

#### Simulate time passing on Ethereum

- [Ganache core - evm_increaseTime](https://github.com/trufflesuite/ganache-core) - "time": Date - Date that the first block should start. Use this feature, along with the evm_increaseTime method to test time-dependent code."
- [Simulating time - stack exchange](https://ethereum.stackexchange.com/questions/15755/simulating-the-passage-of-time-with-testrpc)

**References**:

- [Test RPC reference](https://docs.nethereum.com/en/latest/ethereum-and-clients/test-rpc/)
- [Ganache core](https://github.com/trufflesuite/ganache-core)

**Solution**:

The following functions perform the functionality needed to get the current block time as well as advance time on the test blockchain by a given number of seconds.

```JavaScript
async function advanceTime(time)
{
    await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [time], id: new Date().getTime()}, (err1) => { if (err1) return reject(err1) } )
    await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", id: new Date().getTime()}, (err1) => { if (err1) return reject(err1) } )
    const latestBlock = await web3.eth.getBlock('latest')
    return latestBlock.timestamp;
}

async function latestTimestamp()
{
    const latestBlock = await web3.eth.getBlock('latest');
    return parseInt(latestBlock.timestamp);
}
```
