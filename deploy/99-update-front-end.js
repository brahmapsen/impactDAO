const { ethers, network } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")

require("dotenv").config()
const fs = require("fs")

const frontEndContractsFile = "./app/constants/networkMapping.json"
const frontEndAbiLocation = "./app/constants/"

const waitBlockConfirmations = developmentChains.includes(network.name)
  ? 1
  : VERIFICATION_BLOCK_CONFIRMATIONS

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("updating front-end...")
    await updateContractAddresses()
    await updateAbi()
  }
}

async function updateAbi() {
  const payForSuccess = await ethers.getContract("PayForSuccess")
  fs.writeFileSync(
    `${frontEndAbiLocation}PayForSuccess.json`,
    payForSuccess.interface.format(ethers.utils.FormatTypes.json)
  )

  const payForSuccessToken = await ethers.getContract("PayForSuccessToken")
  fs.writeFileSync(
    `${frontEndAbiLocation}PayForSuccessToken.json`,
    payForSuccessToken.interface.format(ethers.utils.FormatTypes.json)
  )

  const basicCFCNft = await ethers.getContract("BasicCFCNft")
  fs.writeFileSync(
    `${frontEndAbiLocation}BasicCFCNft.json`,
    basicCFCNft.interface.format(ethers.utils.FormatTypes.json)
  )

  //
}

async function updateContractAddresses() {
  let chainId = 31337
  if (network.name != "localhost") {
    chainId = network.config.chainId.toString()
    console.log("Chain ID:", chainId)
  }
  const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
  if (typeof contractAddresses == "undefined") {
    console.log("EmPTY file")
  }

  const payForSuccess = await ethers.getContract("PayForSuccess")
  const payForSuccessToken = await ethers.getContract("PayForSuccessToken")
  const basicCFCNft = await ethers.getContract("BasicCFCNft")

  contractAddresses[chainId] = {
    PayForSuccess: [payForSuccess.address],
    PayForSuccessToken: [payForSuccessToken.address],
    BasicCFCNft: [basicCFCNft.address],
  }

  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}

module.exports.tags = ("all", "frontend")
