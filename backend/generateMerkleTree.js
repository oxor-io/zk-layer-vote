const { MerkleTree } = require("fixed-merkle-tree");
const { buildPoseidon } = require("circomlibjs");

async function generateTree(levels, leafData) {
  const poseidon = await buildPoseidon();

  function hashFn(l, r) {
    // const res = poseidon([l, r], 1, 1); // elements, key, number of outputs
    const res = poseidon([l, r], 1, 1); // elements, key, number of outputs
    return poseidon.F.toObject(res);
  }

  const leaves = leafData.map((val) => {
    // const res = poseidon(val, 1, 1);
    const res = poseidon(val, 1, 1);
    return poseidon.F.toObject(res);
  });

  const tree = new MerkleTree(levels, leaves, { hashFunction: hashFn });

  return tree;
}

async function proofElementInTree(tree, val) {
  const poseidon = await buildPoseidon();
  const res = poseidon(val, 1, 1);
  return tree.proof(poseidon.F.toObject(res))
}

async function selializeTree(tree) {
  return JSON.stringify(tree.serialize(), (key, value) =>
    typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
  )
}

async function deselializeTree(treeStr) {
  return MerkleTree.deserialize(JSON.parse(treeStr))
}

module.exports = {
  generateTree,
  proofElementInTree,
  selializeTree,
  deselializeTree,
};