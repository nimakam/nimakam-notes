# The internet's missing identity layer <!-- omit in toc -->

Section overview:

- [Summary](#summary)
- [Internet history and architecture](#internet-history-and-architecture)
- [A universal identity protocol](#a-universal-identity-protocol)
  - [The contenders](#the-contenders)
  - [Ideal solution](#ideal-solution)
  - [Identity owners](#identity-owners)
- [Horizontal scenarios](#horizontal-scenarios)
  - [Login and account creation](#login-and-accountcreation)
  - [Privacy and personal data management](#privacy-and-personal-data-management)
  - [Recovery](#recovery)
  - [Connection management](#connection-management)
  - [General administration](#general-administration)
- [Web 3.0 and beyond](#web-30-and-beyond)
  - [Privacy and personal data ownership](#privacy-and-personal-data-ownership)
  - [Decentralized application protocols](#decentralized-application-protocols)
  - [Digital value ownership](#digital-value-ownership)
  - [Personal data store](#personal-datastore)
  - [Use cases](#use-cases)
  - [Bridge to legacy](#bridge-to-legacy)
  - [Conclusion](#conclusion)

## Summary

The history of internet as a public information system has contributed to lack of a robust identity layer during the Web 1.0 period. Internet companies such as Facebook, Google and Microsoft were driven to build their own identity layers in the Web 2.0 era, and later developed a standardized identity provider model based on OAuth 2.0.

The current centralization and fragmented state of the identity provider model, highlights the need for a native internet identity protocol that is, decentralized, permissionless, privacy-enabled, self-sovereign, interoperable and usable. Current approaches such as legacy identity providers, blockchain identity, and offline cryptographic identity, all claim universality, yet fail to address the requirements of all identity owner groups including consumers, early adopters, and public businesses.

We identify a set of vertical scenarios that need to be supported including account creation, login, privacy, recovery, etc. We also identify patterns and features such as password-less operation, the use of cryptographic public-private keys, along with hardware secured cryptography modules, as a secure foundation for the whole system.

As part of a Web 3.0 wave of technologies, not only will such a universal identity protocol affect the existing technology landscape by reducing centralization of power and user lock-in, it also opens up technical possibilities for developers to build universally interoperable applications. The existence of such an identity layer, will also lay the foundation for future developments in privacy, persona data ownership, decentralized application protocols, digital value ownership as well as personal data stores.

## Internet history and architecture

The original internet protocols (TCP/IP, DNS, etc) as well as the world-wide web protocols (HTML, HTTP, etc) were all primarily designed to support a **universal information system**, one that enabled the sharing of **public information** in a **decentralized** and **permissionless** manner.

Web 1.0 came with its own elementary form of identity subsystem in the form of Uniform Resource Identifiers (URIs), Domain Name Service (DNS) and X509 secure certificates. It was never designed to be a general purpose digital identity system, particularly for general consumer use cases.

Facing the said lack of a robust universal identity system, Web 2.0 companies such as **Facebook**, Google and others built their own **proprietary identity systems** to support their consumer content and social networking platforms. In the case of Facebook, their identity system was marketed to app developers as a **generalized web identity system**, at some benefit to the usability of those apps, but at the cost of **ceding developer and consumer power** to a rapidly growing Facebook.

![Current internet architecture][current-internet-architecture]

[current-internet-architecture]: internet-missing-identity-layer/current-internet-architecture.png

The closest the internet came to defining a **semi-decentralized consumer identity system** was the Simple Mail Transfer Protocol (SMTP), that describes email addresses identifying individuals and mailboxes holding their information. However, per its design, this system has primarily been used for transferring email, as opposed to a general purpose identity system.

![Electronic mail identity system][email-identity-system]

[email-identity-system]: internet-missing-identity-layer/email-identity-system.png

## A universal identity protocol

The internet needs and deserves a truly decentralized and generally usable identity system. We believe this need can only be fulfilled by a distributed protocol, that:

1. Is open, decentralized and permissionless.
2. Is privacy-enabled.
3. Allows everyone to own, secure, manage and use their digital identities.
4. Is usable by consumers.
5. Supports tech early adopter scenarios.
6. Is based on agreed-upon standards.
7. Is interoperable with other consumer and public identity systems.
8. Supports of a growing variety of applications and use cases through versioning.

### The contenders

The Web 2.0 identity providers, have achieved a considerable level of success, with the help of OAuth 2.0 and OpenId Connect open protocols. Most of the internet's over 300 billion daily login volume flows through such providers including Facebook, Google, other central providers, as well as miscellaneous proprietary implementations. Facebook has proven by far the most ubiquitous identity provider and identity app platform. 

Despite its current success, the Web 2.0 identity provider model has lead to a fragmented and skewed identity ecosystem, in which the consumers and app developers hold little market power, compared to centralized players like Facebook who leverage their market size and control over consumer data.

For the early adopter audience, one category of products including PGP, Keybase, etc, emphasizes privacy and control, while  another category focuses on blockchain-based decentralized finance application such as digital wallets, and touts features around security and control. These solutions are generally difficult to use, require extensive operation effort, and/or fail to effectively connect to the existing consumer identity ecosystems.

Up and coming blockchain-based identity platforms such as Sovrin and uPort's Ethereum alternative, promise to be a universal, permissionless and decentralized solution to the identity problem, however due to their blockchain-based design, they especially fail to provide the adequate privacy required by the consumer and early adopter markets.

### Ideal solution

The ideal technical solution is one that takes into account the requirements from all audiences and use cases. A truly universal identity system is expected not only to offer different flavors of identities for each set of requirements, but to enable full interoperation between all such types. To remain relevant, the protocol is expected to evolve over time, in order to cover additional use cases.

In order to build a strong and global ecosystem, it is crucial for the base protocol to be permissionless and censorship resistant, otherwise it will not be able to bring in developers and other ecosystem stakeholders.

Most of all a successful solution needs to properly identify and fulfill the needs of identity owners, as well as give them sufficient control over their digital identity and personal information. Being password-less is only one of those requirements that needs to be fulfilled.

A core building block of such a system are identity operator services which provide a home for each user's digital identity similar to how an email provider holding a user's emails. The identity protocol would have to designates the collection of identity operator services to be decentralized, such that the user can transfer their identity between operators at any time, with minimal friction.

![A universal identity system][a-universal-identity-system]

[a-universal-identity-system]: internet-missing-identity-layer/a-universal-identity-system.png

### Identity owners

Although the most commonly used mode of using a ubiquitous identity protocol will be one operated on behalf of customers by 3rd-party identity providers, the protocol needs to support additional modes of operation for different audiences. Generally identity holders are closest to one of the following categories:

1. **Consumers** - prefer the highest degree of usability and lowest amount of effort, while maintaining a reasonable level of security and privacy.
2. **Early tech adopter** - prefer the highest degree of security, privacy and control over their identity, while maintaining a reasonable level of usability.
3. **Public organization** - separate their public facing identity from their internal systems, and generally prefer the highest degree of security and control over their public identity, with minimal privacy, while being OK with any additional effort needed.

Each of these identity owner profiles have their own set of preferences and requirements for operating their identity, most importantly around security, privacy, effort/usability and secured value levels.

![Identity owners' desired traits of an identity system][owner-desired-traits]

[owner-desired-traits]: internet-missing-identity-layer/owner-desired-traits.png

## Horizontal scenarios

Regardless of the vertical use cases supported by a user-owned identity system, it has to support a minimum set of vertical requirements, such as account creation, login, privacy, recovery, etc. You can clearly draw parallels with the following supported scenarios and existing identity systems such as Facebook login and social network products.

### Login and account creation

The most frequently performed identity-related action already occurring on the web is login. The user should be able to log into 3rd-party web services by cryptographically proving control over a digital identity instance, without the use of passwords. They should also be able to create a virtual account with said 3rd-party web service upon first encounter. The Facebook equivalent of this is "Login with Facebook" whether you have arrived at a website like AirBnB for the first time to "signup", or subsequently to "login".

### Privacy and personal data management

The user should be able to define the personal information tied to their identity, and specify permission rules describing how 3rd party web services and other people can access that information. The parallel scenario while using Facebook is the information sharing options upon signup as well as privacy controls.

### Recovery

Although this is not a common scenario, it is absolutely necessary for users of the identity system to feel confident that their identity can be recovered securely in case of unexpected events, such as loss of a device, detection of fraudulent activity, temporary inaccessibility or incapacitation, etc. In the decentralized world of self-sovereign identity, recovery transforms into multi-device recovery or social recovery, instead of relying on a central party to detect and resolve issues. Parallel experiences while using Facebook are, password recovery, account suspension due to suspicion of fraud, and others.

### Connection management

Digital systems have always been used by people as tools to more easily access and invoke their social and commercial connections with other entities. Think of a Rolodex or a personal address/phone/contact book.

The internet's identity layer should allow users to mange and use the list of their mutual personal and commercial connections, with the ability to dynamically update personal data sharing preferences, or even severe connections when needed. For example, a consumer should be able to unilaterally cancel their account with any commercial business, with the expectation that the business will honor that request by ceasing charges and deleting their personal data.

### General administration

Running a decentralized protocol comes with the additional complexities of managing changes across independently controlled and operated entities. As such there will be a number of operational processes such as protocol version upgrades, key rotations, identity transitions, that will have to be supported differently for each audience. For the consumer audience specifically, most of these operations should be simplified by allowing a 3rd-party operator to perform them in the background while maintaining security and minimizing required trust.

## Web 3.0 and beyond

Web 3.0 generally describes the next transformative wave of internet technologies. A truly decentralized, permissionless and ubiquitous internet identity protocol, is surely to be part of the Web 3.0 wave, with the potential to unlock enormous value for everyone, in ways that are well-known today as well in speculated ways that we will understand better in the future. A few of the more general well-known opportunities will be related to strategic realignment of tech as well as expanding technical possibilities for developers.

Currently most of the moats or barriers erected by large technology vendors is rooted in locking in customers' digital identities and reliance on the inherent frictions caused by personal data. The existence of such a ubiquitous and decentralized identity protocol, has the potential to transform the strategic landscape of digital technology and create a more competitive and productive markets.

The foundation of all modern software systems and applications is digital identity, and having a working, interoperable, and usable internet identity layer will empower users and unleash developers to dream up new distributed applications, protocols, and  tools that will push our collective value creation potential to the next level.

Below are some of the more future facing areas of potential, but ones that have been discussed extensively by the technology community.

### Privacy and personal data ownership

This is the most anticipated class of benefits we could expect from a universal identity layer that adheres to principles of self-sovereign identity as a movement. Having such an identity layer, first of all, enables identity owners to digitally express their preferences on how their personal data may be exposed and used by other parties. This is a profoundly important step in the road to establishing, legislating and enforcing a common set of agreed-upon rules around private data definition and licensing.

For example one can foresee a future where every user is expected to set privacy and licensing preferences for their personal data, with the assumption of high privacy and minimal licensing by default. Because such standards-based preferences can be expressed digitally, it will be increasingly more feasible to expect compliance by service providers, legislative codification into laws, as well as enforcement by governments.

### Decentralized application protocols

The blockchain technology community has already introduced the world to a set of decentralized applications, such as Decentralized Finance protocols that do not rely on a central actor to run, and are immune to excessive value capture and rent seeking behavior.
Today, one of the factors limiting the traction of additional decentralized application use cases is the limitations of blockchain usability rooted in user experience issues with digital identity. Integrating  a robust and usable identity protocol with distributed trust technologies dramatically increases the feasibility of usable and interoperable decentralized application protocols.

For example, establishing a decentralized protocol for licensing, consuming and monetizing digital content (such as music, video, digital art, articles, books, podcasts, news, etc.), will require a variety of non-technical users to maintain an account with the system. This is not feasible on the blockchain today, due to lack of privacy and usability issues. A robust, privacy-enabled, and universal digital identity layer will render building such a system that much easier.

### Digital value ownership

Blockchain and Decentralized Finance have already demonstrated the potential of digitizing value. The final few impediments to mass adoption, and digitally banking the unbanked, have a lot in common with the problems of establishing secure digital identities that are permissionless, usable, and recoverable from unexpected events. They are also often based on the same cryptographic fundamentals of securely controlling private keys.

In terms of usability, there already exists overlapping metaphors for keys, identity documentation, payment cards, signets, etc. In terms of technology, being able to securely maintain possession of cryptographic private keys is sufficient to secure access to other digital financial accounts including on the blockchain. There is no reason why a digital identity solution for the masses cannot also be the backbone for digitally owning value on the blockchain-based financial infrastructure.

### Personal data store

One of the biggest barriers to reducing migration friction for users who want to move between competing web service providers is the lack of a standard personal data store solution. Often we hear about a new and better web service, we try it only to confirm it is in fact better than the legacy alternative. However we are often unable to move because the data we already use for that scenario is locked into the existing legacy service, and there is no easy way to convert it.

If only there was a standard format for such data, and if only all such service providers were compelled to support it and provide frictionless migration options. The missing piece here, in addition to the data schema standard, is a standards-based personal data store, that can help with the user's ownership of all application data, while allowing web services to rely on that data. Universal digital identity and data permissions capabilities are the primary barriers to this vision becoming a reality.

### Use cases

// ToDo

### Bridge to legacy

// ToDo

### Conclusion

It is good to talk about what the future will or should look like, but it is even worthier to work on building it, while applying the lessons of the past. We have now gathered over 4 decades of learnings from evolution of the internet as a public tool that generally has had a positive impact on the world. However, some of these learnings come from large scale mistakes that continue to adversely affect the lives of many in the world.  Endeavoring to undo these mistakes as we build the future is certainly a worthy goal to pursue. Come join me on this journey.
