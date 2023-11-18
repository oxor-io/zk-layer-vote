const Queue = require('bull');
const { ethers } = require("ethers");

const provider = new ethers.AlchemyProvider('sepolia', process.env.ALCHEMY_API_KEY);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const proofsQueue = new Queue('proofs', 'redis://127.0.0.1:6379');

proofsQueue.process(async (job, done) => {
  try {
    const data = job.data
    console.log(`Processing Job #${job.id} with data ${JSON.stringify(data)}...`);

    // const { chainId, proposalId, token, voter } = job.data.token;
    // const proof = await generateProof();
    // const result = await castVote();

    const balance = (await provider.getBalance(data.voter)).toString();
    const result = { balance: ethers.formatUnits(balance)}

    done(null, result);
  } catch (e) {
    console.error(e);
    done(new Error('Job processing error'));
  }
});

proofsQueue.on('completed', (job, result) => {
  console.log(`Job #${job.id} completed with result ${JSON.stringify(result)}`);
})

async function generateProof(chainId, proposalId, token, voter) {
  // TODO
  const root = await getL2Root(proposalId, chainId);
  const SLEEP_DELAY = 60 * 1000;
  await new Promise(resolve => setTimeout(resolve, SLEEP_DELAY));
}

async function getL2Root(proposalId, chainId) {
  // TODO: read from GovernorL1.sol state
  return null
}

async function castVote() {
  // TODO: call GovernorL1.castVoteCC
  // function castVoteCC(
  //   uint256 proposalId,
  //   address voter,
  //   uint8 support,
  //   uint256 weight,
  //   uint256 chainId,
  //   bytes calldata proof) public returns (uint256)
}

module.exports = proofsQueue;
