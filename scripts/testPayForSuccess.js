const { ethers, network } = require("hardhat")
const { getContractABI, getTokenABI, getContractAddress } = require("./helpers")

async function main() {
  //const weiValue = 1000000000000000;
  //console.log('Ether:', ethers.utils.formatEther(weiValue))
  const ethValue = 0.001
  const _weiValue = ethValue * 10e17
  console.log("_weiValue:", _weiValue)

  const signer = (await ethers.getSigners())[0]
  console.log("Signer:", signer.address, signer.provider.connection)
  console.log("network:", network.name)

  //Get ABIs
  const ethAddress = "0x0000000000000000000000000000000000000000"
  const erc20ABI = getTokenABI("IERC20.sol/IERC20.json")
  const contractABI = getContractABI("PayForSuccess.sol/PayForSuccess.json")
  const CONTRACT_ADDRESS = getContractAddress(network.name, "PayForSuccess.json") //for Local hardhat Node
  const PFST_TOKEN_ADDRESS = getContractAddress(network.name, "PayForSuccessToken.json")
  console.log("Contract Address:", CONTRACT_ADDRESS, " Token Addr:", PFST_TOKEN_ADDRESS)

  const pfsContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer)
  console.log("Contract Name: " + (await pfsContract.getContractName()))

  //GET user balance for a particular denomination
  const userPFSTBalance = await pfsContract.getUserAsset(PFST_TOKEN_ADDRESS)
  console.log("User PFST balance", userPFSTBalance.toString())

  //Contract PFST balance
  const pfstTokenContract = new ethers.Contract(PFST_TOKEN_ADDRESS, erc20ABI, signer)
  const pfstBalance = await pfstTokenContract.balanceOf(CONTRACT_ADDRESS)
  console.log("Contract PFS Token Balance", pfstBalance.toString())

  console.log(
    "User ETH Balance: " + ethers.utils.formatEther(await pfsContract.getUserEthAmount())
  )

  //Approve and deposit PFST token to contract
  console.log("Approve and deposit Asset")
  await pfstTokenContract.approve(CONTRACT_ADDRESS, 1, { gasLimit: 3e6 })
  const txDepo = await pfsContract.depositAssets(1, PFST_TOKEN_ADDRESS, { gasLimit: 3e6 })
  const txDepoReceipt = await txDepo.wait(1)

  //Display Wallet balance
  console.log("Display Signer (", signer.address, ") balance ")
  const walletETHBalance = await ethers.provider.getBalance(signer.address)
  console.log("Wallet ETH Balance :", ethers.utils.formatEther(walletETHBalance))

  console.log("ETH Balance of the CONTRACT")
  const contractETHBalance = await ethers.provider.getBalance(CONTRACT_ADDRESS)
  console.log("contract ETH Balance :", ethers.utils.formatEther(contractETHBalance))

  //Deposit 0.001 ETH and Contract ETH balance
  console.log("Deposit .001 ETH")
  const tx = await pfsContract.depositEth({ value: _weiValue })
  const txReceipt = await tx.wait(1)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
