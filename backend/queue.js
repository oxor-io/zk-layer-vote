const Queue = require('bull');
const { ethers } = require("ethers");
const GovernorL1Meta = require('../on-chain/artifacts/contracts/GovernorL1.sol/GovernorL1.json')

const providerL1 = new ethers.AlchemyProvider('sepolia', process.env.ALCHEMY_API_KEY);
const signerL1 = new ethers.Wallet(process.env.PRIVATE_KEY, providerL1);

const proofsQueue = new Queue('proofs', 'redis://127.0.0.1:6379');

proofsQueue.process(async (job, done) => {
  try {
    const data = job.data
    console.log(`Processing Job #${job.id} with data ${JSON.stringify(data)}...`);

    const { chainId, proposalId, stateRoot, block, token, voter, support, weight } = job.data;
    const proof = await generateProof(chainId, proposalId, stateRoot, block, token, voter, support);
    const voteTx = await castVote(chainId, proposalId, voter, support, weight, proof);
    const result = {
      proof: proof,
      tx: voteTx.hash,
    }

    // const balance = (await providerL1.getBalance(data.voter)).toString();
    // const result = { balance: ethers.formatUnits(balance)}

    done(null, result);
  } catch (e) {
    console.error(e);
    done(new Error('Job processing error'));
  }
});

proofsQueue.on('completed', (job, result) => {
  console.log(`Job #${job.id} completed with result ${JSON.stringify(result)}`);
})

async function generateProof(chainId, proposalId, stateRoot, block, token, voter, support) {
  // TODO
  const SLEEP_DELAY = 60 * 1000;
  await new Promise(resolve => setTimeout(resolve, SLEEP_DELAY));
  const genRanProof = words => '0x' + [...Array(words * 32 * 2)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return genRanProof(20)
}

async function castVote(chainId, proposalId, voter, support, weight, proof) {
  const GovernorL1 = new ethers.Contract('0x491A7D1A203980Fd5d2cdE093893FcdCf994291e', GovernorL1Meta.abi, signerL1);
  const tx = await GovernorL1.castVoteCC(proposalId, voter, support, weight, chainId, proof)
  await tx.wait();
  return tx
}

module.exports = proofsQueue;
