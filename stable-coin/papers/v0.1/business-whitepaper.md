# \{\{PegDollar\}\}: Decentralized digital money for the masses

## Business research whitepaper

A widely available, dependable and easy-to-use digital currency, that people can buy, use, hold and collect interest on, without the constraints of banks.

>Notice: This document is a research proposal, and in no way makes promises about the full functionality of any derived implementation, nor does it represent a commitment to build, deploy or operate such a system. Its sole aims is to envision the process of defining, planning and productizing such a system and product.

## Goals

- **Digital money for the masses** - Provide everyday people with a usable (requiring minimal cognitive load) and competitive (interest bearing) digital stable-coin based on blockchain technology.
- **Wide availability** - A currency cannot be easy-to-use if it is not widely accepted by a network of people and businesses, and it is not widely accepted if doesn't grow past a tipping point, where mainstream financial ecosystem players are incentivized to support it.
- **Maximal decentralization** - Eliminate risk of capture and minimize need for centralized trust in order to increase chance of adoption, and to significantly reduce risk of failure.
- **Incentivization** - Provide loan takers with sufficient incentives to get loans (open debt positions with collateral), competitively compared to other market solutions. Provide system maintainers with a competitive but profitable business model that incentivizes and guides them into constructive behavior.
- **Simplicity** - Minimize operational complexity, such that it is relatively simple for all stakeholders to predict the system's automated behavior.

## Implicit assumptions

- **Blockchain technology disrupting finance** - Progressive digitization and decentralization of financial assets and processes through use of blockchain technology will increase the efficiency of building and operating financial systems by orders of magnitude.
- **Collateral-backed stable-coins** - Best known (state of the art) method for creating a blockchain stable coin is through using digital assets as collateral on a smart contract.

## Product basics

- **\{\{PegDollar\}\}** for consumers is the main product we focus on
- **\{\{PegLoan\}\}** for other stakeholders such as financial investors, is the periphery product that we will touch on.

> Note: Names inside \{\{\}\} denote placeholder product names.

\{\{PegLoan\}\} is a loan system available to all on a public blockchain, which produces \{\{PegDollar\}\}, a money product in the form of a cryptocurrency token representing the US dollar ($). Anyone can buy, hold and use this currency, as well as store it in a digital savings account and collect interest, all without the involvement of a bank.

There are many other available cryptocurrencies representing the US Dollar, however they all depend on some type of central entity for operation, making them more vulnerable to capture or failure. \{\{PegLoan\}\} is ownerless and functions on a never-changing (immutable) secure smart contract. The system allows anyone to take a loan of \{\{PegDollars\}\} against their trust-minimal blockchain assets (e.g. ETH on Ethereum, BTC on Bitcoin) without really giving up ownership, after storing a proportional amount of the backing asset in a blockchain account. While the system guarantees most aspects of security, transparent to the users, various actors are incentivized to profit from competing to maintain the system.

## Assumptions

- **Good money** - The best digital money for the masses is a US dollar $ stable-coin, that returns interest, has high liquidity, and is widely accepted in people's every day financial ecosystems. The following are properties people look for in good money:
  - **UofA** - Unit of Account - In the world today, the most usable Unit of Account (UoA) is the US dollar $, due to the low cognitive load of understanding and using it.
  - **MoE** - Medium of Exchange - High liquidity and network effects (availability throughout the financial system) of an asset are pre-requisites for it becoming a good Medium of Exchange (MoE).
  - **SoV** - Store of Value - Functional stable-coins, especially ones bearing interest are considered good Stores of Value (SoV).
- **Interest** - An interest bearing stable-coin has significant competitive advantage compared to real world stable currencies, and is on par with other on-chain alternatives such as DAI. A money product that bears interest is a better Store of Value (SoV), given that the value actually increases in time.
- **Achieving decentralization** - In general, decentralization is best achieved through permission-less-ness, censorship-resistance, and minimizing need for having a central actor. It improves the SoV aspect of the product by decreasing its long term risk.
- **Default collateral** - ETH is currently the most trust minimized programmable digital asset available, and is supported by a considerably decentralized Ethereum blockchain that is permission-less, censorship-resistant, relatively secure, and with a high promise of wide adoption.
  - Bitcoin currently does not seem to fit the (easy) programmability requirement, however it offers higher security, as well as many other positive qualities. At the same time, it has not developed sufficient financial ecosystem network effects. That said, exploring the Bitcoin space remains an option.
  - Other blockchains lack most of above required features, and in rare cases where they do, they are not as secure as say Ethereum, and lack network effects. That said, this proposal remains open to sharing ideas with other chains or  considering them for research.
