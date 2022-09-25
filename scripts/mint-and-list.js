const { ethers } = require("hardhat")

const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
  const payForSuccess = await ethers.getContract("PayForSuccess")
  const basicCFCNft = await ethers.getContract("BasicCFCNft")

  console.log("Minting....")

  const mintTx = await basicCFCNft.mintNft()
  const mintTxReceipt = await mintTx.wait(1)
  const tokenId = mintTxReceipt.events[0].args.tokenId
  console.log("Token Id", tokenId.toString())

  console.log("Approving NFT....")
  const approvalTx = await basicCFCNft.approve(payForSuccess.address, tokenId)
  await approvalTx.wait(1)

  console.log("Listing NFT........")
  const tx = await payForSuccess.listItem(basicCFCNft.address, tokenId, PRICE)
  await tx.wait(1)
  console.log("Listed")
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
