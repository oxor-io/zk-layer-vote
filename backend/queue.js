const Queue = require('bull');
const { ethers } = require("ethers");

const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const { generateScrollProof } = require('./scroll')
const GovernorL1Meta = require('../on-chain/artifacts/contracts/GovernorL1.sol/GovernorL1.json')

const providerL1 = new ethers.AlchemyProvider('sepolia', process.env.ALCHEMY_API_KEY);
const signerL1 = new ethers.Wallet(process.env.PRIVATE_KEY, providerL1);

const proofsQueue = new Queue('proofs', 'redis://127.0.0.1:6379');

proofsQueue.process(async (job, done) => {
  try {
    const data = job.data
    console.log(`Processing Job #${job.id} with data ${JSON.stringify(data)}...`);

    const { chainId, proposalId, stateRoot, block, token, voter, support, weight } = job.data;
    const proof = await generateProof(chainId, stateRoot, block, token, voter);
    const voteTx = await castVote(chainId, proposalId, voter, support, weight, proof);
    const result = {
      proof: proof,
      tx: voteTx.hash,
    }

    done(null, result);
  } catch (e) {
    console.error(e);
    done(new Error('Job processing error'));
  }
});

proofsQueue.on('completed', (job, result) => {
  console.log(`Job #${job.id} completed with result ${JSON.stringify(result)}`);
})

async function generateProof(chainId, stateRoot, block, token, voter) {
  // use sunodo to generate proof
  await generateCartesiProof(chainId, stateRoot, block, token, voter)

  if (chainId == 534351) {
    // Scroll Sepolia
    const res = await generateScrollProof(Number(block), token, voter);
    return res.proof
  }

  // run nargo
  const proof = await generateNoirProof(stateRoot, block, token, voter)
  return proof

  // const SLEEP_DELAY = 60 * 1000;
  // await new Promise(resolve => setTimeout(resolve, SLEEP_DELAY));
  // const genRanProof = words => '0x' + [...Array(words * 32 * 2)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  // return genRanProof(20)
}

async function generateNoirProof(stateRoot, block, token, voter) {
  const cwd = '../aztec/circuits'
  await exec('nargo prove', {cwd: cwd})
  const proof = fs.readFileSync(`${cwd}/proofs/recursion.proof`, 'utf-8')
  return `0x${proof}`
}

async function generateCartesiProof(chainId, stateRoot, block, token, voter) {
  const cwd = '../sunodo'
  const payload = {
    stateRoot,
    block,
    token,
    voter,
  }
  const args = [
    '--mnemonic-index=0',
    `--mnemonic-passphrase='${process.env.PRIVATE_KEY}'`,
    `--chain-id=${chainId}`,
    `--input=${JSON.stringify(payload)}`,
  ]
  await exec('sunodo send generic', args, {cwd: cwd})
}

async function castVote(chainId, proposalId, voter, support, weight, proof) {
  const GovernorL1 = new ethers.Contract(process.env.GOVERNOR_L1, GovernorL1Meta.abi, signerL1);
  const tx = await GovernorL1.castVoteCC(proposalId, voter, support, weight, chainId, proof)
  await tx.wait();
  return tx
}

module.exports = proofsQueue;
