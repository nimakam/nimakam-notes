# Solidity proof of concept

The proof of concept is written in Solidity, using the truffle development environment. You should be able to compile and run tests using the following command after installing the prerequisites of truffle:

`truffle test`

## Contracts

- Pegged token [contract](contracts/PeggedToken.sol)
- System [contract](contracts/System.sol)
  - System price feed area [contract](contracts/SystemFeeds.sol)
  - System loans area [contract](contracts/SystemLoans.sol)
  - System savings area [contract](contracts/SystemSavings.sol)
  - System liquidations area [contract](contracts/SystemLiquidations.sol)
- Price feed [contract](contracts/PriceFeed.sol)
- Loan [contract](contracts/Loan.sol)
- Savings account [contract](contracts/SavingsAccount.sol)
- System liquidations area [contract](contracts/LiquidationAccount.sol)

## Tests

See [scenarios](../scenarios.md) for the intended scope of coverage through the automated tests.
