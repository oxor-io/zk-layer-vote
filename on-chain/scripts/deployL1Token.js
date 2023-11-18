const { ethers } = require('hardhat')

async function main() {
  // impl
  const tokenFactory = await ethers.getContractFactory('VotesTokenL1')
  const token = await tokenFactory.deploy()
  await token.deployed()
  console.log(`L1 token contract has been deployed on ${token.address} address`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
