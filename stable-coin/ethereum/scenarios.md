# Scenarios

## Transferring money (pegged currency tokens)

The money user performs one of the following actions with the pegged currency:

- **Buy** - Buying a token from an exchange or on-ramp by sending fiat through bank and **receiving** token on-chain.
- **Send** - Initiating the on-chain action to send a given amount to another address.
- **Receive** - No action. Waiting for third party **send** action and confirming balance on-chain.
- **Sell** - Selling a token on an exchange by **sending** token on-chain and receiving fiat through bank.

Whether this is transfer being called to send, or to exchange through buy or sell, all of these actions are currently being performed on the main chain using the transfer() functionality of other ERC20 tokens. No further features are needed to enable this scenario for the pegged currency on the main chain.

Question - What's being used on layer 2 networks (like Connext Network)?

## Getting a loan

Potential loan takers own a significant amount of ETH often based on the speculation that its value will increase in the long term. However, they also want to be able to use that ETH value, in liquid form, to participate in other profitable economic transactions.

The loan taker would make an on-chain call to their corresponding loan contract on the public blockchain to:

1. Create a new instance of the **loan contract**.
2. Allocate a number of trusted price feeds with % values, for a total of 100%.
3. Deposit and lock ETH into that loan contract instance.
4. Issue a valid amount of pegged currency on said loan contract instance.
5. Withdraw all or part of the issued pegged currency to use as money.

The act of taking a loan is independent of any subsequent use of the withdrawn money.

### Loan creation agent - external account vs controller contract

It is expected that most (or at least many) loans will be interacted with directly using an external account, however in some cases, where the loan is managed by another service (eg in the case of InstaDapp proxy wallet), the loan can also be created and controlled by a proxy contract. In such a case the controller contract is considered as the owner of that loan and all calls come through the controller contract.

## Updating a loan

Loan takers can change the following aspects of a loan at a date after creation, by making an on-chain call to their corresponding loan contract on the public blockchain:

- Allocation - The price feed allocation can be changed to add, remove, reduce, or increase specific allocations.
- ETH balance - The ETH balance can be increased or decreased by either depositing ETH or withdrawing ETH from the loan
- Currency issuance - The issued pegged currency balance can be increased or decreased by either issuing or reversing pegged currency issuance
- Currency balance - The pegged currency balance can be increased or decreased by either depositing or withdrawing the currency

## Closing a loan

The loan taker would make an on-chain call to their corresponding loan contract on the public blockchain to:

1. Acquire pegged currency money from the market.
2. Depositing the outstanding amount of pegged currency to cover what has been issued as well as any fees.
3. Close the loan, which reverses the issuance of pegged currency as well as pays off any remaining fees.
4. Withdraw the remaining ETH balance from the contract.

## Creating a price feed

As a business, the price feed provider is responsible for providing accurate pricing information, while promoting and maintaining the loan takers' (and to a lesser extent money users') trust in consistency and integrity of their business.

### Multi-security-level contract as controller

Creating an on-chain price feed contract, requires the price feed provider to also provide a very high level of security in controlling the contract's activities. Although the price feed has to be created by the system itself, the controller of that price feed can be a multi-security-level contract, that other (relatively less secure) external accounts interact with. The controller contract has to therefore create and operate the price feed accordingly.

The price provider's controller contract can create the price feed programmatically, by calling into the main system contract, and proxy all subsequent calls securely to the price feed contract throughout its lifetime.

### External account as controller

The price feed provider can choose to use an external account to create and control the price feed. With this option, security of the private key representing that account becomes equivalent to the security of private key itself, and is therefore of paramount importance for the provider.

The external account calls into the main system contract, to create the specific price feed contract, then interacts with it throughout its lifetime.

## Submitting feed historical prices

The price feed providers are responsible for reporting the designated median prices (by volume) daily, and have until the end of the next day to report. Every day, after gathering data and confirming the market activities of the previous day, and reporting the median prices for the following:

1. Daily median by volume rate of ETH in reference currency (ie US dollar $) - eg. $200.00 per ETH
2. Daily median by volume rate of pegged currency (ie Pegged US dollar) in reference currency  - eg $1.01 per pegged US Dollar
3. Day start time corresponding to blockchain time unit (time in seconds since unix epoch)

The time granularity of tracking feeds' historical prices is 1 day. This means all prices are reported as the median value for that whole day by volume, according to the system contract's definition of that day's start and end times.

The price feed provider should be aware of the system contract's timing for the start and end of each day an period, and plan accordingly to report the historical prices of each specific day, before the end of the subsequent day. For example the price for day 120 of the lifetime of the system contract, should be reported before the end of day 121.

## Submitting feed instant prices

The price feed providers, that are in the "trusted" category, are responsible for reporting significant changes to the price of ETH in reference currency, within a minute of occurring. Significant changes are defined as any rise or drop of more than 5% since a previous report. Reporting changes of over 1% are recommended. The provider should monitor the latest median price (by volume) and upon a fall or rise of its value, send a on-chain request to their price contract with the value of:

1. Up to the minute median by volume rate of ETH in reference currency (ie US dollar $) - eg. $199.80 per ETH.
2. Price time corresponding to blockchain time unit (time in seconds since unix epoch)

## Creating a savings account

1. Creating the account contract
2. Transferring and registering currency to the contract

## Withdrawing from savings account

1. Accumulating interest
2. Partial (or full) un-registering and withdrawing from contract with interest

Negative scenarios

- Transaction revert while accumulating interest with insufficient savings pool balance
- Full un-registering and withdrawing from contract skipping interest

## Liquidation request

## Liquidation finalization

## Price feed "trust" level transitions

- Creation as a low trust price feed
- Becoming a medium trust price feed after creation
- Becoming a high trust price feed after creation
- Being demoted from high trust to medium trust
- Being demoted from medium trust to low trust

## Price feed penalty conditions

## End-to-end scenarios

## Appendix

### Personas

#### Money user

Knowledge: Superficial understanding of the internet, public blockchain and digital finance.
Experience: None assumed.
Needs: Use a dependable form of money for everyday economic transactions. Have that money be accepted in as many contexts as possible.
Wants: Get interest on that money when not used.

#### Loan taker

Knowledge: Basic to intermediate understanding of public blockchain, smart contracts and decentralized finance
Experience: Use of centralized exchanges, public blockchain and smart contracts to buy, exchange, and use decentralized finance.
Needs: Keep custody of owned ETH, while also freely using its value to perform profitable economic transactions. Basic understanding of how their loan works in common conditions. Peace of mind that long term risks are minimal
Want: Peace of mind that they will be notified when action is needed, to protect their investment.

#### Price feed provider

Knowledge: Advanced understanding of public blockchain, smart contracts, cryptoeconomics, business, marketing, traditional and decentralized finance
Experience: Building a finance business and marketing. Development and deployment of blockchain-based systems using smart contracts and integration systems. Designing, building and operating secure digital systems.
Needs: Be able to run a profitable business sustainably. Be able to trust in the system's correct operation.
Wants: Reach a level of scale that results in high margins and thus a higher return on investment.

#### Loan liquidator

Knowledge: Advanced understanding of public blockchain, smart contracts, cryptoeconomics, decentralized finance.
Experience: Automated interaction with blockchain-based systems using smart contracts and integration systems. Managing security of digital programs.
Needs: Not lose money on any subjectively valid liquidation requests.
Wants: More returns on investment.
