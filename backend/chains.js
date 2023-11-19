module.exports = {
  // 1: {
  //   chainId: 1,
  //   providerUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
  //   tokenL2: '0xdAC17F958D2ee523a2206206994597C13D831ec7',  // USDT
  //   fromBlock: 18597627,
  // },
  50: {
    // XDC Network
    chainId: 50,
    // providerUrl:
  },
  51: {
    // XDC Apothem Network
    chainId: 51,
    providerUrl: `https://erpc.apothem.network`,
    // tokenL2: '0xDf29cB40Cb92a1b8E8337F542E3846E185DefF96',  // FXD
    // fromBlock: 57005948,
    tokenL2: '0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5',
    fromBlock: 57052616,
  },
  11155111: {
    // Sepolia
    chainId: 11155111,
    providerUrl: `https://ethereum-sepolia.publicnode.com`,
  },
  534351: {
    // Scroll Sepolia Testnet
    chainId: 534351,
    providerUrl: `https://scroll-testnet-public.unifra.io`,
    tokenL2: '0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e',
    fromBlock: 2303587,
  },
  421614: {
    // Arbitrum Sepolia
    chainId: 421614,
    providerUrl: `https://sepolia-rollup.arbitrum.io/rpc`,
    tokenL2: '0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e',
    fromBlock: 1234215,
  },
  1442: {
    // Polygon zkEVM Testnet
    chainId: 1442,
    providerUrl: `https://rpc.public.zkevm-test.net`,
    tokenL2: '0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e',
    fromBlock: 3222705,
  },
  100: {
    // Gnosis
    chainId: 100,
    providerUrl: `https://gnosis.drpc.org`,
    tokenL2: '0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5',
    fromBlock: 31014819,
  },
  44787: {
    // Celo Alfajores Testnet
    chainId: 44787,
    providerUrl: `https://alfajores-forno.celo-testnet.org`,
    tokenL2: '0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e',
    fromBlock: 20989273,
  },
  84531: {
    // Base Goerli Testnet
    chainId: 84531,
    providerUrl: `https://base-goerli.publicnode.com`,
    tokenL2: '0x6c9373BaD4d213Ea0C796cCF039102B43341df24',
    fromBlock: 12568633,
  },
  59140: {
    // Linea Testnet
    chainId: 59140,
    providerUrl: `https://rpc.goerli.linea.build`,
    tokenL2: '0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e',
    fromBlock: 2053728,
  }
}