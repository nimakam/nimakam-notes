# Security

Other sections:

- [Vision](./vision.md)
- [The product](./product.md)
- [The system](./system.md)
- [The ecosystem](./ecosystem.md)

## Attacks

### Dishonest price feed attack

- ToDo

### Performance degradation DoS attack

- Creating new loans to degrade normal operation for other stakeholders
- Creating new price feeds to degrade normal operation for other stakeholders
- Creating new savings accounts to degrade normal operation for other stakeholders

Mitigations:

- No calls initiated by a stakeholder will ever enumerate over all loans, price feeds, or savings accounts. There will be a select subset of data reported by **high trust** price feed providers (instant prices), and data by a **medium trust** providers (last week's prices), that the system contract will ensure are valid, and store them accordingly.
- The system will have multiple states of operation.
  - Normal: where no anomalies in historical prices have been detected, and where daily and instant prices are within known variability thresholds (10%).
    - Currency issuance will be instant
    - Loan liquidation will take 1 week
  - Uncertain: where minor anomalies have been detected such as 1. change in instant price is not reported by majority 2. drastic recent changes in allocations 3. Volatility of reported prices (20%) despite lack of dispute.
    - Currency issuance will take 2 days and will be according to historical prices
    - Loan liquidation will take 2 weeks
  - Disputed: where major disagreement is occurring between medium trust providers
    - Currency issuance will take 1 week and will be according to historical prices
    - Loan liquidation will take 1 month

### Honest price feed compromise attack

- ToDo

### Liquidation front running attack

A front runner can detect the liquidation request sent by another actor, and copy that request, submit it for execution in the same block, while jumping the line by offering miners a larger transaction fee. The aim of the attacker is to take all the profit of the liquidation away from the initial liquidator, by breaking a few common rules around submitting transactions.

Mitigations:

- **Liquidation process delay and prioritization mechanisms** - Process of liquidation does not finalize upon the request itself. Finalization is delayed,  although it does finalize requests submitted on earlier blocks, and cancels the later requests. In case of 2 requests being submitted on the same block, the payed off currency, liquidation fee and freed collateral shares are divided evenly amongst the submitters.

### Issuing currency right before large price drop update

Drops of 40% or more are not expected to occur frequently, however in case they do happen, there is an opportunity to profit by issuing currency against a newly created loan, right before the price is updated on-chain, thus hurting other stakeholders by leaving the system with a worse collateralization position.

For example, let's assume ETH is at $150, and suddenly drops to $80, a drop of 46.6%. If attacker were to issue maximum currency against a new loan backed by 100 ETH, the system would assume a collateral value of $15,000, and with a collateralization limit of 150%, attacker could issue as much as $10,000 of currency. This is compared to the $8,000 real value of collateral, which results in a profit of 20% which can be linearly scaled up depending on the amount of ETH under the attacker's control.

Mitigations:

- **Significant price change reporting by top providers** - The **high trust** price feed providers will be, through social contract, expected to reflect price changes of more than 10%, on the blockchain as soon as possible.
- **Top provider's loss of reputation, allocation and fees** -  If they fail to conform to above expectation, they can expect negative consequences in terms of loss of reputation, reduction in allocation by loan takers, and incurring other penalties.
- **Daily currency issue limit** - There will be a daily currency issuance limit of 5% as a percentage of the total issuance balance to date, that would cap any potential at-scale abuse, but would also not put a cap on the system's growth.
- **Rarity, unpredictability and likely reversibility of drastic drop** - The occurrence of such drops are assumed to be unpredictable, otherwise, there are plenty of other direct ways to profit off of correct predictions. Also such occurrences are assumed to be rare, such that investing in preparation to profit from them, would be cost ineffective. Also in the likely case that the drop is reversed, the loan's collateral leverage health is restored.

### Price feed provider collusion attack

All top allocated price feed providers can collude to defraud other stakeholders by a coordinated effort to report artificially lowered market prices, then proceeding to liquidate a large number of the loans under the new artificial collateralization threshold.

Mitigations:

- **Independent allocation process and loss of future income** - The process of allocating price feeds to loans is politically independent of the providers themselves, and is likely to change significantly following such an effort. This represents a significant future cost to colluding providers. Other non-colluding providers will likely gain significant allocation as a result of this attack.
- **Loss of scheduled fee payments** - The system holds a pool of fees for each price feed provider, which it gradually releases to the provider in time. Risk to future release of these fees incentivize price feed providers to act constructively.
  - **Slashing of fee pools due to penalties** - Discrepancy in reported prices amongst top allocated price feeds results in penalties, in form of slashings from the providers' fee pools. The aftermath of such an attack, and a genuine and significant reallocation move by loan takers is likely to result in significant costs to colluding feed providers.
- **Liquidation process delay mechanism** - Process of liquidation takes a minimum of 1 week, and is only finalized if liquidation threshold violation conditions holds throughout the processing period. With the above independent reallocation mitigation, the system consensus on threshold parameters is likely to change within that 1 week, and the liquidations will be cancelled.

### Top feed provider issuing currency right before artificial large price hike update

Let's assume a top feed provider reports an incorrect hike of 40% or more on-chain, and profit by issuing currency against a newly created loan, thus hurting other stakeholders by leaving the system with a worse collateralization position.

For example, let's assume ETH is at $160, and the provider reports it to be at $300, a rise of 87.5%. If attacker were to issue maximum currency against a new loan backed by 100 ETH, the system would assume a collateral value of $30,000, and with a collateralization limit of 150%, attacker could issue as much as $20,000 of currency. This is compared to the $16,000 real value of collateral, which results in a profit of 20% which can be linearly scaled up depending on the amount of ETH under the attacker's control.

Mitigations:

- **Majority top provider instant price** - The system only holds an instant price valid if majority of top providers have reported it. Thus this type of attack would require the collusion of at least 2 top providers in a 3 provider environment.
- **Top provider's loss of reputation, allocation and fees** - The **high trust** price feeds will be, through social contract, expected to reflect price changes of more than 10%, on the blockchain. If they fail to do so, they can expect negative consequences in terms of loss of reputation, reduction in allocation by loan takers, and incurring other penalties. After such an attack happens, it is very difficult to claim it was due to an accident, especially if it has to occur on 2 or more providers.
- **Daily currency issue limit** - There will be a daily currency issuance limit of 5% as a percentage of the total issuance balance to date, that would cap any potential at-scale abuse, but would also not put a cap on the system's growth.

## Other risks

### Price feed fault

- ToDo

## Terms

**Medium trust** price feed - Price feeds either in the top 20 in weighted allocation, or allocated at least 4% of all loans' weighted value. The historical prices from all these feeds are used in weighted form to determine the median daily historical price.
**High trust** price feed - A select group of price feeds either in the top 5 in weighted allocation, or allocated at least 20% of all loans' weighted value. Through social contract, High trust feeds will be, expected to report price changes of more than 5%, on the blockchain within a minute. All high trust feeds are also considered part of the medium trust collection.
**Low trust** price feed - Simply any non-zero feed that is not medium trust. Any price feed that is allocated a non-zero % of a loan with non-zero ETH deposits, which is not a medium trust feed.