# Ecosystem

The stablecoin system lives on the public blockchain, however the players interacting with it directly or indirectly, all live in the real world and will follow strategies and courses of action, based on their incentives and the changing ecosystem. In order to ensure the success of the stablecoin system, and the money product that it represents, we need to fully understand the ecosystem subsuming it and mitigate any foreseeable issues that may threaten the product's success.

- [Vision](./vision.md)
- [The product](./product.md)
- [The system](./system.md)
- [Security](./security.md)

## Actors

We start with the various actors involved in the greater ecosystem:

- **Money users** - Everyday consumers who use and hold the pegged currency money.
- **Loan takers** - Holders and speculators of public blockchain native token who choose to take a loan on its value for alternative uses of capital.
- **Price feed providers** - Actors responsible for reporting accurate price information to the system contracts on public blockchain
  - Foundation price feed provider - A potential and specialized type of feed provider that is a non-profit foundation.
- **Liquidators** - A type of arbitrager, who profits by liquidating under-collateralized loans, while helping maintain the system's backing
- **Currency market arbitragers** - A type of arbitrager, who profits by trading pegged currency in times of volatility, while helping decrease that same volatility.
- **Payment network integrators** - Actors already involved in providing merchants and buyers the interfaces and systems they use to participate in economic transactions. They have influence over which money is used in these transactions
- **Loan taking aggregators** - They own the easy-to-use interfaces many loan takers use to create their loans. They have influence over the allocation parameters of newly created  loans.

### Money user

Money users are not deeply involved with the game theoretic aspects of the ecosystem. They rather just want to use a dependable form of money for everyday economic transactions. They need that money be accepted in as many contexts as possible, and are very much interested in receiving interest on it when not in use.

They of course need to trust that the value of their money is protected, and any sign of unpredictability and volatility will drive them away from using the money.

### Loan taker

Given the typically large investments made by loan takers, as well as their intermediate to high understanding of finance, loan takers do get deeply involved in the game theoretic aspects of the ecosystem, in order to ensure their collateral value is kept safe and that they could have predictable and reasonable access to it when needed.

They need custody of owned ETH, assurance that it is kept safe, and is retrievable, such that the can safely and freely use the issued pegged currency from their loans (debt positions) to perform other profitable economic transactions. The need a basic understanding of how their loan works in common conditions and peace of mind that long term risks are minimal. They also would prefer to have assurances that they will be notified when action is needed, in order to protect their investment.

They are the key set of actors that contribute to key decisions around selection and compensation of price feed providers (oracles). They are also incentivized and engaged enough to have a higher likelihood of responding to major changes in the ecosystem conditions, such as a move towards lower trust or unpredictability.

### Price feed provider

Having a healthy set price feed providers is crucial to the overall health of the ecosystem. After all they are the ones working actively everyday to maintain the system by providing accurate price information to the public blockchain contracts. Certain price feed providers can amass considerable power by building scale through brand recognition and relationships with key players, to influence and the likelihood of and capture loan allocations.

The default mode of interaction between price feed providers themselves is cooperative competition for share of loan (debt position) allocations, a decision that is determined by the sentiment of loan takers and in some cases loan taking aggregators (such as InstaDapp). In this default mode, all price providers provide accurate price information to the on-chain contracts, and try to differentiate their services to loan takers, partly through promotion of other activities beneficial to the ecosystem.

Price feed providers have advanced understanding of public blockchain, smart contracts, cryptoeconomics, business, marketing, traditional and decentralized finance. They need to be able to run a profitable business sustainably, and trust in the system's correct operation. They prefer to reach a level of scale that results in high margins and thus a higher return on investment.

#### Foundation price feed provider

One can imagine the role of a special non-profit type of price feed provider, one that is as decentralized and transparent as possible, and one that promotes itself to loan takers as honest and a steward of the ecosystem. Amongst its uses if its income as part of the price feed provider allocation fees, could be promoting the use of the pegged currency amongst payment providers, as well as providing audits of most or all of the ecosystem actors.

