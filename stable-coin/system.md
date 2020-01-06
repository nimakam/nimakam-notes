# The system - A trust-minimized, governance-minimized, collateral-backed stable-coin

The proposal describes a collateral backed stable-coin where the native blockchain value token (in this case ETH) is the exclusive collateral type, and where the stable-coin is pegged to a widely available real world currency (in this case USD $). Unlike other similar systems however, this proposal does not consist of an on-chain governance process or tokens for governance or equity. The proposal believes that by eliminating these, in favor of an on-chain incentive system, centralization is reduced, and capital efficiency of the system is increased.

References:

- [Vision](./vision.md)
- [The product](./product.md)
- [The ecosystem](./ecosystem.md)
- [Security](./security.md)

## Accounts interacting with contracts

- **Money users** - These are regular consumers that hold, use or keep the pegged currency in their blockchain savings account. The target groups that could most benefit from such an offering are the un-banked and those with limited access to a stable Store of Value (SoV) from countries with dysfunctional monetary policies.
- **Loan takers** - Holders of ETH that decide to take out a loan against their holdings. The main incentive for this group consists of being long on their ETH investment, while being able to deploy its liquid value. They may also to a lesser extent be motivated by the technology itself, however this is not a sustainable incentive.
- **Price feed providers** - Providers of accurate rates of exchange between ETH, the reference asset as well as the pegged currency. These providers are expected to compete in establishing trust amongst the loan takers, and in return be monetarily compensated based on the level of trust they establish, and based on following the hard rules set by the loan system.
- **Loan liquidators** - Liquidators compete with each other to monitor, speculate on the liquidation status of loans (debt positions), and trigger liquidation when they foresee liquidation conditions in accordance with the loan system's hard definition of liquidation.

## Currencies

The system supports pegging to any relatively stable real world currency, as well as other relatively stable baskets of assets, always backed with the most trust-less blockchain collateral (ETH in case of Ethereum). The main viable implementation of this system however will focus on the US dollar due to its existing ubiquity.

- **Pegged currency** - ie Pegged USD aka pegged dollar - This is the token (ERC 20 in Ethereum) represented in Ethereum that is being pegged to the real world referenced currency.
- **Reference currency** - ie USD $ - This is the real world currency the pegged currency will be pegged to
- **Native value token** - ie ETH on Ethereum - This is always the backing collateral token due to its trust minimization

Any user can create a new currency peg on the blockchain, by deploying the open source contract along with a token representing their pegged currency, as well as an initial price feed contract.

## Volatility

Historically, stable currencies have not shown a high level of short term volatility, where for example the price goes down 20% one day and goes back up a few minutes or hours. As such transaction delays have a much smaller chance of triggering costs to a stakeholder. There is often however clear longer term trends that can be observed with stable currency, at different points in time.

However one always needs to be prepared for short term volatility of the native value token due to unknown knowns such as general boom and bust cycles (or events), as well as unknown unknowns we can't even imagine. Although not likely to occur in case of a mature blockchain, it is entirely reasonable to consider an hour long drop in the order of 50%, or a sudden rise in the order of 400%, as a possibilities, and prepare for them.

### A note on ETH and Ethereum

Since ETH is the other side of the first viable product based on our proposed financial instrument, its volatility also affects our considerations. ETH in the recent years, due to its increasing uses as gas, speculative investment, and collateral, has been relatively more stable as compared to years before. Also due to its future staking use in Ethereum 2.0, we expect its long term volatility to decrease in general. However, it remains primarily a speculative asset subject to significant volatility.

## Constraint adjustments

In an ideal loan (debt position) system, one would expect perfect trust of the price feeds, very fine grained price feed resolution, and instantaneous response to liquidation conditions. However, given the constraints of blockchain systems, as well as the urgent need for simplification, in order to reduce risks and increase efficiency, we can choose to bend the rules as long as these rules are communicated clearly and are acceptable to stakeholders, and they result in a secure system overall.

### Liquidation persistence risk adjustment

The most acceptable cases of liquidation from the perspective of a loan taker is when there is a significant and non-intermittent drop in the value of the collateral, and they've had enough time to respond to it. We can adjust the definition of acceptable liquidation to such cases, and ask the loan liquidators to take on the additional risk of having to predict if the drop is non-intermittent. We would however need to compensate the liquidator for the additional risk they are taking. It is thus become acceptable to condition liquidation upon the drop being persistent over the course of a few days and expect the loan liquidator to make a judgement on the likelihood of this persistence, and take a profit or loss accordingly.

