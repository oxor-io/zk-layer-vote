const ethers = require("ethers");
const {
  generateTree,
  proofElementInTree,
  indexOfTree,
  selializeTree,
  deselializeTree,
} = require("./generateMerkleTree");
const { createClient } = require('redis');
const ABI_ERC20 = require("./abi/Erc20.json");
const chainCfg = require("./chains.js");
const { abi: ABI_STATE_ROOT_L1 } = require("./abi/StateRootL1.json");
const { default: MerkleTree } = require("fixed-merkle-tree");
require("dotenv").config();

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

const CONTRACT_L2 = new ethers.Contract(
  cfgL2.tokenL2,
  ABI_ERC20,
  PROVIDER_L2
)

// Redis client
let client


async function getLogs(fromBlock, toBlock, tokenAddress) {
  const logs = await PROVIDER_L2.getLogs(
    {
      "fromBlock": fromBlock,
      "toBlock": toBlock,
      "address": tokenAddress,
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


async function storeBalances(chainId, logs) {
  const storedBalances = await client.hGetAll(`chainId-${chainId}-balances`);

  for (let i=0; i<logs.length; i++) {
    const address = '0x' + logs[i].topics[2].slice(26)
    const balance = await getAddressBalance(address)

    if (address in storedBalances && storedBalances[address] == balance.toString()) {
      continue
    }

    console.log("New Address&Balance: ", address, balance)
    await client.hSet(`chainId-${chainId}-balances`, address, balance.toString())
  }
}

async function fetchBalances(chainId) {
  return await client.hGetAll(`chainId-${chainId}-balances`);
}

async function getTreeLeafs(storedBalances) {
  let leafsData = []
  for (const address in storedBalances) {
    const balance = storedBalances[address]
    leafsData.push([address, balance])
    console.log(`Leafs Address&Balance: ${address}: ${balance}`);
  }
  console.log("Leafs count: ", leafsData.length)
  return leafsData
}

async function storeTree(tree, chainId, blockNumber) {
  const treeStr = await selializeTree(tree)

  await client.hSet(`chainId-${chainId}-trees`, blockNumber.toString(), treeStr)
  console.log("Tree root: ", tree.root)
}

async function fetchTree(chainId, blockNumber) {
  const treeStr = await client.hGet(`chainId-${chainId}-trees`, blockNumber.toString())
  return deselializeTree(treeStr)
}

async function checkTree(tree, leafsData) {
    console.log("Check leaf: ", leafsData[0])
    await proofElementInTree(tree, leafsData[0])
    // console.log("Proof2: ", await proofElementInTree(tree, ['0x22f6cc8738308a8c92a6a71ea67832463d1fec0d', 71983490000 ]))
    // console.log("Proof wrong: ", await proofElementInTree(tree, ['0x22f6cc8738308a8c92a6a71ea67832463d1fec0d', 123 ]))
    console.log("Leaf is ok")
}

async function sendNewRoot(chainId, root, blockNumber) {
  console.log("Send chainId, root and blockNumber: ", chainId, root, blockNumber)
  CONTRACT_L1.addStateRoot(chainId, ethers.toBeHex(root), blockNumber)
}

async function sleep() {
  console.log("Sleep...")
  await new Promise(r => setTimeout(r, process.env.TIMEOUT_INTERVAL))
}

async function getPath(chainId, address) {
  const storedBalances = await fetchBalances(chainId)
  const leafsData = await getTreeLeafs(storedBalances)
  const tree = await generateTree(process.env.TREE_HEIGHT, leafsData)
  console.log(`Address: ${address} Balance: ${storedBalances[address]}`)
  const index = await indexOfTree(tree, [address, storedBalances[address]])
  console.log(`Index: ${index}`)
  const path = await tree.path(index)
  console.log('Path:', path)
  return path
}

const main = async () => {
  client = await createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

  let fromBlock = cfgL2.fromBlock;

  let condition = true
  while (condition) {
    const toBlock = (await PROVIDER_L2.getBlock()).number
    console.log(`BlockNumber: ${fromBlock}/${toBlock}`)

    let logs = await getLogs(fromBlock, toBlock, cfgL2.tokenL2)
    if (fromBlock >= toBlock) {
      await sleep()
      continue
    }
    if (logs.length == 0) {
      fromBlock = toBlock
      await sleep()
      continue
    }

    await storeBalances(cfgL2.chainId, logs)
    const storedBalances = await fetchBalances(cfgL2.chainId)
    const leafsData = await getTreeLeafs(storedBalances)
    const tree = await generateTree(process.env.TREE_HEIGHT, leafsData)
    await storeTree(tree, cfgL2.chainId, fromBlock)

    await checkTree(tree, leafsData)

    await sendNewRoot(cfgL2.chainId, tree.root, fromBlock)

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