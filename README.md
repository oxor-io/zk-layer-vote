# zkVote.cc

This repo contains source files of a cross-chain voting protocol for ETHGlobal Istanbul 2023.

[![](https://img.youtube.com/vi/N18IXQyNN14/0.jpg)](https://www.youtube.com/watch?v=N18IXQyNN14 "zkvote demo")

# Introduction

## Problem

Many blockchain projects have governance tokens (such as UNI). Typically, the voting token and DAO smart contracts are deployed on the main Ethereum network. However, a significant portion of the governance tokens are transferred to L2 networks using bridges, stripping them of their governance functionality. Thus, to participate in DAO governance, tokens must be transferred back to the main Ethereum network, which is expensive, inconvenient, and not always fast.

## Examples

There are numerous governance tokens initially deployed and used for governance on Ethereum L1, which have been partly bridged to various L2 networks. For example:
- Curve | CRV token - no less than 2.5% of the circulating supply is bridged to various L2s (based on Coingecko data - sum of bridged tokens' totalSupply).
- Lido V2 | LDO token - no less than 0.37% of the circulating supply is bridged to various L2s.
- Uniswap V3 | UNI token - no less than 0.23% of the circulating supply is bridged to various L2s.

Currently, the percentage of the circulating supply that is bridged to various L2s is not large. However, it will definitely increase with the growing popularity of L2 solutions and the emergence of the ability to vote with tokens located on L2s.

## Solution

Since the architecture of L2 networks involves storing the state root on the main network, this state root can be used for storage proofs of governance token balances in the L2 network:
- A user wishing to vote using tokens on an L2 network visits the project's frontend: enters their voting decision (for/against, amount of tokens) and signs it with their private key. The project's backend generates a storage proof that a user with such a balance in L2 votes this way in the election.
- The project's backend aggregates all votes/proofs into a single recursive SNARKs proof and sends it to the L1 voting contract.

## Architecture

![ArchitectureScheme](Final.png)

Let's consider the architecture and operation of the project step by step:
1. When creating a proposal for voting on the main Ethereum network, the snapshot block numbers in each supported L2 are recorded. The governance token balances in each L2 network at the corresponding block can be used for this election.
2. A user wishing to vote using tokens on an L2 network visits the project's frontend: enters their voting decision (for/against, amount of tokens) and signs it with their private key. The project's backend checks the user's balance in the L2 network and generates a storage proof (zk proof) that a user with such a balance in L2 votes this way in the election.
3. The project's backend accumulates user votes in the form of zk proofs. At the end of the voting period, the project's backend aggregates all votes/proofs into a single recursive SNARKs proof and sends it to the L1 voting contract.
4. The main voting contract checks and aggregates proofs from all networks, distributes corresponding votes among the voting options.

## Installation

### Frontend module
1. `npm install` - Install all dependencies
2. `npm run build` - Build the project
3. `npm start` - Start the frontend server

### Backend module
1. `npm install` - Install all dependencies
2. `docker-compose up` - Run Redis in Docker
3. `npm start` - Start the backend server

### On-chain module
1. `npm install` - Install all dependencies
2. `hardhat compile` - Compile the smart contracts
3. `hardhat migrate` - Deploy the smart contracts

### ZK Proof generator
1. `npm install` - Install all dependencies
2. `node generate.js` - Generate the zero-knowledge proofs

## Deployments

### Frontend demo
https://6559b054b025a87e3173ea8c--zk-layer-vote.netlify.app

### Sepolia
- VotesTokenL1 - [0x4d389dA3786036ee0b9aba8E4B99891a925d88D0](https://sepolia.etherscan.io/address/0x4d389dA3786036ee0b9aba8E4B99891a925d88D0)
- GovernerL1 - [0xD7A1DC78F0E90Ab2645E1DbECf6135D17c7dA411](https://sepolia.etherscan.io/address/0xD7A1DC78F0E90Ab2645E1DbECf6135D17c7dA411)
- StateRootL1 - [0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5](https://sepolia.etherscan.io/address/0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5)

### Scroll-sepolia
- TokenL2 - [0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e](https://sepolia-blockscout.scroll.io/address/0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e)
- DelegateL2 - [0x4d389dA3786036ee0b9aba8E4B99891a925d88D0](https://sepolia-blockscout.scroll.io/address/0x4d389dA3786036ee0b9aba8E4B99891a925d88D0)

### XDC-testnet
- TokenL2 - [0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5](https://explorer.apothem.network/address/0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5#transactions)
- DelegateL2 - [0x491A7D1A203980Fd5d2cdE093893FcdCf994291e](https://explorer.apothem.network/address/0x491A7D1A203980Fd5d2cdE093893FcdCf994291e#internalTransactions)

### Arbitrum-sepolia
- TokenL2 - [0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e](https://sepolia.arbiscan.io/address/0xc007267df5f0f7aec5fb90cf03b56f051bc6c89e)
- DelegateL2 - [0x4d389dA3786036ee0b9aba8E4B99891a925d88D0](https://sepolia.arbiscan.io/address/0x4d389dA3786036ee0b9aba8E4B99891a925d88D0)

### Polygon-zkEVM-testnet
- TokenL2 - [0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e](https://testnet-zkevm.polygonscan.com/address/0xc007267df5f0f7aec5fb90cf03b56f051bc6c89e)
- DelegateL2 - [0x4d389dA3786036ee0b9aba8E4B99891a925d88D0](https://testnet-zkevm.polygonscan.com/address/0x4d389dA3786036ee0b9aba8E4B99891a925d88D0)

### Gnosis-mainnet
- TokenL2 - [0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5](https://gnosisscan.io/address/0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5)
- DelegateL2 - [0x491A7D1A203980Fd5d2cdE093893FcdCf994291e](https://gnosisscan.io/address/0x491A7D1A203980Fd5d2cdE093893FcdCf994291e)

### Celo-alfajores
- TokenL2 - [0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e](https://alfajores.celoscan.io/address/0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e)
- DelegateL2 - [0x4d389dA3786036ee0b9aba8E4B99891a925d88D0](https://alfajores.celoscan.io/address/0x4d389dA3786036ee0b9aba8E4B99891a925d88D0)

### Base-goerli
- TokenL2 - [0x6c9373BaD4d213Ea0C796cCF039102B43341df24](https://goerli.basescan.org/address/0x6c9373bad4d213ea0c796ccf039102b43341df24)
- DelegateL2 - [0x507d16b08562Bc341775657C18eA2123EFc69FD1](https://goerli.basescan.org/address/0x507d16b08562Bc341775657C18eA2123EFc69FD1)

### Linea-testnet
- TokenL2 - [0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e](https://goerli.lineascan.build/address/0xc007267df5f0f7aec5fb90cf03b56f051bc6c89e)
- DelegateL2 - [0x4d389dA3786036ee0b9aba8E4B99891a925d88D0](https://goerli.lineascan.build/address/0x4d389da3786036ee0b9aba8e4b99891a925d88d0)

## Future track
Our end goal is to develop an open-source cross-chain governance module that operates on recursive SNARKs and can be integrated with existing governance frameworks like Tally, Snapshot, and others.

1. Improving SNARK proofs aggregation.
2. Implementing custom plugins for voting mechanisms:
    - OpenZeppelin Governor | Ethereum | [link](https://docs.openzeppelin.com/contracts/4.x/api/governance)
    - Aragon | Ethereum | [link](https://aragon.org/)
    - Tally | Ethereum | [link](https://www.tally.xyz/)
    - Guild | Ethereum | [link](https://guild.xyz/)
    - Llama | Ethereum | [link](https://llama.xyz/)
    - Colony | Ethereum | [link](https://colony.io/)
    - Snapshot | Ethereum | [link](https://snapshot.org/#/)