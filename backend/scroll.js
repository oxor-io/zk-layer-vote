const { ethers } = require("ethers");
const { buildPoseidon } = require("circomlibjs");

const TOKEN = '0xC007267DF5f0f7aEc5fb90CF03b56F051Bc6C89e'
// const DelegateL2 = '0x4d389dA3786036ee0b9aba8E4B99891a925d88D0'

// const TokenL2Artifact = require('../on-chain/artifacts/contracts/TokenL2.sol/TokenL2.json')

const PROVIDER_URL = 'https://billowing-attentive-patron.scroll-testnet.quiknode.pro/2bee32553deff2ae936e6f3987ca7774a49da8e8/'
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function generateScrollProof(chainId, proposalId, stateRoot, token, voter) {
    const block = await provider.send('eth_blockNumber');
    const res = await fetchL2Proof(token, voter, block);
}

async function fetchL2Proof(token, voter, block) {
    function getERC20AccountBalanceMappingStorageIndex(address) {
        // keccak256(abi.encode(KEY, SLOT_INDEX_DECLARATION))
        const ERC20_BALANCES_MAPPING_SLOT_INDEX = 0;
        const coder = new ethers.AbiCoder()
        return ethers.keccak256(coder.encode([ "address", "uint256" ], [address, ERC20_BALANCES_MAPPING_SLOT_INDEX]));
    }

    const hexBlock = `0x${block.toString(16)}`
    const storageKeys = [getERC20AccountBalanceMappingStorageIndex(voter)];
    const result = await provider.send('eth_getProof', [token, storageKeys, block]);
    return result
}

/// @param {BigInt} v u256 to be hashed
async function hashU256Poseidon(v) {
  const poseidon = await buildPoseidon();
  const valHi = v >> 128n;
  const valLo = v & 0xffffffffffffffffffffffffffffffffn;

  const hash = poseidon([valHi, valLo]);
  return poseidon.F.toObject(hash);
}


module.exports = { generateScrollProof };