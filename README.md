# KYC on the tangle

## Team
Benedickt Löbbeke
Jelle Millenaar
Philipp Alexander Blum
Riswan Lathif



## Use Case

A user doesn't want to go through the whole process of KYC.
He just want to take a car and pays directly for it.
The car sharing company on the other side needs to know exactly who drives with which car.
This is a legal requirement for many reasons. e.g. insurance, taxes, fraud prevention etc.
We are using this Use-case to proof that is theoretical possible. Also in a bigger scale and with
low latency.

## Functional description

This repository contains an application which makes it possible to verify users and their data in
a theoretical decentralized matter. Currently just limited by the low amount of IOTA transactions.

It uses MAM to solves this. A government creates a stream and splits this stream for each ID/user.
The user must own this address. Therefore he has the full control over his verification branch.
But the government has the capability to revoke IDs if necessary, by just pointing to the stream
with a special revoke message.

This repository just contains a Proof of Concept.
Therefore, it is not designed to be used in a production environment.
It is also contains a lot of fixed data-sets.
Therefore it is definitely, in this state, not secure.

### Privacy

We make sure with this concept that each user has the full control over his data.
No clear text data are saved on the tangle. We only provide a root hash.
The user provides the actual data and has control what data he provides during the KYC process.
Each data point, e.g. firstname and lastname, will hashed individually.
It will then combined with another individual hashed value in a tree. Until it reaches the root hash.
This root hash can then verified with the provided root hash by a government authority.

### Extendability

This concept is extendable. So, it can not only provide IDs by official authorities.
It can be also used for other types of IDs. Social Media, Company etc.
Theoretical it would be also possible to allow user to sell its data-sets.
This can then, with support of the ID provider, get verified.
Both sides could earn money with this data-sets.


### Technology

- IOTA + MAM
- Bluetooth 4.0
- WebAssembly
- Android


## Backend: How to run this application

### Install dependencies

```
npm i
```

### Run the appplication (needs to be on a node with bluetooth and all dependencies for bleno)
```
npm run start
```

## Android App
