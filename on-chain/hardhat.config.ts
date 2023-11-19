import '@nomicfoundation/hardhat-toolbox';

import 'hardhat-contract-sizer';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import "hardhat-celo";

import 'dotenv/config';

import { HardhatUserConfig } from 'hardhat/types';

const config: HardhatUserConfig = {
    defaultNetwork: 'hardhat',
    paths: {
        sources: './contracts',
        tests: './test',
        artifacts: './artifacts',
        cache: './cache',
    },
    networks: {
        hardhat: {
            forking: {
                url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
                blockNumber: 4720400,
            },
            chainId: 11155111,
            allowUnlimitedContractSize: false,
            blockGasLimit: 40000000,
            gas: 40000000,
            gasPrice: 'auto',
            loggingEnabled: false,
        },
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
            chainId: 11155111,
            gasMultiplier: 1.2,
            accounts: [`${process.env.PRIVATE_KEY}`],
            loggingEnabled: true,
        },
        xdc: {
            url: `https://erpc.apothem.network`,
            chainId: 51,
            gasMultiplier: 1.2,
            accounts: [`${process.env.PRIVATE_KEY}`],
            loggingEnabled: true,
        },
        scroll: {
            url: `https://sepolia-rpc.scroll.io/`,
            chainId: 534351,
            gasMultiplier: 1.2,
            accounts: [`${process.env.PRIVATE_KEY}`],
            loggingEnabled: true,
        },
        arbitrum: {
            url: `https://sepolia-rollup.arbitrum.io/rpc`,
            chainId: 421614,
            gasMultiplier: 1.2,
            accounts: [`${process.env.PRIVATE_KEY}`],
            loggingEnabled: true,
        },
        gnosis: {
            url: `https://gnosis.publicnode.com`,
            chainId: 100,
            gasMultiplier: 1.2,
            accounts: [`${process.env.PRIVATE_KEY}`],
            loggingEnabled: true,
        },
        base: {
            url: `https://goerli.base.org`,
            chainId: 84531,
            gasMultiplier: 1.2,
            accounts: [`${process.env.PRIVATE_KEY}`],
            loggingEnabled: true,
        },
        celo: {
            url: `https://alfajores-forno.celo-testnet.org`,
            chainId: 44787,
            gasMultiplier: 1.2,
            accounts: [`${process.env.PRIVATE_KEY}`],
            loggingEnabled: true,
        },
        polygon: {
            url: `https://rpc.public.zkevm-test.net`,
            chainId: 1442,
            gasMultiplier: 1.2,
            accounts: [`${process.env.PRIVATE_KEY}`],
            loggingEnabled: true,
        },
        linea: {
            url: `https://rpc.goerli.linea.build`,
            chainId: 59140,
            gasMultiplier: 1.2,
            accounts: [`${process.env.PRIVATE_KEY}`],
            loggingEnabled: true,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: `${process.env.ETHERSCAN_API_KEY}`,
            scroll: `${process.env.SCROLL_API_KEY}`,
            gnosis: `${process.env.GNOSIS_API_KEY}`,
            alfajores: `${process.env.CELO_API_KEY}`,
        },
        customChains: [
            {
              network: 'scroll',
              chainId: 534351,
              urls: {
                apiURL: 'https://sepolia.scrollscan.com/api',
                browserURL: 'https://sepolia.scrollscan.com/',
              },
            },
        ],
    },
    solidity: {
        compilers: [
            {
                version: '0.8.20',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    mocha: {
        timeout: 500000,
    },
};

export default config;