- **Governance and tokens** - Completely replacing off-chain and on-chain governance with an on-chain incentive systems, significantly reduces risk of capture as well as operational complexity. This is especially true when a governance token is used (ie MKR token).
- **Long term value risks** - This type of risk, such as the risk of inadequate backing of credit, increases the likelihood that a money product would eventually fail by losing its value. Everyday consumers however do not perceive this type of risk as easily.

## Acknowledgements

### Ode to Uniswap

Even though \{\{PegLoan\}\} provides a different financial service compared to Hayden Adams' Uniswap, some of its properties around trust-minimization and decentralization are in fact inspired by Uniswap. It also attempts to stay true to the brand essence of Uniswap, which also happens to overlaps with the values of the greater Ethereum community, and its [Unicorn symbology](https://github.com/loredanacirstea/articles/blob/master/articles/The_Ethereum_Unicorn.md).

Uniswap is a maximally decentralized exchange smart contract, that is permission-less, censorship resistant and unstoppable. After the contract's finalization and deployment by original author, no one (not even the author) has any control over its operation. The contract will run as long as Ethereum 1.0 continues, and has been available to anyone with an internet connection, to be used in performing token exchanges or profiting by providing liquidity.

If done right, \{\{PegLoan\}\} and its default US dollar stable-coin \{\{PegDollar\}\}, will have most or all of the important properties of Uniswap, including its level of decentralization. After deployment and finalization, the \{\{PegLoan\}\} smart contract, should no longer be controlled by anyone, and be available to all Ethereum users.

### Tip of the hat to MakerDAO

This proposal recognizes standing on the shoulder of Rune Christensen, the MakerDAO team, the Maker community, and the world changing impact they have had. Keeping in mind that ideas and progress are not beholden to any one group or person, the proposal uses learnings from the remarkable experiment they have run, and shares in the common goal of evolving digital finance.

## Technical features

In more technical terms, \{\{PegLoan\}\} is a trust-minimized, governance-minimized, capital efficient, collateral-backed stable-coin system on Ethereum that only works with ETH as collateral and has no formal governance process or token. It focuses on one stable currency pegged to the US dollar, given the minimal level of cognitive load required for everyday use of a US dollar digital currency. However, it is possible for anyone to copy the ideas and open source code behind \{\{PegLoan\}\} to deploy new instances of the system targeting different currencies or other baskets of assets.

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

