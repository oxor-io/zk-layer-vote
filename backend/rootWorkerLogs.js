const ethers = require("ethers");
const { generateTree, proofElementInTree, selializeTree } = require("./generateMerkleTree");
const { createClient } = require('redis');
const ABI_ERC20 = require("./abi/Erc20.json");
const { abi: ABI_STATE_ROOT_L1 } = require("./abi/StateRootL1.json");
const { default: MerkleTree } = require("fixed-merkle-tree");
require("dotenv").config();

const chainCfg = {
  1: {
    chainId: 1,
    providerUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
  },
  50: {
    chainId: 50,
    // XDC Network
    // providerUrl:
  },
  51: {
    // XDC Apothem Network
    chainId: 51,
    providerUrl: `https://erpc.apothem.network`,
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
  }
}

const cfgL1 = chainCfg[process.env.CHAIN_ID_L1]
const cfgL2 = chainCfg[process.env.CHAIN_ID_L2]

// providers
const PROVIDER_L1 = new ethers.JsonRpcProvider(cfgL1.providerUrl)
const PROVIDER_L2 = new ethers.JsonRpcProvider(cfgL2.providerUrl)

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, PROVIDER_L1)

const CONTRACT_L1 = new ethers.Contract(
  process.env.SEPOLIA_STATE_ROOT_ADDRESS,
  ABI_STATE_ROOT_L1,
  wallet
)

const ERC20_L2 = process.env.SEPOLIA_SCROLL_ERC20_ADDRESS
const CONTRACT_L2 = new ethers.Contract(
  ERC20_L2,
  ABI_ERC20,
  PROVIDER_L2
)

// Redis client
let client


async function getLogs(fromBlock, toBlock) {
  // https://docs.alchemy.com/docs/deep-dive-into-eth_getlogs#what-are-event-signatures
  const logs = await PROVIDER_L2.getLogs(
    {
      "fromBlock": fromBlock,
      "toBlock": toBlock,
      "address": ERC20_L2,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        // "0x0000000000000000000000000000000000000000000000000000000000000000",
      ]
    }
  )

  console.log("Logs number at all: ", logs.length)
  return logs
}


async function getAddressBalance(address) {
  return await CONTRACT_L2.balanceOf(address)
}


async function storeBalances(logs) {
  const storedBalances = await client.hGetAll(`chainId-${cfgL2.chainId}-balances`);

  for (let i=0; i<logs.length; i++) {
    const address = '0x' + logs[i].topics[2].slice(26)
    const balance = await getAddressBalance(address)

    if (address in storedBalances && storedBalances[address] == balance.toString()) {
      continue
    }

    console.log("New Address&Balance: ", address, balance)
    await client.hSet(`chainId-${cfgL2.chainId}-balances`, address, balance.toString())
  }
}

async function getTreeLeafs() {
  const storedBalances = await client.hGetAll(`chainId-${cfgL2.chainId}-balances`);

  let leafsData = []
  for (const address in storedBalances) {
    const balance = storedBalances[address]
    leafsData.push([address, balance])
    console.log(`Leafs Address&Balance: ${address}: ${balance}`);
  }
  console.log("Leafs count: ", leafsData.length)
  return leafsData
}

async function storeTree(blockNumber, leafsData) {
  const tree = await generateTree(process.env.TREE_HEIGHT, leafsData)
  const treeStr = await selializeTree(tree)

  await client.hSet(`chainId-${cfgL2.chainId}-trees`, blockNumber.toString(), treeStr);
  console.log("Tree root: ", tree.root)
  return tree
}

async function checkTree(tree, leafsData) {
    console.log("Check leaf: ", leafsData[0])
    await proofElementInTree(tree, leafsData[0])
    // console.log("Proof2: ", await proofElementInTree(tree, ['0x22f6cc8738308a8c92a6a71ea67832463d1fec0d', 71983490000 ]))
    // console.log("Proof wrong: ", await proofElementInTree(tree, ['0x22f6cc8738308a8c92a6a71ea67832463d1fec0d', 123 ]))
    console.log("Leaf is ok")
}

async function sendNewRoot(root, blockNumber) {
  console.log("Send chainId, root and blockNumber: ", cfgL2.chainId, root, blockNumber)
  CONTRACT_L1.addStateRoot(cfgL2.chainId, ethers.toBeHex(root), blockNumber)
}

async function sleep() {
  console.log("Sleep...")
  await new Promise(r => setTimeout(r, process.env.TIMEOUT_INTERVAL))
}

const main = async () => {
  client = await createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

  let condition = true

  let fromBlock = parseInt(process.env.FROM_BLOCK_NUMBER);

  while (condition) {
    const toBlock = (await PROVIDER_L2.getBlock()).number
    console.log(`BlockNumber: ${fromBlock}/${toBlock}`)

    let logs = await getLogs(fromBlock, toBlock)
    if (fromBlock >= toBlock) {
      await sleep()
      continue
    }
    if (logs.length == 0) {
      fromBlock = toBlock
      await sleep()
      continue
    }

    // logs = logs.length > 5 ? logs.slice(0, 5) : logs
    // console.log("Logs number will be processed: ", logs.length)

    await storeBalances(logs)

    const leafsData = await getTreeLeafs()
    const tree = await storeTree(fromBlock, leafsData)

    await checkTree(tree, leafsData)

    await sendNewRoot(tree.root, fromBlock)

    fromBlock = logs[logs.length-1].blockNumber + 1

    await sleep()
  }

  await client.disconnect();
};


const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();