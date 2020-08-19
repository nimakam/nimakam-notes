# The internet's missing identity layer <!-- omit in toc -->

Sections overview:

- [Summary](#summary)
- [The internet's architecture](#the-internets-architecture)
- [A universal identity protocol](#a-universal-identity-protocol)
- [Identity owners](#identity-owners)
- [Security and privacy postures](#security-and-privacy-postures)
  - [Connected identity](#connected-identity)
  - [Private identity](#private-identity)
  - [Public identity](#public-identity)
- [Web 3.0 and beyond](#web-30-and-beyond)
  - [Personal data store](#personal-data-store)
  - [Decentralized application protocols](#decentralized-application-protocols)
  - [Digital value transfer](#digital-value-transfer)

## Summary

## The internet's architecture

The original internet protocols (TCP/IP, DNS, etc) as well as the world-wide web protocols (HTML, HTTP, etc) were all primarily designed to support a **universal information system**, one that enabled the sharing of **public information** in a **decentralized** and **permissionless** manner.

Web 1.0 came with its own elementary form of identity subsystem in the form of Uniform Resource Identifiers (URIs), Domain Name Service (DNS) and X509 secure certificates. It was never designed to be a general purpose digital identity system, particularly for general consumer use cases.

Facing the said lack of a robust universal identity system, Web 2.0 companies such as **Facebook**, Google and others built their own **proprietary identity systems** to support their consumer content and social networking platforms. In the case of Facebook, their identity system was marketed to app developers as a **generalized web identity system**, at some benefit to the usability of those apps, but at the cost of **ceding developer and consumer power** to a rapidly growing Facebook.

![Web 2.0 architecture][web-2-0-architecture]

[web-2-0-architecture]: internet-missing-identity-layer/web-2-0-architecture.png

The closest the internet came to defining a **semi-decentralized consumer identity system** was the Simple Mail Transfer Protocol (SMTP), that describes email addresses identifying individuals and mailboxes holding their information. However, per its design, this system has primarily been used for transferring email, as opposed to a general purpose identity system.

![Electronic mail identity system][email-identity-system]

[email-identity-system]: internet-missing-identity-layer/email-identity-system.png

## A universal identity protocol

The internet needs and deserves a truly decentralized and generally usable identity system. We believe this need can only be fulfilled by an open, decentralized and permissionless protocol that supports a variety of applications and use cases to allow everyone to secure, manage and use their digital identities in a uniform standards-based manner.

A core building block of such a system are identity operator services which provide a home for each user's digital identity similar to how an email provider holding a user's emails. The identity protocol would have to designates the collection of identity operator services to be decentralized, such that the user can transfer their identity between operators at any time, with minimal friction.

![A universal identity system][a-universal-identity-system]

[a-universal-identity-system]: internet-missing-identity-layer/a-universal-identity-system.png

## Identity owners

Although the most commonly used mode of using a ubiquitous identity protocol will be one operated on behalf of customers by 3rd-party identity providers, the protocol needs to support additional modes of operation for different audiences. Generally identity holders are closest to one of the following categories:

1. Consumer
2. Early tech adopter
3. Public organization

Each of these identity holder profiles have their own set of preferences and requirements for operating their identity, most importantly around security, privacy and effort/usability.

![Identity owners' desired traits of an identity system][owner-desired-traits]

[owner-desired-traits]: internet-missing-identity-layer/owner-desired-traits.png

## Security and privacy postures

We categorize these as security and privacy postures, as well as their tradeoff with effort/usability, in the following ways:

1. Connected (for consumer)
2. Manual (for tech early adopter)
3. Public (public organization)

![Security and privacy postures of the protocol][protocol-security-privacy-postures]

[protocol-security-privacy-postures]: internet-missing-identity-layer/protocol-security-privacy-postures.png

### Connected identity

Also known as 3rd-party-operated connected identities, are the largest category of identities, likely owned by consumers, who prefer the highest degree of usability and lowest amount of effort, while maintaining a reasonable level of security and privacy. For this group, reliance on identity operators is required, although they will be able to transfer across specific identity providers with minimal friction.

### Private identity

Also known as manually-operated private identities are likely owned by early tech adopters. They can be considered a niche category of identities in pure numbers, although they are crucial to the initial adoption of any identity protocol. The owners generally prefer the highest degree of security, privacy and control over their identity, while maintaining a reasonable level of usability. For this group, reliance on identity operators is optional, although they will be able to interact with services as well as other manual identity holders in limited or peer-to-peer manner.

### Public identity

This is the most economically valuable category of identities, recorded on a public blockchain, and owned by public organizations such as businesses, institutions, or any other public facing organization especially ones that interact with everyday consumers. They generally separate their public facing identity from their internal systems, and generally prefer the highest degree of security and control over their public identity, with minimal privacy, while being OK with any additional effort needed. For this group, reliance on identity operators helps them build public facing services, but they will likely exercise full control over such operations.

## Web 3.0 and beyond

### Personal data store

### Decentralized application protocols

### Digital value transfer