If we focus on direct competition, the stable-coin market segment is what we should consider. Many stable-coin competitors exist as of this writing, ranging from centrally issued ones, to automated ones like DAI by MakerDAO. We believe all of these competitors have positioned themselves with a lower level of optimizations around trust minimization, risk minimization, capital efficiency, and governance minimization, that significantly lowers their potential for long-term success. These other options, either depend on a centralized entity for issuance, or for governance, and often do not efficiently flow capital through the system.

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
|Tether|Corporate stable-coin money|US dollar ($)|Corporate deposit and credit (<100%)|No|Public blockchains|🟡Medium+|🟡Medium|🟢High|
|Coinbase USDCoin (USDC)|Corporate stable-coin money|US dollar ($)|Corporate deposit (100%)|No|Public blockchains|🟢High|🟡Medium|🟢High|
|Digital US dollar ($)|State backed stable-coin money|National currency|Gold, National credit|No|Public blockchains|🟢High|🟡Medium|🟢High|
|Digital Chinese Yuan|State backed stable-coin money|National currency|Gold, National credit|No|Public blockchains|🟢High-|🟡Medium-|🟢High|
|DAI|DAO-governed asset-backed stable-coin money|US dollar ($)|Digital assets >100% (ETH) |Yes|Public blockchains|🟢High|🟡Medium|🟢High|
|**\{\{PegDollar\}\}**|**Trust-minimized asset backed stable-coin money**|**US dollar ($)**|**Digital assets >100% (commonly ETH)**|**Yes**|**Public blockchains**|**🟢High+**|**🟡Medium**|**🟢High**|
|Imaginary product [\{\{PegWTF\}\}](#pegwtf)|asset backed stable-coin money|US dollar ($)|Digital assets >100% (commonly ETH) |Yes|Public blockchains|🟢High++|🟡Medium|🟢High|

### Market categorization

Numerous sub-segments exist in the greater "general-purpose money for consumers" segment, some of which are already seeing very large scales market activity. Some of these include our daily use of cash, credit/debit cards, money apps and bank transfers. We categorize the market sub-segments as follows:

- **Physical cash money (bank notes)** - Provided and backed by national governments. The most prominent of these globally are US Dollar bills ($). ToDo - estimated circulation of US $ bills and others.
- **Digitized consumer money**
  - **Debit and credit card money** - facilitated by payment processing companies that connect credit card transactions to consumer credit accounts or debiting directly from the consumer's bank deposit account.
  - **Bank digitized money** - network of bank deposit accounts and transfers facilitated by Automated Clearing House (ACH) - Examples: Chase, Wells Fargo, Bank of America, etc.
  - **Corporate digitized money** - Money apps - For example Venmo, PayPal, ApplePay
- **Digital stable-coin money**
  - **Corporate stable-coin money** - Examples: USDCoin (USDC) backed by Coinbase, Tether dollar (USDT) backed by Tether, Gemini dollar (GUSD) backed by Gemini.
  - **State backed stable-coin money** - Example: digital Yuan or potential digital dollar
  - **Asset backed stable-coin money**
    - **DAO-governed asset-backed stable-coin money** - Example DAI backed by MakerDAO
    - **Trust-minimized asset backed stable-coin money** - Example: \{\{PegDollar\}\} backed by \{\{PegLoan\}\} system
      - [Imaginary product] **Trust minimal asset backed stable-coin money** - See Imaginary product [\{\{PegWTF\}\}](#pegwtf).

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

The brand symbology and emoji representation is inherently "meme-able", adding to the velocity of the product's dissemination.

The innovators and early adopter market segment, who have significant community influence, and believe in the Ethereum community's value of maximal decentralization, have already been exposed to this symbology and can be recruited to spread the word about Uniloan and UniDollar.

Of course adoption of this branding mainly depends on the community's effective permission to use it, based on their sentiment of how aligned the product is with the Ethereum ideals.

#### 2.a. Unicorn dollar

This would be the preferred currency symbol for at least the initial stages of the product (before crossing the chasm), when the innovators and early adopter market segment would likely prefer to use this notation in their apps, as it reinforces a sense of community.

- Unicorn dollar symbol: 🦄$

Referred to as Unicorn dollars.

#### 2.b. Uni dollar

For mass users of UniDollar, more likely part of the early and late majority, who may not be familiar with the Unicorn symbology, having a more conventional and less light alternative representation is desirable. It will will help establish the trust and comfort required to use the currency for everyday commerce, both by consumers and by merchants. For example, one can imagine this symbol being used in payment applications, spreadsheets or accounting software user interfaces.

- Uni dollar symbol: 𝕦$

## Terms

**Stable-coin** - A fully digital token whose value that is stable relative to a reference pegged asset with high level of historical stability. The reference pegged asset could be anything from a national currency like the US Dollar ($), to a basket of stable and uncorrelated assets, such as basic commodities, or currencies.

**Digitized** commerce/money - Commerce or money that is represented and operated in digital form in order to achieve efficiencies offered by digital automation. The digitization is however not with full fidelity, and relies on a mechanism to tie the digital representation to physical representation of value, through legal and operational processes representing overhead.

**Digital** commerce/money - Commerce or money that is backed, represented and operated fully in digital form in order to achieve even higher efficiencies offered by digital automation.

## \{\{PegLoan\}\} market

The "Digital asset backed loan" market is one that is separate from the "consumer money" market. We will discuss the optimal positioning of \{\{PegLoan\}\} for the system's other stakeholders such as loan takers, price feed providers, liquidators, and market arbitragers.

-ToDo

## Appendix

### PegWTF

\{\{PegWTF\}\} is an imaginary money product and successor to \{\{PegDollar\}\}, based on the imaginary WTF (World Trade Francs) Unit of Account, defined and maintained by the also imaginary \{\{WTF Foundation\}\}, as a universally agreed-upon and stable basket of goods, assets and/or currencies. \{\{PegWTF\}\} is based on the same \{\{PegLoan\}\} system as the current research proposal, though it uses WTF as the reference currency.

See [WTF](https://blog.ethereum.org/2018/04/01/announcing-world-trade-francs-official-ethereum-stablecoin/) for reference. Seriously though, WTF!?!