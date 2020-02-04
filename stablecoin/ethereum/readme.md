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
- Liquidator account [contract](contracts/LiquidatorAccount.sol)

## Tests

See [scenarios](../scenarios.md) for the intended scope of coverage through the automated tests.

The tests are separated by feature areas for feeds, loans, savings, and liquidations. They also have separate files for negative tests and edge case tests where appropriate.

[Exceptions](./test/exceptions.js) and [helpers](./test/helpers.js) source files contain all shared functionality used by all tests.

- [Pegged token](./test/token.test.js) tests
- [System](./test/system.test.js) tests
- [Liquidation](./test/liquidation.test.js) tests
- [Savings](./test/savings.test.js) tests
- [Loan](./test/loan.test.js) tests
- [Feed](./test/feeds.test.js) tests
