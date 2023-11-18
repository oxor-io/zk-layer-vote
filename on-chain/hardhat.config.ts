import '@nomicfoundation/hardhat-toolbox';

import 'hardhat-contract-sizer';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

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
                blockNumber: 4717000,
            },
            chainId: 11155111,
            allowUnlimitedContractSize: false,
            blockGasLimit: 40000000,
            gas: 40000000,
            gasPrice: 'auto',
            loggingEnabled: false,
        },
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
    etherscan: {
        apiKey: `${process.env.ETHERSCAN_API_KEY}`,
    },
};

export default config;
