# Scenarios

- [Scenarios](#scenarios)
  - [Transferring money (pegged currency tokens)](#transferring-money-pegged-currency-tokens)
  - [Getting a loan](#getting-a-loan)
    - [Loan creation through proxy](#loan-creation-through-proxy)
  - [Closing a loan](#closing-a-loan)
  - [Lifetime changes to a loan](#lifetime-changes-to-a-loan)
  - [Creating a price feed](#creating-a-price-feed)
  - [Feed reporting delayed prices](#feed-reporting-delayed-prices)
  - [Feed reporting instant prices](#feed-reporting-instant-prices)
  - [Creating a savings account](#creating-a-savings-account)
  - [Accumulating interest on savings account](#accumulating-interest-on-savings-account)
  - [Closing a savings account](#closing-a-savings-account)
  - [Liquidation request](#liquidation-request)
  - [Liquidation finalization](#liquidation-finalization)
  - [Price feed trust transitions](#price-feed-trust-transitions)
  - [Price feed collecting revenue payments](#price-feed-collecting-revenue-payments)
  - [Monetary system scenarios](#monetary-system-scenarios)
    - [system raises rates](#system-raises-rates)
    - [System lowers rates](#system-lowers-rates)
    - [System adjusts savings rate](#system-adjusts-savings-rate)
    - [System adjusts the collateral ratio](#system-adjusts-the-collateral-ratio)
    - [System adjusts price feed fee rate](#system-adjusts-price-feed-fee-rate)
  - [System variable scenarios](#system-variable-scenarios)
    - [System records rates](#system-records-rates)
    - [Calculate savings rate on request](#calculate-savings-rate-on-request)
    - [Calculate loan fee on request](#calculate-loan-fee-on-request)
  - [Penalty scenarios](#penalty-scenarios)
    - [Price feed instability penalty](#price-feed-instability-penalty)
    - [Price feed dispute penalty](#price-feed-dispute-penalty)
    - [Price feed banning](#price-feed-banning)
    - [Price feed down-voting penalty](#price-feed-down-voting-penalty)
  - [Negative scenarios](#negative-scenarios)
    - [Loan negative scenarios](#loan-negative-scenarios)
    - [Price feed negative scenarios](#price-feed-negative-scenarios)
    - [Savings account negative scenarios](#savings-account-negative-scenarios)
  - [Edge case scenarios](#edge-case-scenarios)
    - [System lifetime management](#system-lifetime-management)
    - [Controller accounts](#controller-accounts)
      - [External account controller](#external-account-controller)
      - [Contract controller](#contract-controller)
    - [Down-voting price feeds from savings accounts](#down-voting-price-feeds-from-savings-accounts)
  - [Appendix](#appendix)
    - [Personas](#personas)
      - [Money user and holder](#money-user-and-holder)
      - [Loan taker](#loan-taker)
      - [Price feed provider](#price-feed-provider)
      - [Loan liquidator](#loan-liquidator)

## Transferring money (pegged currency tokens)

The money user performs one of the following actions with the pegged currency:

- **Buy** - Buying a token from an exchange or on-ramp by sending fiat through bank and **receiving** token on-chain.
- **Send** - Initiating the on-chain action to send a given amount to another address.
- **Receive** - No action. Waiting for third party **send** action and confirming balance on-chain.
- **Sell** - Selling a token on an exchange by **sending** token on-chain and receiving fiat through bank.

Whether this is transfer being called to send, or to exchange through buy or sell, all of these actions are currently being performed on the main chain using the transfer() functionality of other ERC20 tokens. No further features are needed to enable this scenario for the pegged currency on the main chain.

Question - What's being used on layer 2 networks (like Optimism or Connext Network)?

## Getting a loan

Potential loan takers own a significant amount of ETH often based on the speculation that its value will increase in the long term. However, they also want to be able to use that ETH value, in liquid form, to participate in other profitable economic transactions.

The loan taker would make an on-chain call to their corresponding loan contract on the public blockchain to:

1. Create a new instance of the **loan contract**.
2. Allocate a number of trusted price feeds with % values, for a total of 100%.
3. Deposit and lock ETH into that loan contract instance.
4. Issue a valid amount of pegged currency on said loan contract instance.
5. Withdraw all or part of the issued pegged currency to use as money.

The act of taking a loan is independent of any subsequent use of the withdrawn money.

### Loan creation through proxy

It is expected that most (or at least many) loans will be interacted with directly using an external account, however in some cases, where the loan is managed by another service (eg in the case of InstaDapp proxy wallet), the loan can also be created and controlled by a proxy contract. In such a case the controller contract is considered as the owner of that loan and all calls come through the controller contract.

See [Contract controller](#contract-controller) section for more information.

## Closing a loan

The loan taker would make an on-chain call to their corresponding loan contract on the public blockchain to:

1. Acquire pegged currency money from the market.
2. Depositing the outstanding amount of pegged currency to cover what has been issued as well as any fees.
3. Close the loan, which reverses the issuance of pegged currency as well as pays off any remaining fees.
4. Withdraw the remaining ETH balance from the contract.

## Lifetime changes to a loan

Loan takers can change the following aspects of a loan at a date after creation, by making an on-chain call to their corresponding loan contract on the public blockchain:

- Allocation - The price feed allocation can be changed to add, remove, reduce, or increase specific allocations.
- ETH balance - The ETH balance can be increased or decreased by either depositing ETH or withdrawing ETH from the loan
- Currency issuance - The issued pegged currency balance can be increased or decreased by either issuing or returning pegged currency issuance
- Currency balance - The pegged currency balance can be increased or decreased by either depositing or withdrawing the currency

## Creating a price feed

As a business, the price feed provider is responsible for providing accurate pricing information, while promoting and maintaining the loan takers' (and to a lesser extent money users') trust in consistency and integrity of their business. Price feed providers rely on loan takers to be allocated a portion of currency issuance, which in turn increases their trust ranking in the system. Price feed providers take the following steps:

- Create a price feed
- Bootstrap the price feed with a non-zero value loan allocated to that price feed
- Promote their brand and influence loan takers to allocate to their price feed

## Feed reporting delayed prices

The price feed providers are responsible for reporting the designated median prices (by volume) daily, and have until the end of the next day to report. Every day, after gathering data and confirming the market activities of the previous day, and reporting the median prices for the following:

1. Daily median by volume rate of ETH in reference currency
2. Daily median by volume rate of pegged currency
3. Any time during the day of price
4. Any time during the day of reporting

The steps for reporting delayed prices are as follows:

- Bootstrapping the price feed - by taking at least one loan with non-zero issuance allocation to the price feed
- Gathering all available market ETH and pegged currency prices for a given day
- Aggregating these prices to obtain the global median weighted by volume across that day
- Reporting prices through the price feed contract any time during the day after price day

## Feed reporting instant prices

The price feed providers, that are in the trusted category, are responsible for reporting significant changes to the price of native currency in reference currency, within a minute of occurring. The following should be reported

1. Up to the minute native currency price
2. Price time

The steps for reporting instant prices are as follows:

- Bootstrapping the price feed - by taking at least one loan with non-zero issuance allocation to the price feed
- Raise the price feed's trust ranking to the top 5 in the system
- Develop the ability to detect large native token price changes (+-1%)
- Aggregating these prices from multiple sources, and insert security confirmation step if applicable
- Reporting prices through the price feed contract within a minute of the price change

## Creating a savings account

- Create the account contract
- Transfer and register currency to the contract

## Accumulating interest on savings account

- Pre-requirement - create a savings account, transfer savings and register
- Accumulate interest, which registers interest back in as savings

## Closing a savings account

- Accumulate outstanding interest
- Un-register any registered savings
- Withdraw from contract the savings with interest and transfer to a given address

## Liquidation request

- ToDo

## Liquidation finalization

- ToDo

## Price feed trust transitions

- Creation as a low trust price feed
- Becoming a medium trust price feed after creation
- Becoming a high trust price feed after creation
- Being demoted from high trust to medium trust
- Being demoted from medium trust to low trust

## Price feed collecting revenue payments

- ToDo

## Monetary system scenarios

### system raises rates

- ToDo

This type of adjustment is performed after a sustained period of oversupply.

Upon finalization of the day's reported prices:

- Asses the magnitude of peg currency prices consistently being below 1.0
- Set target rate based on the above assessment
  - Adjust savings rate as below
- Adjust current rate based on target rate and rate from previous day

### System lowers rates

- ToDo

This type of adjustment is performed after a sustained period of overdemand.

Upon finalization of the day's reported prices:

- Asses the magnitude of peg currency prices consistently being above 1.0
- Set target rate based on the above assessment
  - Adjust savings rate as below
- Adjust current rate based on target rate and rate from previous day

### System adjusts savings rate

- ToDo

The adjustment is made based on sizes of savings pool and registered savings

Upon finalization of the day's reported prices:

- Determine a ceiling rate based on sizes of savings pool and registered savings
- Adjust savings rate target if it exceeds the ceiling rate

### System adjusts the collateral ratio

- ToDo

this adjustment is made based on a measure of prolonged stability in the system.

- Monitor the metric for prolonged stability
- Adjust collateral ratio as this measure changes in value

### System adjusts price feed fee rate

- ToDo

This adjustment is made based on total issuance on a logarithmic curve.

- Monitor total issuance for increases by order of magnitude
- Set new price feed revenue rate upon changes past threshold

## System variable scenarios

### System records rates

- ToDo

Upon finalization of the day's reported prices:

- Record current loan fee rate as adjusted by monetary policy automation
- Record current savings interest rate as adjusted by monetary policy automation
- Aggregate multiple recordings of the savings interest rates into higher order period if appropriate
- Aggregate multiple recordings of the savings rates into higher order period if appropriate

### Calculate savings rate on request

At any time and given any start day and end day any caller can query for the savings rate:

- Caller queries for savings rate
- System determines the recorded time periods that apply to the starting and ending days
- System calculate the full rate by averaging above rates

### Calculate loan fee on request

At any time and given any start day and end day any caller can query for the loan fee rate:

- Caller queries for loan fee rate
- System determines the recorded time periods that apply to the starting and ending days
- System calculate the full rate by averaging above rates

## Penalty scenarios

The system enforces penalties on deviations from stable operations, ones designed to incentivize the ecosystem participants to behave constructively. The most important of these ecosystem participants is the price feed providers, who are trusted with the most important part of maintaining the system's health and integrity.

### Price feed instability penalty

- ToDo

### Price feed dispute penalty

- ToDo

### Price feed banning

Price feeds that fail to report delayed prices for more than a week are banned from the medium trust list, and the entirety of their revenue pool is transferred to the savings pool.

### Price feed down-voting penalty

- ToDo

## Negative scenarios

In software engineering and testing we have the "happy path" which represents the system functioning in the most productive state, and then we have "un-happy path" or negative scenarios which represents the scenarios where something goes wrong and the system must handle them.

### Loan negative scenarios

- Creating loan contract instance outside of the system - should result in unusable contract instance
- Contract created by one user, being called by another - should result in reverted call
- Depositing or issuing with contract without allocation - should result in reverted call
- Issuing currency exceeding system threshold - should result in reverted call
- Withdrawing ETH exceeding system threshold - should result in reverted call
- Returning more than issued currency - should result in reverted call

### Price feed negative scenarios

- Creating a price feed contract instance outside of the system - should result in an unusable contract instance
- Contract created by one user, being called by another - should result in reverted calls

### Savings account negative scenarios

- ToDo

- When accumulating interest with insufficient savings pool balance - the transaction should revert
  - Full un-registering and withdrawing from contract skipping interest should complete

## Edge case scenarios

### System lifetime management

- **System bootstrap** - Bootstrap the system from `Empty` state with no price feeds to `Stable`  with one price feed
- **System wind-down** - Through passage of time, transitioning the system to `Empty` state. This is mostly used for testing.

### Controller accounts

When creating an on-chain price feed contract, the price feed providers are expected to provide a very high level of security in controlling the contract's activities. This would also be true for particularly high value loan and savings account contracts. Although the instances of price feed, loan and savings account have to be created by the system itself, the controller of those contract instances can be a multi-security-level contract. This proxy contract could be controlled in turn by other relatively less secure external accounts.

#### External account controller

For example in the case of price feeds, a feed provider can choose to alternatively use an external account to create and control the price feed. With this option, security of the private key representing that account becomes equivalent to the security of private key itself, and is therefore of paramount importance for the provider.

- Create the price feed contract instance using an external account, then call it directly
- Create the loan contract instance using an external account, then call it directly
- Create the savings account contract instance using an external account, then call it directly

#### Contract controller

The controller contracts would create the price feed, loan or savings account contract instance programmatically, by calling into the main system contract, and proxy all subsequent calls securely to the contract instances throughout their lifetime.

- Create the price feed contract instance using a controller contract, then proxy calls through it
- Create the loan contract instance using a controller contract, then proxy calls through it
- Create the savings account feed contract instance using a controller contract, then proxy calls through it

### Down-voting price feeds from savings accounts

- ToDo

## Appendix

### Personas

#### Money user and holder

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
