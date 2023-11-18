const { ethers } = require('hardhat')

async function main() {
  // impl
  const factory = await ethers.getContractFactory('GovernorL1')
  const gov = await factory.deploy(
    '0x4d389dA3786036ee0b9aba8E4B99891a925d88D0',
    '0x4d389dA3786036ee0b9aba8E4B99891a925d88D0',
    '0x4d389dA3786036ee0b9aba8E4B99891a925d88D0',
    '0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5'
  )
  await gov.deployed()
  console.log(`GovernorL1 contract has been deployed on ${gov.address} address`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