### Loan liquidator

Loan liquidators are incentivized by the profit they can make as a result of liquidating under-collateralized loans (debt positions), and depend on their ability to automate the execution of high quality liquidation requests faster than any other loan liquidator.

The system does impose a delay, and other restrictions, in cases where the system is in disputed state, which may hurt the loan liquidators bottom line, due to lowered chance of liquidation as well as capital lockup for longer periods of time.

### Currency market arbitragers

Currency market arbitragers help the system through periods of high volatility, likely caused by changes in the market conditions around supply and demand of the pegged currency. During these periods they actually reduce volatility by intervening in the market. More competition amongst these arbitragers, would reduce volatility even further.

In order for currency market arbitragers to perform this service sustainably, they need to have faith in the system's ability to supply supply and demand after these disruptions in a short amount of time, and they need to consistently be able to profit from performing such services.

An example of their services, is buying pegged currency in large volumes in the market when the price has gone lower than $1.00 due to poor demand, and selling it back into the market at profit after the system has incentivized demand for pegged currencies.

### Payment network integrators

The pegged currency as a money product becomes really valuable when the payment networks and apps that consumers use everyday, provide the ability for merchants and buyers to transact using them.

### Loan taking aggregators

As the UX for performing loan operations becomes aggregated amongst a few providers like Zerion and InstaDapp, it is entirely possible for them to provide their own default set of options to users around allocation of price feed providers on new loans. This can become a source of influence, that some price feed providers may decide to pursue with monetary or non-monetary propositions. This is of course an undesirable direction for the ecosystem to take, but it is entirely possible. We discuss possible mitigations in the game theory section.

## Game theory

### Strategic dynamic changes

A few possibilities around shifting of strategic power between groups of actors:

- **External player (whale) capture** - External players with great financial resources coming in and controlling the source of truth, or disrupting the system otherwise 
- **Conflict between price feed providers** - Sub-group of price feed providers going rogue to eliminate another group from ecosystem
- **Price feed provider collusion** - Feed providers colluding to abuse the system through liquidations
- **Price feed providers and loan taker collusion** - Feed providers and loan takers colluding to take advantage of the money holders and users
- **Influence consolidation through loan taking aggregators** - Consolidation and influence of loan takers preferences through aggregators (like InstaDapp), and collusion with price feed providers for kickbacks
- **Shortage of pegged currency** - This could theoretically occur due to burned or lost tokens, and during wind-down of protocol in case of hard-fork, causing loss of collateral for loan takers

ToDo - Detail above dynamic changes along with mitigation steps considered by the system

### Protocol changes

A few possible outcomes around changes to the protocol itself:

- **Perpetual operation (no-fork)** [default] - The same community will rely on the same protocol perpetually.
- **Soft-fork** - We end up with 2 sub-communities and 2 protocols adopted by each.
- **Hard-fork** - We end up with the same community moving to a new protocol. The old protocol will be transitioned and retired.

#### Perpetual operation (no-fork)

Perpetual operation or no-fork describes the scenario where no changes are made to the protocol, and the community agrees to rely on the same protocol perpetually.

A successful general-purpose consumer money product is assumed to be held and used by large numbers of everyday people, which means the cost of altering the money during usage is extremely high to the individual people using it, as well as any other stakeholders. As a result, perpetual operation, meaning no disruptions to routine operation forever, is the ideal end-state of the system as designed, one that incurs the least costs in a large number of people having to switch from one protocol to another.

When the viability of the ecosystem are not in significant danger, this should be considered the default option. Of course, this is a subjective criteria, and is subject to the community's interpretation.

#### Soft-fork

Soft-fork is the intentional splitting of the communities, where we end up with 2 sub-communities and 2 protocols adopted by each.

There is always a non-zero probability that beliefs about operation of the ecosystem, amongst its actors could increasingly diverge in time, in which case, a community split is possible. In such a case, those whose beliefs are more aligned with the existing operations and the original parameters of the system are likely to stay with it, and incur less costs due to not having to switch to a new version. The existing sub-community however will incur a lot more cost.

