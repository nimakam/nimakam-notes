# The system - Trust-minimized, governance-minimized, collateral-backed stable-coin system <!-- omit in toc -->

This research proposal describes a **collateral-backed** **stable-coin** system implemented on a public blockchain, where the exclusive backing collateral is the **native blockchain asset token**, and where the stable-coin is pegged to the value of a widely accepted **reference currency**.

A collateral backed stable-coin system is one that ensure then stable value of a digital token, based on securing backing collateral of equal or higher value. Variations of such a system, such as MakerDAO's DAI token, have already been implemented on public blockchain smart contracts. In case of our **MVP implemented on Ethereum**, the **native blockchain asset token** is **ETH** and the **reference currency** is **USD $**. Unlike other similar systems however, this proposal contains **no on-chain governance process** and **no tokens for governance or equity**. The proposal believes that eliminating these, in favor of an on-chain incentive system, **reduces centralization**, and **increases the capital efficiency** of the system.

Other sections outline:

- [Vision](./vision.md)
- [The product](./product.md)
- [The ecosystem](./ecosystem.md)
- [Security](./security.md)

Section outline:

- [Actors](#actors)
- [Currencies](#currencies)
  - [Pegged currency money](#pegged-currency-money)
  - [Backing asset token](#backing-asset-token)
- [Loan (debt position)](#loan-debt-position)
  - [Loan fee](#loan-fee)
  - [Liquidation process](#liquidation-process)
  - [Liquidation dispute process](#liquidation-dispute-process)
  - [Other loan features](#other-loan-features)
  - [Simplifying changes to loans](#simplifying-changes-to-loans)
- [Price feed](#price-feed)
  - [Price feed liquidity pool](#price-feed-liquidity-pool)
  - [Price feed delay and resolution](#price-feed-delay-and-resolution)
  - [Dispute process](#dispute-process)
  - [Price feed consensus violation penalties](#price-feed-consensus-violation-penalties)
- [Savings account](#savings-account)
  - [Savings liquidity pool](#savings-liquidity-pool)
  - [Savings rate](#savings-rate)
- [Automated monetary system](#automated-monetary-system)
- [Notable constraint adjustments](#notable-constraint-adjustments)
  - [Loan taking process adjustment](#loan-taking-process-adjustment)
  - [Liquidation process adjustment](#liquidation-process-adjustment)
  - [Time constraint adjustments](#time-constraint-adjustments)
- [Penalties](#penalties)
  - [Price feed delay and resolution penalty](#price-feed-delay-and-resolution-penalty)
- [Appendix](#appendix)
  - [Magic values](#magic-values)
  - [Front running resistance](#front-running-resistance)
  - [Volatility](#volatility)
    - [Note on ETH and Ethereum volatility](#note-on-eth-and-ethereum-volatility)
  - [Versioning - in case of emergency (hard-forks)](#versioning---in-case-of-emergency-hard-forks)

## Actors

- **Money users** - These are **regular consumers** that **use**, or **hold** the pegged currency in their blockchain-based **savings account**. The major target groups that could most benefit from such an offering are **the un-banked** and those with limited access to a **stable Store of Value** (SoV) from countries with dysfunctional monetary policies. This could also be used by the **early adopter community** of a public blockchain.
- **Loan takers** - Most commonly existing **native token holders** that decide to **take a loan** against their holdings. The main incentive for this group consists of being **long native token**, while being able to **deploy its value**. They may also initially be **motivated by the technology** itself, however this is not a long-term sustainable incentive.
- **Price feed providers** - Providers of accurate rates of exchange between native token, the reference asset as well as the pegged currency. These providers are expected to compete in establishing trust amongst the loan takers, and in return be monetarily compensated based on the level of trust they establish, and based on following the hard rules set by the loan system.
- **Loan liquidators** - Liquidators **compete** with each other to monitor, speculate on the liquidation status of loans (debt positions), and **trigger liquidation** when they foresee **liquidation conditions** in accordance with the loan system's hard definition of liquidation.

## Currencies

The system supports pegging to any relatively stable real world currency, as well as other relatively stable baskets of assets, always backed with the most trust-minimized blockchain collateral (ETH in case of Ethereum). The main viable implementation of this system however will focus on the US dollar due to its relative ubiquity at time of this writing.

- **Pegged currency** - ie Pegged USD aka pegged dollar - This is the custom programmed token (ERC 20 in Ethereum), represented on the public blockchain, that is being pegged to the real world referenced currency by the system.
- **Reference currency** - ie USD $ - This is the real world currency, or unit of account, the pegged currency will be pegged to.
- **Native value token** - ie ETH on Ethereum - This is the most trust-minimized asset token on the host blockchain and will always be the backing collateral token.

Any user can create a new currency peg on the blockchain, by deploying the open source contract along with a token representing their pegged currency, as well as an initial price feed contract.

### Pegged currency money

The pegged currency money is the product that is ultimate offered to everyday digital money users and holders. It will have a stable value, the unit of which, is already (or will be) widely accepted and used in everyday commerce transactions by buyers and merchants. The Ethereum based MVP implementation of this system will use a custom ERC20 that represents the value of the US Dollar ($).

The token requires the base functionality already available in common programmable digital tokens, such as basic transfer functionality between accounts. The Ethereum community's version of this functionality is described by the [ERC20 standard](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md) also described [here](https://docs.ethhub.io/built-on-ethereum/erc-token-standards/erc20/);

Additional functionality will be implemented to respectively "mint" or "burn" tokens upon "issuance" or "return" of the pegged currency on the loan contract.

### Backing asset token

As mentioned, any public blockchain's native asset token satisfies the role of backing asset given that it is likely to be:

- The most trust-minimized asset token on the blockchain.
- Widely used as a Store of Value (SoV) by the blockchain users.

It is essential for the system to prevent significant issuance of pegged currency, without securing a corresponding value of backing asset, per loan instance, and for the system as a whole. Similarly, it is crucial for the system to respond to backing asset release requests, when corresponding pegged currency is being returned to the system. In a healthy system, the value of the backing asset token is greater than the pegged currency by a healthy margin, in order to insure against the possibility of a major devaluation in that backing asset.

## Loan (debt position)

Loans are the structures that hold the state and value of the collateral backing aspect of the system. They have the following notable properties:

- There is a separate loan contract instance per instance of real world loan taken
- The loan contract holds the state and value related to each loan
- The loan taker is the ultimate owner of the value contained on a loan instance, and directly interacts with it.
- The greater system is consulted every time a change is made to the loan. Disallowed changes automatically revert the transaction.

### Loan fee

Loan fees are varied based on the global equilibrium price of the pegged currency, in order to incentivize increase or decrease the pegged currency supply based on the creation or cloning of debt positions, and thus affect the equilibrium price of the pegged currency itself from the supply side.

### Liquidation process

Liquidation can be proposed by any blockchain user, who agrees to put up a deposit, and ask for a specific debt liquidation position to be triggered, at the time of the request. However the actual decision would be triggered if the specific monetary conditions of the position merit it, and after the delayed dispute process also issues the validity of that request.

### Liquidation dispute process

- ToDo

### Other loan features

**Loan fee allocation process** - A portion of the loan fee paid by each loan taker to a given price feed provider, is directly proportional to the corresponding price feed's allocation in that specific debt position. This fee goes toward a pool of liquidity associated with the price feed provider. See below for details.

**Price feed allocation table** - Every debt position can allocate by weight, one or many price feeds, which her position state will depend on. For a given loan, these allocations are weighted by percentages that add up to 100%. At the whole system level, these percentages are added together weighted by the value of each loan. For example a loan of value $100,000 that has two allocations A at 30% and B at 70%, will contribute to the system wide price feed allocation pools by $30,000 for A and $70,000 for B.

From the perspective of reducing risk of system capture, it is ideal that there be more price feeds allocations, and that they be easily changed in case of bad behavior by price feeds. On the other hand however, an excessive number of allocations will cause excessive gas cost and cognitive overhead for the loan takers and other stakeholders. An average of 3 allocations seems like a good target, thus a max value of 5 is reasonable. See [maximum price feed allocation](#magic-values).

Price feed allocation process is added as a separate call to the loan contract despite adding and extra step in some  cases (eg. single allocation creation), and the call's additional complexity, due to the following reasons:

- We aim not incentivize single allocations, and thus choose not to enable a simpler version of contract creation with single allocation.
- We aim to make allocation changes no more difficult than the initial allocation, and so, we will reuse the allocation process both for initial creation and subsequent changes made to allocation.
- The level of complexity proposed does not exceed the loan takers assumed level of sophistication and tolerance for usability costs.

**Liquidation trigger decision** - A 100% allocation to one price feed will mean that liquidation decision will be solely made based on the price feed, and contents of the position itself. A combination of say 3 price feeds with 33.3% each will mean that liquidation condition will trigger only if all 3 price feeds are in approximate agreement, otherwise the position will have to go through the dispute resolution process.

### Simplifying changes to loans

Switching costs - In the market today, "moving" debt positions is easy and efficient in cases of transitioning between loan mechanisms (ie Maker and Compound), or between versions of the same debt position contract (ie Maker SAI to DAI).

Marginal cost - Due to the large average value of debt position seen up to now, we can assume that recreating debt positions comes at marginal cost.

Compared with the cases mentioned above, an equivalent efficiency can be achieved by just performing a position recreation every time a major change is made to the position. Using this simple mechanism has the potential of significantly simplify the contract logic and potential for mistakes. This can become a building block for a set of processes such as for updating loan fee allocations, and upgrading positions to future versions of the contract.

The issue however is that a pool of pegged currency will be required to close the initial loan and open the other one. Such a pool would have to be separately managed

## Price feed

For each pegged currency the price feed provides 2 sets of exchange rates, ETH in reference currency, as well as in its pegged version. For the first viable case of pegged US dollar against ETH the required value sets are:

- ETH / USD
- ETH / Pegged USD

The system enforces having prices available within 1 day (See [maximum price feed delay](#magic-values)) enforced by a hard penalty. However price feeds can choose to provide their price records more frequently as they see fit with their business model.
The system also enforces a minimum resolution of 1 hour (See [minimum price feed resolution](#magic-values)) as the space between price records.

Price feed values are results of formulas based on a sample of known trade prices and volumes to each specific provider. The ideal case is for a provider to have full access to the universe of all legitimate trades along with their volume and price, and good faith providers should strive to do so. However due to many factors, including uncertainty around authenticity of info from some sources or exchanges, as well as pure technical limitations, each provider will choose a specific set of samples they can depend on, at any given time.

For each time period corresponding to the feed resolution, price feed are expected to provide the following values from their sample:

- Median.
- Minimum and maximum within 34.1% (See [small cumulative range](#magic-values)) cumulative volume of the sample median - Equivalent to [μ-σ, μ+σ] in normal distribution.
- Minimum and maximum within 47.7% (See [large cumulative range](#magic-values)) cumulative volume of the sample median - Equivalent to [μ-2σ, μ+2σ] in normal distribution.

### Price feed liquidity pool

**Loan fees** - Each price feed has a corresponding global liquidity pool that increases in value as a result of an incoming portion of loan fees.

**Dispute resolution credibility** - The total size of the price feed liquidity pool affects their level of credibility during dispute resolution phase.

**Dispute penalties (slashing)** - During the dispute process, any penalties issued to the price feed provider will come out of their liquidity pool. This is to incentivize the provider into constructive behavior.

**Delayed/gradual/partial payouts** - Price feed providers need to have a sustainable business model and so they are expected to have an income from the loan fees. This income takes the form of a delayed and gradual payout from the price feed liquidity pool belonging to the feed provider. The payout is long term delayed in order to incentivize the price feed provider to maintain a constructive long term engagement with the platform. The payout is partial because there needs to be a significant liquidity pool to use in case of dispute penalties.

### Price feed delay and resolution

The level of delay and resolution offered by a price feed provider will depend on a few important considerations amongst others, and we trust the providers to consistently reach an equilibrium based on these factors:

1. **Market conditions** - The level of demand and competitive differences in the market determines characteristics of the offered price feed. At one extreme the market's demand may not exceed that of the system where loan takers accept the 1 day delay and 1 hour resolution, at another extreme, the market may demand instantaneous recording of prices on the blockchain, to enable almost instantaneous loan confirmation.
2. **Cost of reducing delay** - Cost of reducing price recording delays on the blockchain, driven mainly by gas cost. At one extreme the provider may choose to record values 1 time per day with minimum gas cost (commonly <1$), or at the other extreme they may incur that gas cost on almost every block for instantaneous records.
3. **Cost of high resolution** - Cost of providing high resolution records driven mainly by storage cost. At one extreme, the provider may choose to record prices every 1 hour, minimizing storage cost. At another extreme, the provider may choose to provide up to the block price records despite significant storage cost.

### Dispute process

- ToDo

### Price feed consensus violation penalties

- ToDo

## Savings account

Locking an amount of pegged currency in the savings contract, and specifying a payout address, will allow for a paying out the savings rate for the duration time of that locking. An anonymous call to perform the payout, calculates the to-date savings interest rate and sets a timestamp for future payout trigger calls. An owner call to close the savings position will also payout the balance as will as interest up to that date.

### Savings liquidity pool

### Savings rate

Loan fees are also varied based on the global equilibrium price of the pegged currency, in order to incentivize increase or decrease the pegged currency supply based on changing the demand for pegged currency by consumers and thus affecting the equilibrium price.

## Automated monetary system

## Notable constraint adjustments

In an ideal loan (debt position) system, one would expect perfect trust of the price feeds, very fine grained price feed resolution, and instantaneous response to loan taking requests or liquidation requests in appropriate conditions. However, given the constraints of highly decentralized protocols on public blockchain systems, as well as the urgent need for simplification, in order to reduce risks and increase efficiency, we choose to bend the ideal rules as long as these changes are communicated clearly to and are accepted by stakeholders, and as long as they result in a secure system overall.

### Loan taking process adjustment

Normally the loan taking process should be expected to complete in one transaction, however during times of dispute between the rates provided by the system's price feed providers, it is reasonable to delay the loan taking process by a few days. Normal operation should be resumed on all other occasions.

### Liquidation process adjustment

The most acceptable cases of liquidation from the perspective of a loan taker is when there is a significant and non-intermittent drop in the value of the collateral, and they've had enough time to respond to it. We can adjust the definition of acceptable liquidation to such cases, and ask the loan liquidators to take on the additional risk of having to predict if the drop is non-intermittent. We would however need to compensate the liquidator for the additional risk they are taking. It is thus become acceptable to condition liquidation upon the drop being persistent over the course of a few days and expect the loan liquidator to make a judgement on the likelihood of this persistence, and take a profit or loss accordingly.

### Time constraint adjustments

One of the key insights that helps with efficiency and simplicity of this on-chain loan system is that using a collateral in smart contract to peg relatively stable currencies, does not require a high level of time sensitivity, in the following ways:

- **Liquidation process delay** - Given the intent and requirements from loan takers as well as loan liquidators, the liquidation triggering or the dispute process do not necessarily have to occur in real time, and can be delayed, even lasting for days, as long as they occur in a predictable manner.
- **Low time resolution** - One does not require a perfectly full resolution set of prices, in order to confirm a persistent drop in prices over a long period of time. The only case where higher resolution helps is determining the liquidation bid winner, as the first actor that submits a liquidation request right before passing solvency threshold. (ToDo - mitigate against the risk of collusion to win liquidation by manipulating price feed)

## Penalties

### Price feed delay and resolution penalty

All percent-based (%) penalties apply to the corresponding provider's price feed liquidity pool.

- **Single missing value penalty** - Missing any set of values for each one-off 1 hour window within 1 day results in a penalty of 2% for that specific violation.
- **Consecutive missing values penalty** - Missing any consecutive set of n x 1 hour values within 1 day results in a penalty of n x 2% for that violation. This penalty grows up to 48% per day. (38.43% if it were 24 non-consecutive violations).

## Appendix

### Magic values

In software engineering, magic values refer to constant values selected by the software author, that determine the constraints that the system operates under. The selection of these values often involves significant deliberation and requires some level of research and justification. It is always a good question to ask why a specific "magic value" was selected as opposed to higher or lower values.

**Maximum price feed delay** - ~ 1 day - x blocks
**Minimum price feed resolution** - ~ 1 hour - x blocks
**Small cumulative range** - 68.2689492137% - Cumulative volume of the sample median, equivalent to values within [μ-σ, μ+σ] in [normal distribution](https://en.wikipedia.org/wiki/Normal_distribution).
**Large cumulative range** - 95.4499736104% - Cumulative volume of the sample median, equivalent to values within [μ-2σ, μ+2σ] in [normal.distribution](https://en.wikipedia.org/wiki/Normal_distribution).
**Maximum price feed allocations** - 5

### Front running resistance

Performing liquidations asynchronously and through and request initialization and finalization process, and providing aan initial grace window of a few blocks, ensures that no one can front-run another request and prevent them from participating also. At worst case, the two almost-simultaneous requests will share in the proceeds.

Also anonymizing liquidation requests, ensures that no front-runners can highjack the reputation of another liquidator, and requires them to also have their own logic for evaluating the liquidation conditions, at which point it no longer is much of a front running attempt anyways.

### Volatility

Historically, stable currencies have not shown a high level of short term volatility, where for example the price goes down 20% one day and goes back up a few minutes or hours. As such transaction delays have a much smaller chance of triggering costs to a stakeholder. There is often however clear longer term trends that can be observed with stable currency, at different points in time.

However one always needs to be prepared for short term volatility of the native value token due to unknown knowns such as general boom and bust cycles (or events), as well as unknown unknowns we can't even imagine. Although not likely to occur in case of a mature blockchain, it is entirely reasonable to consider an hour long drop in the order of 50%, or a sudden rise in the order of 400%, as a possibilities, and prepare for them.

#### Note on ETH and Ethereum volatility

Since ETH is the other side of the first viable product based on our proposed financial instrument, its volatility also affects our considerations. ETH in the recent years, due to its increasing uses as gas, speculative investment, and collateral, has been relatively more stable as compared to years before. Also due to its future staking use in Ethereum 2.0, we expect its long term volatility to decrease in general. However, it remains primarily a speculative asset subject to significant volatility.

### Versioning - in case of emergency (hard-forks)

The ultimate goal of such a decentralized smart contract system is to be ownerless and live forever. That is, if the current open source implementation were the solution to our original stable-coin problem, there should be no subsequent version needed.

However, due to possibilities of future upgrades to the underlying blockchain itself, as well as due to the remote possibility that the system may, at some point, operate in some unexpected ways, we are required to at least consider the possibility of winding down this version in favor of a next one.

We are currently witnessing this type of transition with the SAI to DAI migration by Maker. There are a few lessons to be learned from this experience, in the remote case migration is needed: