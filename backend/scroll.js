const { ethers } = require("ethers");

const PROVIDER_URL =
  "https://billowing-attentive-patron.scroll-testnet.quiknode.pro/2bee32553deff2ae936e6f3987ca7774a49da8e8/";
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

async function fetchL2Proof(token, voter, block) {
  function getERC20AccountBalanceMappingStorageIndex(address) {
    const ERC20_BALANCES_MAPPING_SLOT_INDEX = 0;
    const coder = ethers.AbiCoder.defaultAbiCoder();

    // keccak256(abi.encode(KEY, SLOT_INDEX_DECLARATION))
    return ethers.keccak256(
      coder.encode(
        ["address", "uint256"],
        [address, ERC20_BALANCES_MAPPING_SLOT_INDEX]
      )
    );
  }

  const hexBlock = `0x${block.toString(16)}`;
  const storageKeys = [getERC20AccountBalanceMappingStorageIndex(voter)];
  const result = await provider.send("eth_getProof", [
    token,
    storageKeys,
    hexBlock,
  ]);
  return result;
}

async function generateScrollProof(block, token, voter) {
  const rpcResponse = await fetchL2Proof(token, voter, block);

  return {
    account: rpcResponse.address,
    storageKey: rpcResponse.storageProof[0].key,

    proof: ethers.concat([
      `0x${rpcResponse.accountProof.length.toString(16).padStart(2, "0")}`,
      ...rpcResponse.accountProof,
      `0x${rpcResponse.storageProof[0].proof.length
        .toString(16)
        .padStart(2, "0")}`,
      ...rpcResponse.storageProof[0].proof,
    ]),
  };
}
module.exports = { generateScrollProof };

// TODO
// const { buildPoseidon } = require("circomlibjs");
// /// @param {BigInt} v u256 to be hashed
// async function hashU256Poseidon(v) {
//   const poseidon = await buildPoseidon();
//   const valHi = v >> 128n;
//   const valLo = v & 0xffffffffffffffffffffffffffffffffn;

//   const hash = poseidon([valHi, valLo]);
//   return poseidon.F.toObject(hash);
// }
