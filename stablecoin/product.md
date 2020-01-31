# The product <!-- omit in toc -->

- **\{\{PegDollar\}\}** for consumers is the main product we focus on
- **\{\{PegLoan\}\}** for other stakeholders such as financial investors, is the periphery product that we will touch on.

> Note: Names inside \{\{\}\} denote placeholder product names.

Based on the [vision](./vision.md) of this proposal, we focus on envisioning a viable product that will function on top of the proposed [system](./system.md). Here we describe the different aspects of the potential product's development, business model, market position/branding, assumptions made along the way, as well as the value interactions between stakeholders.

Other sections outline:

- [Vision](./vision.md)
- [The system](./system.md)
- [The ecosystem](./ecosystem.md)
- [Security](./security.md)
- [Scenarios](./scenarios.md)
- [Roadmaps](./roadmaps.md)

This section outline:

- [Basics](#basics)
- [Assumptions](#assumptions)
- [Acknowledgements](#acknowledgements)
- [Technical features](#technical-features)
- [Stakeholders](#stakeholders)
  - [System users](#system-users)
  - [Partners](#partners)
- [Market](#market)
  - [Desired properties](#desired-properties)
  - [Market technical features](#market-technical-features)
    - [Reference value](#reference-value)
    - [Interest bearing](#interest-bearing)
    - [Asset backing](#asset-backing)
    - [Payment network](#payment-network)
  - [Competition](#competition)
  - [Market categorization](#market-categorization)
    - [Notable exclusions](#notable-exclusions)
  - [Jurisdictional considerations](#jurisdictional-considerations)
- [Branding](#branding)
  - [1. PegLoan and PegDollar](#1-pegloan-and-pegdollar)
  - [2. UniLoan and UniDollar](#2-uniloan-and-unidollar)
    - [2.a. Unicorn dollar](#2a-unicorn-dollar)
    - [2.b. Uni dollar](#2b-uni-dollar)
- [{{PegLoan}} market](#pegloan-market)
- [Business model and token economics](#business-model-and-token-economics)
- [Appendix](#appendix)
  - [Terms](#terms)
  - [PegWTF](#pegwtf)
  - [Legal considerations](#legal-considerations)
    - [General Jurisdictional regulation](#general-jurisdictional-regulation)
    - [US jurisdictional regulation](#us-jurisdictional-regulation)
    - [Stakeholder disputes](#stakeholder-disputes)

## Basics

\{\{PegLoan\}\} is a loan system available to all on a public blockchain, which produces \{\{PegDollar\}\}, a money product in the form of a cryptocurrency token representing the US dollar ($). Anyone can buy, hold and use this currency, as well as store it in a digital savings account and collect interest, all without the involvement of a bank.

There are many other available cryptocurrencies representing the US Dollar, however they all depend on some type of central entity for operation, making them more vulnerable to capture or failure. \{\{PegLoan\}\} is ownerless and functions on a never-changing (immutable) secure smart contract. The system allows anyone to take a loan of \{\{PegDollars\}\} against their trust-minimal blockchain assets (e.g. ETH on Ethereum, BTC on Bitcoin) without really giving up ownership, after storing a proportional amount of the backing asset in a blockchain account. While the system guarantees most aspects of security, transparent to the users, various actors are incentivized to profit from competing to maintain the system.

## Assumptions

- **Good money** - The best digital money for the masses is a US dollar $ stablecoin, that returns interest, has high liquidity, and is widely accepted in people's every day financial ecosystems. The following are properties people look for in good money:
  - **UofA** - Unit of Account - In the world today, the most usable Unit of Account (UoA) is the US dollar $, due to the low cognitive load of understanding and using it.
  - **MoE** - Medium of Exchange - High liquidity and network effects (availability throughout the financial system) of an asset are pre-requisites for it becoming a good Medium of Exchange (MoE).
  - **SoV** - Store of Value - Functional stablecoins, especially ones bearing interest are considered good Stores of Value (SoV).
- **Interest** - An interest bearing stablecoin has significant competitive advantage compared to real world stable currencies, and is on par with other on-chain alternatives such as DAI. A money product that bears interest is a better Store of Value (SoV), given that the value actually increases in time.
- **Achieving decentralization** - In general, decentralization is best achieved through permission-less-ness, censorship-resistance, and minimizing need for having a central actor. It improves the SoV aspect of the product by decreasing its long term risk.
- **Default collateral** - ETH is currently the most trust minimized programmable digital asset available, and is supported by a considerably decentralized Ethereum blockchain that is permission-less, censorship-resistant, relatively secure, and with a high promise of wide adoption.
  - Bitcoin currently does not seem to fit the (easy) programmability requirement, however it offers higher security, as well as many other positive qualities. At the same time, it has not developed sufficient financial ecosystem network effects. That said, exploring the Bitcoin space remains an option.
  - Other blockchains lack most of above required features, and in rare cases where they do, they are not as secure as say Ethereum, and lack network effects. That said, this proposal remains open to sharing ideas with other chains or  considering them for research.
- **Governance and tokens** - Completely replacing off-chain and on-chain governance with an on-chain incentive systems, significantly reduces risk of capture as well, increases operational complexity, and significantly reduces capital efficiency. This is especially true when a governance token is used (ie MKR token).
- **Long term value risks** - This type of risk, such as the risk of inadequate backing of credit, increases the likelihood that a money product would eventually fail by losing its value. Everyday consumers however do not perceive this type of risk as easily.

## Acknowledgements

### Ode to Uniswap <!-- omit in toc -->

Even though \{\{PegLoan\}\} provides a different financial service compared to Hayden Adams' Uniswap, some of its properties around trust-minimization and decentralization are in fact inspired by Uniswap. It also attempts to stay true to the brand essence of Uniswap, which also happens to overlaps with the values of the greater Ethereum community, and its [Unicorn symbology](https://github.com/loredanacirstea/articles/blob/master/articles/The_Ethereum_Unicorn.md).

Uniswap is a maximally decentralized exchange smart contract, that is permission-less, censorship resistant and unstoppable. After the contract's finalization and deployment by original author, no one (not even the author) has any control over its operation. The contract will run as long as Ethereum 1.0 continues, and has been available to anyone with an internet connection, to be used in performing token exchanges or profiting by providing liquidity.

If done right, \{\{PegLoan\}\} and its default US dollar stablecoin \{\{PegDollar\}\}, will have most or all of the important properties of Uniswap, including its level of decentralization. After deployment and finalization, the \{\{PegLoan\}\} smart contract, should no longer be controlled by anyone, and be available to all Ethereum users.

### Tip of the hat to MakerDAO <!-- omit in toc -->

This proposal recognizes standing on the shoulder of Rune Christensen, the MakerDAO team, the Maker community, and the world changing impact they have had. Keeping in mind that ideas and progress are not beholden to any one group or person, the proposal uses learnings from the remarkable experiment they have run, and shares in the common goal of evolving digital finance.

## Technical features

In more technical terms, \{\{PegLoan\}\} is a trust-minimized, governance-minimized, capital efficient, collateral-backed stablecoin system on Ethereum that only works with ETH as collateral and has no formal governance process or token. It focuses on one stable currency pegged to the US dollar, given the minimal level of cognitive load required for everyday use of a US dollar digital currency. However, it is possible for anyone to copy the ideas and open source code behind \{\{PegLoan\}\} to deploy new instances of the system targeting different currencies or other baskets of assets.

- Fully decentralized operation, lowering chance of capture or rent seeking
- Better capital efficiency due to elimination of governance token
- More predictable behavior due to algorithm-based monetary policy governance
- Simpler risk profile due to native token as exclusive backing collateral asset
- Open source

## Stakeholders

### System users

- **Money users** - These are regular consumers that buy, hold, use or store their pegged currency in a savings account to collect interest. Some target groups that could benefit from such an offering are the un-banked and those with limited access to a stable Store of Value (SoV) from countries with dysfunctional monetary policies.
- **Loan takers** - Holders of ETH that decide to take out a loan against their holdings. The main incentive for this group consists of holding a long position on that their ETH investment, while being able to obtain liquid value from this investment. They may also to a lesser extent be motivated by the use of technology, but this is not a sustainable incentive.
- **System maintainers**
  - **Price feed providers** - Providers of accurate rates of exchange between ETH, the real  asset as well as the pegged currency. These providers are expected to compete in  establishing trust amongst the loan takers, and in return be monetarily compensated based on the level of trust they establish, and based on following the rules set by the loan system.
  - **Loan liquidators** - Compete with each other to monitor and speculate on the liquidation status of loan positions, and trigger liquidation when they foresee certain conditions in accordance with the loan system's definition of liquidation.

### Partners

- **Wallets** - Popular end user apps that allow self-custody, buying, selling, receiving, and sending of digital assets. They would be encouraged to support and showcase \{\{PegDollar\}\} as one of their main options.
- **Exchanges** - Popular exchanges, be they centralized, or decentralized, would be encouraged to add ability to trade pairs with \{\{PegDollar\}\} as well as encourage liquidity brought in by exchange traders or liquidity providers.
- **Money protocols** - These are smart contract for lending, burrowing, decentralized exchange , synthetics, prediction markets amongst others that would be encouraged to support \{\{PegDollar\}\} as an option on their services.

## Market

\{\{PegDollar\}\} and \{\{PegLoan\}\} represent the two sides of our system's two sided market, one focused on consumers and the other on financial investors. Per our [vision](vision.md), primary focus will be more on the consumer market.

The main market we are considering is the "general-purpose consumer money" market, or larger segment. We will consider the various properties that determine demand for a given money product in this market, whether they are determined by the consumer's desires, technical aspects of that money product, or the environmental factors such as jurisdictional regulation. We will also categorize the market and define sub-segments, in order to better show the optimal positioning of \{\{PegDollar\}\}.

We will also briefly separately touch on the "Digital asset backed loan" market, and discuss optimal positioning of \{\{PegLoan\}\} for the system's other stakeholders such as loan takers, price feed providers, liquidators, and market arbitragers.

### Desired properties

In general, a good money product candidate should demonstrates a good level of the following properties to the end-consumers:

1. **Store of Value (SoV)** - the consumer likes to be assured that the value they hold in a money product is not lost.
1. **Medium of Exchange (MoE)** - the consumer likes to use a money product that can be used for a wide array of markets for a wide array of economic transaction types.
1. **Unit of Account (UofA)** - The consumer's mental accounting of sending and receiving money is least costly when most of the economic transactions they participate in, use the same stable unit of account. This makes exchange across different markets predictable and less mentally exhausting.

### Market technical features

Any money products consists of technical components such as their reference value, their backing assets, and the payment networks that support them.

#### Reference value

Money products track a commonly accepted concept of value per unit of account through time. In a global setting, and assuming minimal regulatory limitations, taking the US dollar ($) as the money's reference value, results in optimal SoV and UoA properties of that money. In a jurisdictional setting, most common choice is the national currency. Selecting a national currency as reference value, adds a centralization factor around determining the value of money, that could potentially be exploited by the national government, through printing money, and inflating its value.

#### Interest bearing

A money product that can earn risk free interest, while not in use, is superior to one that does not. Bank deposit money does earn small amounts of interest when stored in savings accounts that subjects the money to some restrictions around withdrawal. DAI and \{\{PegDollar\}\} offer considerably higher variable interest, which makes them a better in terms of SoV as not only are they likely not to lose value, the value is likely to increase with time.

#### Asset backing

In order to ensure their long term value, money products are fully or partially backed by other assets. The mechanisms of this backing and the type of assets used determine many of the technical risk parameters of such a money product. Some common examples of this are Gold, digital assets like BTC and ETH, or the national currency like US dollar ($), Euro, or Chinese Yuan.

#### Payment network

This is a network of payment senders and receivers, backed by underlying payment infrastructure. The backing assets of a money product are the least visible to consumers, however they affect and are heavily dependent upon regulatory factors. In case of \{\{UniDollar\}\} backed by \{\{UniLoan\}\}, the specific selection of backing assets as digital assets, mainly affects the other side of the market, namely the "digital asset backed loan" market;

In order for a money product to be a good Medium of Exchange (MoE) it has to be widely available in markets that consumers want to participate. Low cost of access, as well as merchant and consumer desire to be part of a money payment network, determines the extent of the money's desirability as a MoE.

### Competition

For the greater market segment please see [market categorization](#market-categorization) breakdown, based on features and desired properties, for more information.

If we focus on direct competition, the stablecoin market segment is what we should consider. Many stablecoin competitors exist as of this writing, ranging from centrally issued ones, to automated ones like DAI by MakerDAO. We believe all of these competitors have positioned themselves with a lower level of optimizations around trust minimization, risk minimization, capital efficiency, and governance minimization, that significantly lowers their potential for long-term success. These other options, either depend on a centralized entity for issuance, or for governance, and often do not efficiently flow capital through the system.

Below is a tabular representation of the product's extended competition, as represented by category leaders and notable examples:

|Product|Market segment|Reference value|Asset backing|Interest bearing|Payment network|SoV rating|MoE rating|UoA rating|
|-----------|------|----------------|-------------|-------|--------|-----|----|---|
|US dollar ($) bills|Physical cash money (bank notes)|US dollar ($)|Gold, National credit and rep|No|Physical commerce|🟢High|🟢High|🟢High|
|Argentine peso bills|Physical cash money (bank notes)|Argentine peso|Gold, National credit and rep|No|Physical commerce|🔴Low|🟢High|🟡Medium|
|Any US credit card|Credit card money|US dollar ($)|Consumer credit|No|Digitized commerce|🟡Medium to 🟢High|🟢High|🟢High|
|Any US deposit bank w/ debit card|Deposit and debit card money|US dollar ($)|Yes|Consumer deposit, bank credit|Digitized commerce|🟢High|🟢High|🟢High|
|Venmo|Corporate digitized money|US dollar ($)|Consumer deposit, corporate credit|No|Money app|🟢High|🟡Medium|🟢High|
|PayPal|Corporate digitized money|US dollar ($)|Consumer deposit, corporate credit|No|Money app, payment provider|🟢High|🟢High|🟢High|
|WeChat Pay|Corporate digitized money|Chinese Yuan|Consumer deposit, corporate credit|No|Money app, payment provider|🟢High|🟢High++|🟢High|
|Tether|Corporate stablecoin money|US dollar ($)|Corporate deposit and credit (<100%)|No|Public blockchains|🟡Medium+|🟡Medium|🟢High|
|Coinbase USDCoin (USDC)|Corporate stablecoin money|US dollar ($)|Corporate deposit (100%)|No|Public blockchains|🟢High|🟡Medium|🟢High|
|Digital US dollar ($)|State backed stablecoin money|National currency|Gold, National credit|No|Public blockchains|🟢High|🟡Medium|🟢High|
|Digital Chinese Yuan|State backed stablecoin money|National currency|Gold, National credit|No|Public blockchains|🟢High-|🟡Medium-|🟢High|
|DAI|DAO-governed asset-backed stablecoin money|US dollar ($)|Digital assets >100% (ETH) |Yes|Public blockchains|🟢High|🟡Medium|🟢High|
|**\{\{PegDollar\}\}**|**Trust-minimized asset backed stablecoin money**|**US dollar ($)**|**Digital assets >100% (commonly ETH)**|**Yes**|**Public blockchains**|**🟢High+**|**🟡Medium**|**🟢High**|
|Imaginary product [\{\{PegWTF\}\}](#pegwtf)|asset backed stablecoin money|US dollar ($)|Digital assets >100% (commonly ETH) |Yes|Public blockchains|🟢High++|🟡Medium|🟢High|

### Market categorization

Numerous sub-segments exist in the greater "general-purpose money for consumers" segment, some of which are already seeing very large scales market activity. Some of these include our daily use of cash, credit/debit cards, money apps and bank transfers. We categorize the market sub-segments as follows:

- **Physical cash money (bank notes)** - Provided and backed by national governments. The most prominent of these globally are US Dollar bills ($). ToDo - estimated circulation of US $ bills and others.
- **Digitized consumer money**
  - **Debit and credit card money** - facilitated by payment processing companies that connect credit card transactions to consumer credit accounts or debiting directly from the consumer's bank deposit account.
  - **Bank digitized money** - network of bank deposit accounts and transfers facilitated by Automated Clearing House (ACH) - Examples: Chase, Wells Fargo, Bank of America, etc.
  - **Corporate digitized money** - Money apps - For example Venmo, PayPal, ApplePay
- **Digital stablecoin money**
  - **Corporate stablecoin money** - Examples: USDCoin (USDC) backed by Coinbase, Tether dollar (USDT) backed by Tether, Gemini dollar (GUSD) backed by Gemini.
  - **State backed stablecoin money** - Example: digital Yuan or potential digital dollar
  - **Asset backed stablecoin money**
    - **DAO-governed asset-backed stablecoin money** - Example DAI backed by MakerDAO
    - **Trust-minimized asset backed stablecoin money** - Example: \{\{PegDollar\}\} backed by \{\{PegLoan\}\} system
      - [Imaginary product] **Trust minimal asset backed stablecoin money** - See Imaginary product [\{\{PegWTF\}\}](#pegwtf).

#### Notable exclusions

- **Digital assets money** - Bitcoin, ETH, not suitable for general-purpose consumer use due to large volatility, and speculative use.
- **Currency exchange assets** - For example US dollar, Euro, Yuan etc held on currency exchanges used for currency trading. Used mainly for speculation and not for everyday use in commerce.
- **Equities (stocks, bonds) and commodities (Gold)** - not suitable for general-purpose consumer use due to large volatility, and speculative use.

### Jurisdictional considerations

In many jurisdictional sub-segments, due to regulatory enforced limitations, most everyday economic transactions can only be denominated in the national currency. This, most viable money candidates have no choice but to use that jurisdiction's national currency as their reference value, as well their backing asset.

Unfortunately, in many cases this occurs even if the national currency does not represent good characteristics for Store of Value (SoV), due to consistently large inflation, and volatility. Some examples like Argentinian Peso and Iranian Rial demonstrate the extent of this problem.

## Branding

Branding is essential to success of a consumer-based money product. As a result, any potentially successful implementation of this research proposal needs to at least have a set of consistent brand guidelines, that establish it as a reasonable alternative to all the money product options out there. A few options are discussed below:

### 1. PegLoan and PegDollar

The more generic branding can be used for any public blockchain, and is consistent with the terminology used.

- \{\{PegLoan\}\} = PegLoan
- \{\{PegDollar\}\} = PegDollar
- \{\{PegDollar\}\} symbol: 𝕡$

In case of use on the Ethereum blockchain, this generic branding is a fallback to the more compelling option below. Of course the Ethereum community can effectively reject the branding below, based on the sentiment that the product does not sufficiently align itself with Ethereum, or it is attempting to illegitimately appropriate the community's identity.

### 2. UniLoan and UniDollar

Preferred option for Ethereum.

- \{\{PegLoan\}\} = Uniloan
- \{\{PegDollar\}\} = UniDollar
- Brand = 🦄
  - UniDollar - 🦄$
  - UniLoan - 🦄🏦

The brand symbology and emoji representation is inherently "meme-able", adding to the velocity of the product's dissemination.

The innovators and early adopter market segment, who have significant community influence, and believe in the Ethereum community's value of maximal decentralization, have already been exposed to this symbology and can be recruited to spread the word about Uniloan and UniDollar.

Of course adoption of this branding mainly depends on the community's effective permission to use it, based on their sentiment of how aligned the product is with the Ethereum ideals.

#### 2.a. Unicorn dollar

This would be the preferred currency symbol for at least the initial stages of the product (before crossing the chasm), when the innovators and early adopter market segment would likely prefer to use this notation in their apps, as it reinforces a sense of community.

- Unicorn dollar symbol: 🦄$

Referred to as Unicorn dollars.

#### 2.b. Uni dollar

Mass users of UniDollar will more likely be part of the early and late majority market segments. They will likely not be familiar with the Unicorn symbology mentioned above. In their case, it is more desireable to have a more conventional representation of the brand, as opposed to one that is playful. This will help establish the trust required to use the currency for everyday commerce, and increase the level of comfort for both consumers and by merchants. For example, one can imagine this symbol being used in payment applications, spreadsheets or accounting software user interfaces.

- Uni dollar symbol: 𝕦$

## \{\{PegLoan\}\} market

The "Digital asset backed loan" market is one that is separate from the "consumer money" market. We will discuss the optimal positioning of \{\{PegLoan\}\} for the system's other stakeholders such as loan takers, price feed providers, liquidators, and market arbitragers.

-ToDo

## Business model and token economics

- ToDo

Wide adoption of the products representing this system will likely have a positive impact in value capture by the native blockchain asset that implements it.

## Appendix

### Terms

**Stable-coin** - A fully digital token whose value that is stable relative to a reference pegged asset with high level of historical stability. The reference pegged asset could be anything from a national currency like the US Dollar ($), to a basket of stable and uncorrelated assets, such as basic commodities, or currencies.

**Digitized** commerce/money - Commerce or money that is represented and operated in digital form in order to achieve efficiencies offered by digital automation. The digitization is however not with full fidelity, and relies on a mechanism to tie the digital representation to physical representation of value, through legal and operational processes representing overhead.

**Digital** commerce/money - Commerce or money that is backed, represented and operated fully in digital form in order to achieve even higher efficiencies offered by digital automation.

### PegWTF

\{\{PegWTF\}\} is an imaginary money product and successor to \{\{PegDollar\}\}, based on the imaginary WTF (World Trade Francs) Unit of Account, defined and maintained by the also imaginary \{\{WTF Foundation\}\}, as a universally agreed-upon and stable basket of goods, assets and/or currencies. \{\{PegWTF\}\} is based on the same \{\{PegLoan\}\} system as the current research proposal, though it uses WTF as the reference currency.

See [WTF](https://blog.ethereum.org/2018/04/01/announcing-world-trade-francs-official-ethereum-stablecoin/) for reference. Seriously though, WTF!?!

### Legal considerations

If successful, the proposed system and products will be adopted at high scale. Therefore there is a possibility for it to be involved in disputes of significance. In this section we attempt to explore a few potential disputes and discuss possible mitigations.

#### General Jurisdictional regulation

The \{\{PegLoan\}\} system and its \{\{PegDollar\}\} money product virtually function on the neutral and decentralized internet and blockchain spaces. In this context, there are no specific jurisdictional enforcements outside the functionality of the hosting blockchain, and the smart contract rules that make up the system. However the effects of these products' functionality extend into the real world, and into real jurisdictions where the stakeholders are.

Most notable concern by local, state and national government regulatory bodies are related to preventing financial crime or using money in prohibited activities by requiring reporting of large and/or suspicious financial activity to the authorities. A few examples of these requirements are the Know Your Customer(KYC) and Anti Money Laundering (AML) rules enforced by most western governments. Also at the international level, Financial Action Task Force (FATF), sets [specific rules](https://www.fatf-gafi.org/media/fatf/documents/recommendations/pdfs/FATF%20Recommendations%202012.pdf) for combating "terrorist financing, the financing of proliferation, and other related threats to the integrity of the international financial system."

#### US jurisdictional regulation

Amongst the many financial regulatory bodies in the US government, Financial Crime Enforcement Network (FinCEN) is the most relevant body that deals with legal matters related to money. According to a recent [press release](https://www.fincen.gov/news/speeches/prepared-remarks-fincen-director-kenneth-blanco-chainalysis-blockchain-symposium) FinCEN states that "administrators of stablecoins have to register as MSBs with FinCEN."

This stance is clearly inconsistent with realities of how permissionless blockchains work, and the definition of "administrator" in the existing cases of algorithmic stablecoins (like MakerDAO) and real world backed stablecoins (like USDC), and thus, is legally questionable. However it does demonstrate the possibility of FinCEN enforcing seemingly distorted interpretations of the existing rules, and the political will to do so. This presents an inherent legal risk in operationalizing the proposed system that should be noted. It should also be noted that this proposal only aims to envision the final system and products, and will require full legal review and mitigation of the above risks before proceeding any further than described.

#### Stakeholder disputes

The system is designed to ideally operate in a stable manner, with all stakeholders following the spirit of the smart contract system and ecosystem rules around reporting of truthful prices. There is however always the very small chance of things not working out as designed. In such cases, it is important not to rule out the role of off-chain dispute resolution at the societal level. Resorting to off-chain dispute resolution is of course largely a result of the immutable and decentralized nature of the proposed system.

The system enforces hard rules on stakeholder behavior on-chain through the use of smart contracts. This is designed to incentivize constructive behavior and reduce coordination costs by reducing the chances of costly disputes, and by offering less-costly dispute resolution mechanisms. For example, the system's on-chain algorithms for collecting and aggregating reported prices, make it costly for any minority of price providers to cheat. They also provide for an ongoing process for resolving disputes in price reporting and to almost always arrive at a stable conclusion in time.

In very rare cases however, the on-chain dispute resolution mechanism may be insufficient in bringing about desired results, ones that are in accordance to spirit of commonly agreed upon beliefs. For example, there is a small possibility that a large group of existing feed providers attempt to capture the system, despite incurring short term penalty costs, in order to abuse and profit from the system long term. In such a case, or in case the ecosystem anticipates the approaching of such a case, it is perfectly reasonable to resort to off-chain dispute resolution mechanisms, in order to minimize costs to all good-faith stakeholders.

The system and ecosystem rules around price reporting for example, rely on off-chain trust relationships that establish top trusted feed providers' through loan allocations in the on-chain system. It is perfectly reasonable therefore, that any violation of these trust relationships, is disputable off-chain in addition to on-chain. Existence of such societal dispute resolution options, only strengthens functionality of system and ecosystem as a whole.
