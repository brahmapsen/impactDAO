const { deployments, getNamedAccounts, network, ethers } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS

  const args = [] //No argument

  const pay4SuccessTokenContract = await deploy("PayForSuccessToken", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  })

  // if (chainId != 31337) {
  //   log("Verifying....")
  //   await verify(pay4SuccessTokenContract.address, args)
  // }
}

module.exports.tags = ["all", "pfst"]
