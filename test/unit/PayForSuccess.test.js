const { messagePrefix } = require("@ethersproject/hash")
const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

describe("PayForSuccess", function () {
  let payForSuccess, user, cfcToken
  const sendValue = ethers.utils.parseEther("0.001")
  const zeroAddress = "0x0000000000000000000000000000000000000000"

  beforeEach(async function () {
    const { deployer } = await getNamedAccounts()
    user = deployer
    payForSuccessFactory = await ethers.getContractFactory("PayForSuccess")
    payForSuccess = await payForSuccessFactory.deploy(deployer)

    let cfcTokenFactory = await ethers.getContractFactory("PayForSuccessToken")
    cfcToken = await cfcTokenFactory.deploy()
  })

  it("should display name", async () => {
    const contractName = await payForSuccess.getContractName()
    const expectedValue = "Pay4Success"
    assert.equal(contractName, expectedValue)
  })

  it("test desposit eth value", async () => {
    await payForSuccess.depositEth({ value: sendValue })
    const resp = await payForSuccess.provider.getBalance(payForSuccess.address)
    console.log("PayForSuccess Contract ETH Balance:", resp.toString())

    const userAmt = await payForSuccess.UserEthInfo(user)
    console.log("User Amt:", userAmt.toString())
    assert.equal(userAmt, "1000000000000000")
  })

  it("test deposit ERC20 token", async () => {
    await cfcToken.approve(payForSuccess.address, "1000000000000000000", { gasLimit: 3e6 })
    await payForSuccess.depositAssets("1000000000000000000", cfcToken.address)
    const resp = await payForSuccess.getUserAsset(cfcToken.address)
    console.log("resp:", resp.toString())
    assert.equal(resp, "1000000000000000000")
  })
})
