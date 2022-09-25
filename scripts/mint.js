const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

async function mint() {
  const basicNft = await ethers.getContract("BasicCFCNft")
  const payForSuccessToken = await ethers.getContract("PayForSuccessToken")

  const signer = (await ethers.getSigners())[0]
  const donatedAmount = ethers.utils.parseEther("1")
  const donatedAsset = payForSuccessToken.address
  const tokenURI = "ipfs://QmWHv6GtxS1HXqKbyFVQQ11ukAsJoQt893yZ5ngEAvCQqN"

  console.log("Minting Basic CFC NFT...")
  const mintTx = await basicNft.mintNft(signer.address, donatedAmount, donatedAsset, tokenURI, {
    gasLimit: 3e6,
  })
  const mintTxReceipt = await mintTx.wait(1)
  console.log(
    `Minted tokenId ${mintTxReceipt.events[0].args.tokenId.toString()} from contract: ${
      basicNft.address
    }`
  )
  if (network.config.chainId == 31337) {
    // Moralis has a hard time if you move more than 1 block!
    await moveBlocks(2, (sleepAmount = 1000))
  }
}

mint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
