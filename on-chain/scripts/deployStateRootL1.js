const { ethers } = require('hardhat')

async function main() {
  // impl
  const factory = await ethers.getContractFactory('StateRootL1')
  const stateRoot = await factory.deploy()
  await stateRoot.deployed()
  console.log(`StateRoot contract has been deployed on ${stateRoot.address} address`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
