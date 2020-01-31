# Security <!-- omit in toc -->

In this section we will consider all the significant ways that system and ecosystem's health can be at risk of harm, and attempt to find layered mitigations that bring that risk down significantly.

Other sections outline:

- [Vision](./vision.md)
- [The product](./product.md)
- [The system](./system.md)
- [The ecosystem](./ecosystem.md)

This section outline:

- [System and subsystem health](#system-and-subsystem-health)
  - [Attacks vs threats](#attacks-vs-threats)
  - [System state breakdown](#system-state-breakdown)
- [Most notable attacks](#most-notable-attacks)
  - [Price feed capture by whales](#price-feed-capture-by-whales)
  - [Reporting native above market](#reporting-native-above-market)
  - [Reporting native below market](#reporting-native-below-market)
  - [Reporting peg above market](#reporting-peg-above-market)
- [External event threats](#external-event-threats)
  - [Large native price drop](#large-native-price-drop)
    - [Persistent large native price drop](#persistent-large-native-price-drop)
  - [Large native price rise](#large-native-price-rise)
- [Other threats and attacks](#other-threats-and-attacks)
  - [Performance degradation DoS attack](#performance-degradation-dos-attack)
  - [Invalid liquidation attack](#invalid-liquidation-attack)
  - [Liquidation front running attack](#liquidation-front-running-attack)
  - [Instant issuance before reporting large price drop](#instant-issuance-before-reporting-large-price-drop)
  - [Price feed provider collusion attack](#price-feed-provider-collusion-attack)
  - [Instant issuance after reporting above market instant price](#instant-issuance-after-reporting-above-market-instant-price)
  - [Price feed fault](#price-feed-fault)
- [Appendix](#appendix)
  - [Words of estimative probability](#words-of-estimative-probability)

## System and subsystem health

System and ecosystem health are two sides of the same coin, and they generally depend on the long term stability of the pegged currency token. Following are the significant categories of threats to system health:

- **Periodic equilibrium disruption** [threat] - Periodic instability caused by disruptions to pegged currency supply demand equilibrium, that are regularly stabilized by the system itself.
- **Destabilizing external events** [threat] - Events such as large drops in native token price that have the potential to harm the system's collateral backing of issued pegged currency.
- **Disruptive behavior by existing stakeholders** [attack] - Harm to the system could come from existing stakeholders, who may benefit from the system in some way, change their behavior from constructive to self-serving.
- **Disruptive behavior by external actors** [attack] - Actors who are not previously part of the ecosystem, may harm the system by intervening and disrupting the system for their own benefits.

Given that a successful running instance of system, will hold large numbers of value, and that it runs on a public permissionless blockchain environment, it is a very inviting target (honeypot) for any one person or group with large financial needs and low commitment to ethical behavior. Some likely perpetrators of any such attacks are:

- International criminal organizations with cyber capabilities
- Cyber-criminal organizations for hire
- Rogue state with cyber military capabilities

### Attacks vs threats

Threats are any phenomenon or events that have the potential to harm the system and ecosystem's health. Threats may rise from external macro events, unintentional mistakes, or random accidents.

Attacks, are a subset of threat, caused by action intending to harm the system and ecosystem's health, generally for the benefit of the attacker. The attacker is sometimes an external actor or a combination of existing ecosystem actors.

### System state breakdown

Price reporting health:

- Delayed price reporting state - Empty, Stable, Unstable, Dispute
- Instant price reporting state - Empty, Stable, Unstable, Dispute
- Native token market price stability state - Stable, Unstable

Foundation health and function:

- > Daily instant loan limit rate: Stable (5%), Unstable (0.5%), Dispute or Empty (0%)
  - Both Instant and delayed states (from last finalized day), will be applied with `max` logic.
- > Loan liquidation state - Stable delay (7 days), Postponed [on Dispute]
  - Only delayed reporting state is applied

Currency peg health and function:

- Pegged currency equilibrium state - Stable, Oversupply, Overdemand
  - Magnitude: Cumulative sum of daily peg price deviation, for all the days in a row that rate has been over (or under) 1.00.
- > Monetary policy - Stable, Raise rates, Lower rates

Ecosystem

- Overall ecosystem response state - Stable, Threat/attacker detection and identification, Emergency mobilization

## Most notable attacks

As a stablecoin system, the biggest risks to the health of the system, are scenarios were misalignment of incentives can even minutely cause instability in the system's normal operation. Upon examination of all significant incentive misalignment attacks to the system are a result of bad faith price reporting by price providers. Below are descriptions of the attacks, with higher potential impact than others, despite the small probability.

### Price feed capture by whales

In this scenario, a group of individuals with large ownership of native tokens, enter the system's top trust tier list of price feeds by taking large loans and allocating issuance to their own newly created price feeds. They will then use their dominance on the price feed side to penalize, ban and displace existing reputable price feeds, and thus capture the top trust tier of the system price feeds list. From there, they can abuse the system perform any of the attacks below, and exploit the value held by loan takers as well as the money holders.

Mitigations:

- **Weighing revenue pool** - Putting a weight on the price feed's revenue pool as well as its issuance allocation, is a formula for making sure newcomer price providers cannot exert undue influence by instantaneous deployment of capital. See [Trusted price feed list](./system#trusted-price-feed-list).
- **Fee prepayment** - Issuing new pegged currency requires pre-paying a certain portion of the fees meant for an upcoming period (`35 days`). See *fee prepayment* under [loan fee](./system.md#loan-fee). This is however a small percentage of the collateral used, something to the order of `0.2%` (monthly fee / collateral) = `66.6%` (issuance / collateral) * `4%` (yearly fee / issuance) / `12` (yearly fee / monthly fee).

### Reporting native above market

In this scenario, a group of price feed providers with significant issuance allocation, coordinate to report native token prices above market value. At moderate levels of distortion, say `25%`, and assuming a collateral ratio of about `150%`, there are no opportunities for abusing the system through creating new loans and profiting by exchanging the pegged currency. However when we explore more significant levels of distortion, say `100%`, there are significant opportunities to abuse the system for profit.

Take the example of `100%` distortion with ETH market price as `$200` but reported to the system contracts as `$400`. Assuming a collateral ratio of `150%` let's explore this scenario. A threshold collateralized loan can issue `$20K` for a collateral of `75 ETH` (equivalent to reported `$30K` but real value `$15K`. The `$20K` can be cashed out on the market, creating a profit from the `$5K` difference between `$15K` invested and `$20K` cashed out at a `25%` profit. It can be assumed that a significant percent of the market cap of pegged currency, say `1%`, can be cashed out without significant impact on the market price.

Continuing with the above example, the offending price providers can further profit by liquidating the same loan after price correction. Assuming a liquidation penalty of `10%`, upon correction of reported ETH price from `$400` to `$200` the loan can be liquidation with `$13,636.39` for `75 ETH` (equivalent to `$15K`), taking gain of `$1363.63` for as liquidation penalty, representing an additional `6.8%` profit. The system as a whole leaks issuance of `$6363.63` in pegged currency, a `31.81%` issuance leak for this loan.

Mitigations:

- **Penalty to distortion magnitude proportionality** - Effectively causing distortions of `+100%` is extremely difficult unless a group has a dominant issuance allocation position, which is extremely unlikely to achieve without informing the public.
- **Ineffectiveness of medium delayed price distortions** - Any successful attack requires large distortions in reporting, which entail larger penalties and incentivization for ecosystem mobilization. Lower distortions of say `25%` - `50%` do not present sufficient opportunity for taking profits through use of new loans, or the subsequent liquidation.
- **Dispute penalties** - Any group of price providers with significant issuance allocation, embarking on such an effort,risk significant losses in revenue, through the instability and dispute penalties enforced by the on-chain system
- **Effect on peg currency price** - At large scale, when an attack like this is performed, the price of pegged currency will likely drop, given the uncertainty clouding the system's operation, which limits the level of profit that can be made by the attack.

### Reporting native below market

In this scenario, a group of price feed providers with significant issuance allocation, coordinate to report native token prices below market value. At moderate levels of distortion, say `20%` the opportunities for abusing the system through liquidating existing loans are weak. At higher reported drops of say `50%` the opportunity to profit by liquidation is considerable.

Take the `20%` distortion example of ETH market price as `$200` but reported to the system contracts as `$160`. Assuming a collateral ratio of `150%` and liquidation penalty of `10%` let's explore this scenario. An at-threshold collateralized loan, originally at `$10K` for a collateral of `75 ETH` (equivalent to real value `$15K`) will now have reported value of `$12K`. The loan can be liquidated with `$10K` pegged currency for `68.75 ETH` (reportedly valued at `$11K` but with real value `$13.75K`), with `6.25 ETH` of the collateral remaining for the original loan taker. The liquidator will thus take in `$3.75K` of profit, equivalent to `37.5%`, with the same cost to the loan taker and a loss of `25%`.

Take the more extreme example of `50%` drop, with ETH market price as `$200` but reported to the system contracts as `$100`. Assuming a collateral ratio of `150%` and liquidation penalty of `10%` let's explore this scenario. An at-threshold collateralized loan, originally at `$10K` for a collateral of `75 ETH` (equivalent to real value `$15K`) will now have reported value of `$7.5K`. The loan can be liquidated with `$6.75K` pegged currency for `75 ETH` (reportedly valued at `$7.5K` but with real value `$15K`), with none of the collateral remaining for the original loan taker. The system will leak issuance of `$3.25K` in pegged currency. The liquidator will take in `$8.25K` of profit, equivalent to `122.2%`. The loan taker will be stuck with a cost of `$5K` or a loss of `33.3%`.

Mitigation

- **Real world collateralization ratio** - Starting with a large collateralization ratio of `150%` is a good start, however as observed in real world usage of on-chain collateralized debt positions, vast majority of loans are well outside the threshold conditions and have a much higher collateralization than for example the `150%` system parameter.
- **Dispute penalties** - Any group of price providers with significant issuance allocation, embarking on such an effort,risk significant losses in revenue, given the instability and dispute penalties enforced by the on-chain system

### Reporting peg above market

In this attack scenario, one or many medium to high trust price providers collude to report the value of pegged currency above what it is on the market. Let's explore the example where \{\{PegDollar\}\} market price is `$0.98` but is incorrectly reported to be `$1.02` on chain. The system monetary policy will try to increase supply by lowering loan fee rate and lowering savings rate, dropping the market price even further. This could also cause a crisis of confidence due to the instability of \{\{PegDollar\}\} and reduced demand, pushing the currency into a drop spiral.

The offending price provider(s) would take profit by having created loans before the attack, then closing the loans using the cheaper pegged currency available. Loan takers, whether they have colluded with the offending price provider or not, can profit due to the lower fees, as well as by buying cheap pegged currency to also pay off their loans.

Mitigation:

- **Dispute penalties** - Any group of price providers with significant issuance allocation, embarking on such an effort,risk significant losses in revenue, through the instability and dispute penalties enforced by the on-chain system

## External event threats

External and independent market events are some of the more significant risks to stability of the system. Here we will review a few known categories of events.

### Large native price drop

Small daily drops to the native token market price are common and are extremely likely to be managed by the system's supply demand equilibrium mechanism. Drops of the following categories can pose more significant risks:

- **Drop magnitude**
  - **Moderate** - 10% in a day - Can happen occasionally in a year
  - **Significant** - 33.3% in a day - Happens rarely in a year
- **Subsequent events**
  - **Rebound** - At least some rebound following a few days - Likely
  - **Persistent drop** - Stable trend or persistent drop following a few days - Unlikely

At moderate levels the system is extremely likely to operate as designed. Say for a drop of `10%` we take the example of ETH market price as `$200` dropping to `$180`. Assuming a collateral ratio of `150%` and liquidation penalty of `10%` let's explore this scenario. An at-threshold collateralized loan, originally at `$10K` for a collateral of `75 ETH` will have an initial value of `$15K`. After the drop it will have a value of `$13.5K`. The loan can be liquidated with `$10K` pegged currency for `61.11 ETH` (valued at `$11K`), with `13.99 ETH` (`$2518.2`) of the collateral remaining for the original loan taker. The liquidator will thus take in `$1K` of profit as the liquidation penalty, equivalent to `10%`, with the same cost to the loan taker and a loss of `6.66%` since initial investment, but more realistically `7.27%` of value of ETH after drop. The system does not leak pegged currency.

At more significant drop magnitudes, and with persistency, there are real risks to the stability of the system, namely leaking pegged currency as a result of failure to secure sufficient backing collateral.

#### Persistent large native price drop

Take the more extreme example of `33.3` drop, with ETH market price as `$200` dropping to `$133.3`. Assuming a collateral ratio of `150%` and liquidation penalty of `10%` let's explore this scenario. An at-threshold collateralized loan, originally at `$10K` for a collateral of `75 ETH` will have an initial value of `$15K`. After the drop it will have a value of `$10K`. The loan can be liquidated with `$9090` pegged currency for `75 ETH` (valued at `$10K`), with no collateral remaining for the original loan taker. The liquidator will thus take in `$909.09` of profit as the liquidation penalty, equivalent to `10%`, with the same cost to the loan taker and a loss of `6.06%` since initial investment, but more realistically `9.09%` of value of ETH after drop. The system will leak `$909.09` of pegged currency equivalent to `9.09%` of the issuance.

Mitigation:

- Delaying the finalization of liquidation requests and adding persistency requirements, ensures the more frequent cases of price rebounding do not result in liquidations.
- As observed in real world usage of on-chain collateralized debt positions, vast majority of loans are well outside the threshold conditions and have a much higher collateralization than for example the `150%` system parameter.

### Large native price rise

Small daily rises to the native token market price are common and are extremely likely to be managed by the system's supply demand equilibrium mechanism. Rises of the following categories can pose more significant risks:

- **Rise magnitude**
  - **Moderate** - 10% in a day - Can happen occasionally in a year
  - **Significant** - 50% in a day - Happen rarely in a year
- **Subsequent events**
  - **Rebound** - At least some rebound following a few days - Likely
  - **Persistent** - Stable trend or persistent drop following a few days - Unlikely

The system is extremely likely to able to handle these conditions without permanent damage to operation of the system. There is a temporary challenge to the volatility of the pegged currency price, following these changes, one that is expected to be stabilized after changes have ended.

## Other threats and attacks

### Performance degradation DoS attack

Attack consists of taking any of the following actions to degrade normal operation for other stakeholders:

- Creating new loans
- Creating new price
- Creating new savings accounts
- Performing any other operations like submitting prices

Mitigations:

- No calls initiated by a stakeholder will ever enumerate over all loans, price feeds, or savings accounts. There will be a select subset of data reported by **high trust** price feed providers (instant prices), and data by a **medium trust** providers (last week's prices), that the system contract will ensure are valid, and store them accordingly.
- The system will have multiple *states of operation*.
  - **Normal**: where no anomalies in historical prices have been detected, and where daily and instant prices are within known variability thresholds (10%).
    - Currency issuance will be instant
    - Loan liquidation will take 1 week
  - **Uncertain**: where minor anomalies have been detected such as 1. change in instant price is not reported by majority 2. drastic recent changes in allocations 3. Volatility of reported prices (20%) despite lack of dispute.
    - Currency issuance will take 2 days and will be according to historical prices
    - Loan liquidation will take 2 weeks
  - **Disputed**: where major disagreement is occurring between medium trust providers
    - Currency issuance will take 1 week and will be according to historical prices
    - Loan liquidation will take 1 month
- Any caller to the system will have to pay gas for the operations they initiate

### Invalid liquidation attack

In this scenario a liquidators relies on system's invalid reported native token prices (significantly lower than market), to liquidate another stakeholder's loan and take profit. See [Reporting native below market](#reporting-native-below-market) for description of such an attack. It does not matter if the price drop was caused by intentional or unintentional distortions in the system, the resulting profit for attacker and harm to the loan holder remain the same.

Mitigations:

**Delayed liquidation** - This is process of checking liquidation constraints against not just one reported price, but multiple prices reported over multiple days, in order to reduce chances of mistakes and increase the cost of intentional distortion over multiple days.
**Delayed price reconciliation process** - The finalized prices are a result of reconciling multiple reported prices from independent sources, which reduces the chances for mistakes or intentional abuse.
**Delayed prices** - Give the price providers a better chance to report the right historical values to the system, as opposed to having automated instant price reporting which is more subject to faults.

### Liquidation front running attack

A front runner can detect the liquidation request sent by another actor, and copy that request, submit it for execution in the same block, while jumping the line by offering miners a larger transaction fee. The aim of the attacker is to take all the profit of the liquidation away from the initial liquidator, by breaking a few common rules around submitting transactions.

Mitigations:

- **Liquidation process delay and prioritization mechanisms** - Process of liquidation does not finalize upon the request itself. Finalization is delayed,  although it does finalize requests submitted on earlier blocks, and cancels the later requests. In case of 2 requests being submitted on the same block, the payed off currency, liquidation fee and freed collateral shares are divided evenly amongst the submitters.

### Instant issuance before reporting large price drop

Drops of 40% or more are not expected to occur frequently, however in case they do happen, there is an opportunity to profit by issuing currency against a newly created loan, right before the price is updated on-chain, thus hurting other stakeholders by leaving the system with a worse collateralization position.

For example, let's assume ETH is at `$150`, and suddenly drops to `$80`, a drop of `46.6%`. If attacker were to issue maximum currency against a new loan backed by `100 ETH`, the system at that instant would assume a collateral value of `$15,000`, and with a collateralization limit of `150%`, attacker could issue as much as `$10,000` of currency. This is compared to the `$8,000` real value of collateral after drop, which results in a profit of `20%` which can be linearly scaled up depending on the amount of ETH under the attacker's control.

Mitigations:

- **Daily issuance limit** - There will be a daily currency issuance limit of `5%` as a percentage of the total issuance balance to date, that would cap any potential at-scale abuse, but would also not put a cap on the system's growth. See *Daily issuance limit* under [Issuance](./system.md#issuance).
- **Significant price change reporting by top providers** - The **high trust** price feed providers will be, through social contract, expected to reflect price changes of more than 10%, on the blockchain as soon as possible.
- **Top provider's loss of reputation, allocation and fees** -  If they fail to conform to above expectation, they can expect negative consequences in terms of loss of reputation, reduction in allocation by loan takers, and incurring other penalties.
- **Rarity, unpredictability and likely reversibility of drastic drop** - The occurrence of such drops are assumed to be unpredictable, otherwise, there are plenty of other direct ways to profit off of correct predictions. Also such occurrences are assumed to be rare, such that investing in preparation to profit from them, would be cost ineffective. Also in the likely case that the drop is reversed, the loan's collateral leverage health is restored.

### Price feed provider collusion attack

All top allocated price feed providers can collude to defraud other stakeholders by a coordinated effort to report artificially lowered market prices, then proceeding to liquidate a large number of the loans under the new artificial collateralization threshold.

Mitigations:

- **Independent allocation process and loss of future income** - The process of allocating price feeds to loans is politically independent of the providers themselves, and is likely to change significantly following such an effort. This represents a significant future cost to colluding providers. Other non-colluding providers will likely gain significant allocation as a result of this attack.
- **Loss of scheduled fee payments** - The system holds a pool of fees for each price feed provider, which it gradually releases to the provider in time. Risk to future release of these fees incentivize price feed providers to act constructively.
  - **Slashing of fee pools due to penalties** - Discrepancy in reported prices amongst top allocated price feeds results in penalties, in form of slashings from the providers' fee pools. The aftermath of such an attack, and a genuine and significant reallocation move by loan takers is likely to result in significant costs to colluding feed providers.
- **Liquidation process delay mechanism** - Process of liquidation takes a minimum of 1 week, and is only finalized if liquidation threshold violation conditions holds throughout the processing period. With the above independent reallocation mitigation, the system consensus on threshold parameters is likely to change within that 1 week, and the liquidations will be cancelled.

### Instant issuance after reporting above market instant price

Let's assume a top feed provider reports an incorrect rise of `40%` or more on-chain, and profit by issuing currency against a newly created loan, thus hurting other stakeholders by leaving the system with a worse collateralization position.

For example, let's assume ETH is at `$160`, and the provider reports it to be at `$300`, a rise of `87.5%`. If attacker were to issue maximum currency against a new loan backed by `100 ETH`, the system would assume a collateral value of `$30,000`, and with a collateralization limit of `150%`, attacker could issue as much as `$20,000` of currency. This is compared to the `$16,000` real value of collateral, which results in a profit of `20%` which can be linearly scaled up depending on the amount of ETH under the attacker's control.

Mitigations:

- **Instant price consensus process** - The system only holds an instant price valid if majority of top providers have reported it. Thus this type of attack would require the collusion of at least 2 top providers in a 3 provider environment.
- **Provider loss of reputation** - The *high trust* price feeds will be, through social contract, expected to reflect price changes of more than `10%`, on the blockchain. If they fail to do so, they can expect negative consequences in terms of loss of reputation, reduction in allocation by loan takers, and incurring other penalties. After such an attack happens, it is very difficult for the provider to convince the ecosystem that the mistake was due to an accident, especially if it has to occur on 2 or more providers.
- **Provider lost future revenue** - As mentioned above, failing to carry out one's responsibility to report instant prices per expectation, will have negative result of loan takers un-allocating from your price feed, thus causing losses to future revenues.
- **Daily currency issue limit** - There will be a daily currency issuance limit of `5%` as a percentage of the total issuance balance to date, that would cap any potential at-scale abuse, but would also not put a cap on the system's growth. See *Daily issuance limit* under [Issuance](./system.md#issuance).

### Price feed fault

There is a possibility that the automated system responsible for reporting instant prices (and to a lesser extent, historical prices) malfunctions and reports the wrong value, or fails to report applicable changes to price. In such cases, we need to mitigate harmful effects, as well as incentivize providers to be vigilant in preventing such failures in the future.

For instant prices there are no hard penalties enforced by the system.

**Mitigations**:

- **Delayed price quality control** - When using delayed pricing, there is an inherent delay in the reporting process usable in building quality control and approval system.
- **Price inaccuracy penalty** - For delayed prices, in case of inaccurate reporting, there is an accuracy penalty considered for reported prices that are wildly inaccurate.
- **Missing price penalty** - For delayed prices, in case of missing reports, there is a penalty that already disincentives providers against allowing this scenario.
- **Instant price consensus process** - For instant prices, the system selects will discard outlier values, and select the one that is least harmful to the system if used, which is the lowest price value reported for the native token.

## Appendix

### Words of estimative probability

|Word|Probability|Target|Frequency word|Alternative word(s)|
|---|-----|--|---|-----|
|Impossible|0%|0%|Never|Certainly not|
|Extremely unlikely|0.1% - 1%|1%|Rare||
|Very unlikely|1% - 10%|5%|Occasional|Almost certainly not|
|Unlikely|10%-40%|20%|Frequent|Possible|
|Somewhat likely|30%-70%|50%||About even chance|
|Likely|60% - 90%|80%|Likely|Probable|
|Very likely|90% - 99%|95%| |Almost certainly|
|Extremely likely|99% - 99.9%|99%|||
|Certain|100%|100%|||
