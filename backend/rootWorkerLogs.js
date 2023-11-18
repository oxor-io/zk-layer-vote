const ethers = require("ethers");
const { generateTree, proofElementInTree, selializeTree } = require("./generateMerkleTree");
const { createClient } = require('redis');
const ABI_ERC20 = require("./abi/Erc20.json");
const ABI_STATE_ROOT_L1 = require("./abi/StateRootL1.json");
const { default: MerkleTree } = require("fixed-merkle-tree");
require("dotenv").config();

// XDC Network == 50
// XDC Apothem Network == 51
const CHAIN_ID = 51

const TIMEOUT_INTERVAL = 10000
const FROM_BLOCK_NUMBER = 57005948 // XDC (18597627 for mainnet)
const TREE_HEIGHT = 20

// providers
const PROVIDER_L1 = new ethers.JsonRpcProvider(
  // `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
  `https://ethereum-sepolia.publicnode.com`
)
const PROVIDER_L2 = new ethers.JsonRpcProvider(
  // `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
  `https://erpc.apothem.network`
)

const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7" // mainnet USDT Contract
const FXD_ADDRESS = "0xDf29cB40Cb92a1b8E8337F542E3846E185DefF96" // XDC FXD Contract
// const STATE_ROOT_ADDRESS = "0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5"
// const CONTRACT_L1 = new ethers.Contract(STATE_ROOT_ADDRESS, ABI_STATE_ROOT_L1, PROVIDER_L1)

const ERC20_L2 = FXD_ADDRESS
const CONTRACT_L2 = new ethers.Contract(ERC20_L2, ABI_ERC20, PROVIDER_L2)

// Redis client
let client


async function getLogs(fromBlock) {
  // https://docs.alchemy.com/docs/deep-dive-into-eth_getlogs#what-are-event-signatures
  const logs = await PROVIDER_L2.getLogs(
    {
      "fromBlock": fromBlock,
      "toBlock": "latest",
      "address": ERC20_L2,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
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
  for (let i=0; i<logs.length; i++) {
    const address = '0x' + logs[i].topics[2].slice(26)

    // @todo pass already added addresses
    // if (address in db) continue

    const balance = await getAddressBalance(address)
    console.log("New Address&Balance: ", address, balance)
    await client.hSet(`chainId-${CHAIN_ID}-balances`, address, balance.toString())
  }
}

async function getTreeLeafs() {
  const storedBalances = await client.hGetAll(`chainId-${CHAIN_ID}-balances`);

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
  const tree = await generateTree(TREE_HEIGHT, leafsData)
  const treeStr = await selializeTree(tree)

  await client.hSet(`chainId-${CHAIN_ID}-trees`, blockNumber.toString(), treeStr);
  console.log("Tree root: ", tree.root)
  return tree
}

async function checkTree(tree, leafsData) {
    console.log("Check leaf: ", leafsData[1])
    await proofElementInTree(tree, leafsData[1])
    // console.log("Proof2: ", await proofElementInTree(tree, ['0x22f6cc8738308a8c92a6a71ea67832463d1fec0d', 71983490000 ]))
    // console.log("Proof wrong: ", await proofElementInTree(tree, ['0x22f6cc8738308a8c92a6a71ea67832463d1fec0d', 123 ]))
    console.log("Leaf is proved")
}

async function sendNewRoot(root, blockNumber) {
  console.log("[TODO] Send root and blockNumber: ", root, blockNumber)
  CONTRACT_L1.addStateRoot(CHAIN_ID, root, blockNumber)
}

async function sleep() {
  await new Promise(r => setTimeout(r, TIMEOUT_INTERVAL))
}

const main = async () => {
  client = await createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

  let condition = true

  let fromBlock = FROM_BLOCK_NUMBER;

  while (condition) {
    let logs = await getLogs(fromBlock)

    // @todo process all logs
    logs = logs.length > 5 ? logs.slice(0, 5) : logs
    console.log("Logs number will be processed: ", logs.length)

    await storeBalances(logs)

    const leafsData = await getTreeLeafs()
    const tree = await storeTree(fromBlock, leafsData)

    await checkTree(tree, leafsData)

    await sendNewRoot(tree.root, fromBlock)
    fromBlock = logs[logs.length-1].blockNumber + 1

    await sleep()

    // @todo unlimit loop
    condition = false
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