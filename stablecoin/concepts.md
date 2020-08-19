# Concepts

- [Concepts](#concepts)
  - [🧒 Beginner (100 level)](#-beginner-100-level)
    - [⚖️$ PegDollar (🦄$ UniDollar)](#️-pegdollar--unidollar)
      - [💵✉️ Money send and receive](#️-money-send-and-receive)
      - [💵🔁 Money exchange](#-money-exchange)
      - [👛⬆️ Hold with interest](#️-hold-with-interest)
    - [⚖️🏦 PegLoan (🦄🏦 UniLoan)](#️-pegloan--uniloan)
      - [⏱⬆️ Accumulation tokens](#️-accumulation-tokens)
      - [📦⛓ Multi-blockchain](#-multi-blockchain)
      - [💵💶 Multi-currency](#-multi-currency)
    - [💰🏦 Loans](#-loans)
  - [🧑 Intermediate (200 level)](#-intermediate-200-level)
    - [🏷💬 Price feeds](#-price-feeds)
    - [🗳 Loan price feed allocation](#-loan-price-feed-allocation)
    - [🔥 Liquidations](#-liquidations)
  - [🧑‍💼 Professional (300 level)](#-professional-300-level)
    - [🤖⚖️ Automated monetary policy](#️-automated-monetary-policy)
    - [📉📈 Currency market arbitrage](#-currency-market-arbitrage)
    - [👥💬 Price feed distributed oracle](#-price-feed-distributed-oracle)
    - [🤖💬 Decentralized price feeds](#-decentralized-price-feeds)
  - [🧑‍🏫 Expert (400 level)](#-expert-400-level)
    - [🔒 Attacks and vulnerabilities](#-attacks-and-vulnerabilities)
      - [📉 Large native token drop](#-large-native-token-drop)
      - [🐳 Whale capture attack](#-whale-capture-attack)
      - [🐞 Contract risk](#-contract-risk)
      - [👥 Price feed collusion](#-price-feed-collusion)
    - [⏭ Transition planning and versioning](#-transition-planning-and-versioning)

## 🧒 Beginner (100 level)

### ⚖️$ PegDollar (🦄$ UniDollar)

![UniDollar][unidollar]

[unidollar]: concepts/unidollar@300h.png

#### 💵✉️ Money send and receive

![Money send and receive][money-send-receive]

[money-send-receive]: concepts/money-send-receive@300h.png

#### 💵🔁 Money exchange

![Money exchange][money-exchange]

[money-exchange]: concepts/money-exchange@300h.png

#### 👛⬆️ Hold with interest

![Hold with interest][hold-with-interest]

[hold-with-interest]: concepts/hold-with-interest@300h.png

### ⚖️🏦 PegLoan (🦄🏦 UniLoan)

![UniLoan][uniloan]

[uniloan]: concepts/uniloan@400h.png

#### ⏱⬆️ Accumulation tokens

ToDo: ☑️ Apply this concept to the technical specs, whitepaper, and the proof of concept.

Accumulation tokens are built on standard blockchain tokens (such as the ERC-20 token on Ethereum), however they are designed for accumulating interest. This interest is positive in most cases, although it can also be negative, which allows for more flexibility for setting monetary policy.

![Accumulation token][accumulation-token]

[accumulation-token]: concepts/accumulation-token@300h.png

Ultimately the value of a given unit of the standard token is set by the central smart contract in charge of the automated monetary policy. The value is continually increased for a positive interest and decreased for a negative one. For example, at a given point in time, the UniDollar (ERC-20) accumulation token can be worth 1.60 UniDollars, and the next day the monetary system can increase it to 1.600263, for a daily interest rate of `0.01644%` and an annualized rate of `6.0%`.

Negative interest rate is used in very rare cases to increase a desire to sell, thus incentivizing an increase token supply in the markets, and thus lowering the token's price.

#### 📦⛓ Multi-blockchain

The PegLoan concept can be similarly applied on top of any programmable blockchain. At the time of writing, the Ethereum blockchain is the most commonly used programmable blockchain, and thus was used for the initial proof of concept.

![Applicable to multiple blockchains][multi-blockchain]

[multi-blockchain]: concepts/multi-blockchain@300h.png

#### 💵💶 Multi-currency

The PegLoan concept can be similarly applied to any stable currency, although the systems supporting different currencies will be fully isolated.

![Applicable to multiple currencies][multi-currency]

[multi-currency]: concepts/multi-currency@300h.png

### 💰🏦 Loans

![Taking a loan][taking-loans]

[taking-loans]: concepts/taking-loans@400h.png

## 🧑 Intermediate (200 level)

### 🏷💬 Price feeds

### 🗳 Loan price feed allocation

### 🔥 Liquidations

## 🧑‍💼 Professional (300 level)

### 🤖⚖️ Automated monetary policy

### 📉📈 Currency market arbitrage

### 👥💬 Price feed distributed oracle

### 🤖💬 Decentralized price feeds

## 🧑‍🏫 Expert (400 level)

### 🔒 Attacks and vulnerabilities

#### 📉 Large native token drop

#### 🐳 Whale capture attack

#### 🐞 Contract risk

#### 👥 Price feed collusion

### ⏭ Transition planning and versioning
