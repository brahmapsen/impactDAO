const { deployments, getNamedAccounts, network, ethers } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  console.log("deploying to chainId", chainId, "by", deployer)

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS

  const args = [deployer] //Make deployer address the admin address for the contract

  const pay4Success = await deploy("PayForSuccess", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
    gasPrice: 50000000000,
  })

  // if (chainId != 31337) {
  //   log("Verifying....")
  //   await verify(pay4Success.address, args)
  // }
}

module.exports.tags = ["all", "pfs"]