### Time constraint adjustments

One of the key insights that helps with efficiency and simplicity of this on-chain loan system is that using a collateral in smart contract to peg relatively stable currencies, does not require a high level of time sensitivity, in the following ways:

- **Liquidation process delay** - Given the intent and requirements from loan takers as well as loan liquidators, the liquidation triggering or the dispute process do not necessarily have to occur in real time, and can be delayed, even lasting for days, as long as they occur in a predictable manner.
- **Low time resolution** - One does not require a perfectly full resolution set of prices, in order to confirm a persistent drop in prices over a long period of time. The only case where higher resolution helps is determining the liquidation bid winner, as the first actor that submits a liquidation request right before passing solvency threshold. (ToDo - mitigate against the risk of collusion to win liquidation by manipulating price feed)

## Loan (debt position)

**Price feed allocation** - Every debt position can allocate by weight, one or many price feeds, which her position state will depend on. For a given loan, these allocations are weighted by percentages that add up to 100%. At the whole system level, these percentages are added together weighted by the value of each loan. For example a loan of value $100,000 that has two allocations A at 30% and B at 70%, will contribute to the system wide price feed allocation pools by $30,000 for A and $70,000 for B.

From the perspective of reducing risk of system capture, it is ideal that there be more price feeds allocations, and that they be easily changed in case of bad behavior by price feeds. On the other hand however, an excessive number of allocations will cause excessive gas cost and cognitive overhead for the loan takers and other stakeholders. An average of 3 allocations seems like a good target, thus a max value of 5 is reasonable. See [maximum price feed allocation](#magic-values).

Price feed allocation process is added as a separate call to the loan contract despite adding and extra step in some  cases (eg. single allocation creation), and the call's additional complexity, due to the following reasons:

- We aim not incentivize single allocations, and thus choose not to enable a simpler version of contract creation with single allocation.
- We aim to make allocation changes no more difficult than the initial allocation, and so, we will reuse the allocation process both for initial creation and subsequent changes made to allocation.
- The level of complexity proposed does not exceed the loan takers assumed level of sophistication and tolerance for usability costs.

**Liquidation trigger decision** - A 100% allocation to one price feed will mean that liquidation decision will be solely made based on the price feed, and contents of the position itself. A combination of say 3 price feeds with 33.3% each will mean that liquidation condition will trigger only if all 3 price feeds are in approximate agreement, otherwise the position will have to go through the dispute resolution process.

**Loan fee allocation** - A portion of the loan fee paid by each loan taker to a given price feed provider, is directly proportional to the corresponding price feed's allocation in that specific debt position. This fee goes toward a pool of liquidity associated with the price feed provider

## Price feed liquidity pool

**Loan fees** - Each price feed has a corresponding global liquidity pool that increases in value as a result of an incoming portion of loan fees.

**Dispute resolution credibility** - The total size of the price feed liquidity pool affects their level of credibility during dispute resolution phase.

**Dispute penalties (slashing)** - During the dispute process, any penalties issued to the price feed provider will come out of their liquidity pool. This is to incentivize the provider into constructive behavior.

**Delayed/gradual/partial payouts** - Price feed providers need to have a sustainable business model and so they are expected to have an income from the loan fees. This income takes the form of a delayed and gradual payout from the price feed liquidity pool belonging to the feed provider. The payout is long term delayed in order to incentivize the price feed provider to maintain a constructive long term engagement with the platform. The payout is partial because there needs to be a significant liquidity pool to use in case of dispute penalties.

## Savings liquidity pool

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

## Price feed delay and resolution

The level of delay and resolution offered by a price feed provider will depend on a few important considerations amongst others, and we trust the providers to consistently reach an equilibrium based on these factors:

1. **Market conditions** - The level of demand and competitive differences in the market determines characteristics of the offered price feed. At one extreme the market's demand may not exceed that of the system where loan takers accept the 1 day delay and 1 hour resolution, at another extreme, the market may demand instantaneous recording of prices on the blockchain, to enable almost instantaneous loan confirmation.
2. **Cost of reducing delay** - Cost of reducing price recording delays on the blockchain, driven mainly by gas cost. At one extreme the provider may choose to record values 1 time per day with minimum gas cost (commonly <1$), or at the other extreme they may incur that gas cost on almost every block for instantaneous records.
3. **Cost of high resolution** - Cost of providing high resolution records driven mainly by storage cost. At one extreme, the provider may choose to record prices every 1 hour, minimizing storage cost. At another extreme, the provider may choose to provide up to the block price records despite significant storage cost.

## Liquidation process

Liquidation can be proposed by any blockchain user, who agrees to put up a deposit, and ask for a specific debt liquidation position to be triggered, at the time of the request. However the actual decision would be triggered if the specific monetary conditions of the position merit it, and after the delayed dispute process also issues the validity of that request.

## Loan fee

Loan fees are varied based on the global equilibrium price of the pegged currency, in order to incentivize increase or decrease the pegged currency supply based on the creation or cloning of debt positions, and thus affect the equilibrium price of the pegged currency itself from the supply side.

## Savings rate

Loan fees are also varied based on the global equilibrium price of the pegged currency, in order to incentivize increase or decrease the pegged currency supply based on changing the demand for pegged currency by consumers and thus affecting the equilibrium price.

## Savings account

Locking an amount of pegged currency in the savings contract, and specifying a payout address, will allow for a paying out the savings rate for the duration time of that locking. An anonymous call to perform the payout, calculates the to-date savings interest rate and sets a timestamp for future payout trigger calls. An owner call to close the savings position will also payout the balance as will as interest up to that date.

## Magic values

**Maximum price feed delay** - ~ 1 day - x blocks
**Minimum price feed resolution** - ~ 1 hour - x blocks
**Small cumulative range** - 68.2689492137% - Cumulative volume of the sample median, equivalent to values within [μ-σ, μ+σ] in [normal distribution](https://en.wikipedia.org/wiki/Normal_distribution).
**Large cumulative range** - 95.4499736104% - Cumulative volume of the sample median, equivalent to values within [μ-2σ, μ+2σ] in [normal.distribution](https://en.wikipedia.org/wiki/Normal_distribution).
**Maximum price feed allocations** - 5

## Penalties

### Price feed delay and resolution penalty

All percent-based (%) penalties apply to the corresponding provider's price feed liquidity pool.

- **Single missing value penalty** - Missing any set of values for each one-off 1 hour window within 1 day results in a penalty of 2% for that specific violation.
- **Consecutive missing values penalty** - Missing any consecutive set of n x 1 hour values within 1 day results in a penalty of n x 2% for that violation. This penalty grows up to 48% per day. (38.43% if it were 24 non-consecutive violations).

## Price feed consensus violation penalties

- ToDo

## Dispute process

- ToDo

## Front running resistance

Performing liquidations asynchronously and through and request initialization and finalization process, and providing aan initial grace window of a few blocks, ensures that no one can front-run another request and prevent them from participating also. At worst case, the two almost-simultaneous requests will share in the proceeds.

Also anonymizing liquidation requests, ensures that no front-runners can highjack the reputation of another liquidator, and requires them to also have their own logic for evaluating the liquidation conditions, at which point it no longer is much of a front running attempt anyways.

## Versioning - for possibility of hard-forks

The ultimate goal of such a decentralized smart contract system is to be ownerless and live forever. That is, if the current open source implementation were the solution to our original stable-coin problem, there should be no subsequent version needed.

However, due to possibilities of future upgrades to the underlying blockchain itself, as well as due to the remote possibility that the system may, at some point, operate in some unexpected ways, we are required to at least consider the possibility of winding down this version in favor of a next one.

We are currently witnessing this type of transition with the SAI to DAI migration by Maker. There are a few lessons to be learned from this experience, in the remote case migration is needed:

## Debt position restructuring - "loan refinancing"

Switching costs - In the market today, "moving" debt positions is easy and efficient in cases of transitioning between loan mechanisms (ie Maker and Compound), or between versions of the same debt position contract (ie Maker SAI to DAI).

Marginal cost - Due to the large average value of debt position seen up to now, we can assume that recreating debt positions comes at marginal cost.

Compared with the cases mentioned above, an equivalent efficiency can be achieved by just performing a position recreation every time a major change is made to the position. Using this simple mechanism has the potential of significantly simplify the contract logic and potential for mistakes. This can become a building block for a set of processes such as for updating loan fee allocations, and upgrading positions to future versions of the contract.