The cost incurred by the sub-community leaving the ecosystem, includes but is not limited to, the cost of money users exchanging out of the pegged currency, the loan takers' cost of having to purchase sufficient pegged currency to cover loans (debt positions) and close them, as well as the cost of exiting price feed providers being slashed for the drops in their allocation numbers.

The original community will also experience a period of less certainty due to the large volume of pegged currency and deposits leaving the system, and incur other costs depending on size of the existing group.

#### Hard-fork

Hard-fork is the intentional transition and retirement of the old protocol, where we end up with the same community moving to a new protocol.

There is always a non-zero probability that the community as a whole may come to a conclusion that changes to the on-chain protocol are required in order for the ecosystem to remain viable. In such a case, the community as a whole would have to coordinate simultaneous transition to a new version of the system, one that uses parameters agreed upon by the community as a whole.

Given that the system is immutable and holds a large amount of state, in the form of value, transitioning out of it will be very costly, including but not limited to:

- **Unpredictability** is a significant cost to an ecosystem that operates optimally based on predictability, trust, and truthful price reporting as a schelling point for all stakeholders. Any effective mitigation to the this will include:
  - **Transition planning** - An effective transition plan, one that considers mitigations to possible outcomes, and ensures the interests of all stakeholders are preserved as much as possible.
  - **Coordination** - Clear communication of the transition to all stakeholders, instructions on how to proceed.
- **Price volatility** is inevitable given that transition out of the current system requires movement of large amounts of value out of the system, in form of exchanging out of the pegged currency money, and in form of closing loans (debt positions) using large amounts of purchased pegged currency. Higher amounts of uncertainty, as mentioned above, will adversely affect volatility.
- **Money users' overhead** - very high cost of having to even care about this, cost of effort needed to exchange out of the pegged currency.
- **Money users' exchange costs** - Exchanging tokens has a non-zero fee regardless of the exchange used, this is no different.
- **Loan takers' overhead** - high cost of having to care about this in the first place, as well as the effort to purchase sufficient pegged currency to cover loans (debt positions) and close them.
- **Loan takers' exchange costs** -
- **Price feed provider penalties** - the cost of exiting price feed providers being penalized for the drops in their allocation numbers, as well as losses of time based payouts.
- **Possibility of un-closable loans due to lost pegged currency** -
- ToDo - others ...

## Community

Community's potential points of common belief:

- **Maximizing governance decentralization** - Skepticism of governance through tokens, and belief in minimizing it, in order to further decentralize protocols. Some benefits are resistance to capture and capital efficiency.
- **Market truth as schelling point** - The common belief that truth can become the ecosystem's schelling point. Community members and ecosystem participants believing they can sustainably benefit from helping operate and interacting with the system, and that truthfully reported price feed information is in everyone's interest.
- **Crypto-sovereignty** - The belief that sufficiently decentralized public blockchains as a whole from an unconventional sovereign jurisdiction on the internet, one that lacks many of the restrictions and friction points of today's geographical jurisdiction, and is more suitable for free economic activity. This consists of a few other shared beliefs around censorship resistance, decentralization and trust minimization.
- **Crypto-nationalism** - (a better and alternative definition of token maximalism) is the sometime exclusive allegiance to a specific public blockchain. It consists of the following set of beliefs:
  - **Citizenship** - Belief and feeling of belonging to that specific public blockchains community
  - **Inclusive nationalism** - The specific blockchain represents the best potential unconventional sovereign jurisdiction on the internet, which is akin to a nation. Membership in this group or nation is not mutually exclusive to others.
  - **Exclusive nationalism** - More extreme versions of crypto-nationalism will advocate for exclusive citizenship in many contexts, at the cost of other public blockchains.
  - **Exceptionalism** - The native digital asset of this specific public blockchain is the most trust-minimized and is a superior store of value.
  - **Futurism** - The specific blockchain will become the most ubiquitously used public blockchain in the future, and will transform our digital lives.
