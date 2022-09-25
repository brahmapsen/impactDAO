import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useMoralis, useWeb3Contract } from "react-moralis"
import abi from "../constants/PayForSuccess.json"
import tokenAbi from "../constants/PayForSuccessToken.json"
import { NFT, NFTBalance, Form, Button, Checkbox, Input, useNotification } from "web3uikit"
import { ethers } from "ethers"

import networkMapping from "../constants/networkMapping.json"
import NFTBox from "../components/NFTBox"
//import GET_ACTIVE_ITEMS from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"

import basicCFCNftAbi from "../constants/BasicCFCNft.json"

const TOKEN_URI = "ipfs://bafkreiehcski5m2yp3g7pz43rjo7tyqpzdhsb6zzachvqnpv7nwhlzgahq"

export default function DepositForm() {
  const router = useRouter()
  const { chainId, isWeb3Enabled, account } = useMoralis()
  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  console.log("CHAIN ID", chainId, chainString)

  const dispatch = useNotification()

  const PFS_CONTRACT_ADDRESS = networkMapping[chainString].PayForSuccess[0]
  //console.log("PFS CONTRACT ADDRESS: ", PFS_CONTRACT_ADDRESS)

  const PFST_TOKEN_ADDRESS = networkMapping[chainString].PayForSuccessToken[0]
  //console.log("PFST TOKEN ADDRESS: ", PFST_TOKEN_ADDRESS)

  const BASIC_CFC_NFT_ADDRESS = networkMapping[chainString].BasicCFCNft[0]
  //console.log("PFST BASIC_CFC_NFT_ADDRESS ADDRESS: ", BASIC_CFC_NFT_ADDRESS)

  //const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)

  const { runContractFunction } = useWeb3Contract()
  const [contractName, setContractName] = useState("")
  const [userDepositAmt, setUserDepositAmt] = useState("0")
  const [totalTokenDeposited, setTotalTokenDeposited] = useState("0")
  const [userEthAmount, setUserEthAmount] = useState("")
  const [contractEthAmount, setContractEthAmount] = useState("")

  //view functions
  const { runContractFunction: getContractName } = useWeb3Contract({
    abi: abi,
    contractAddress: PFS_CONTRACT_ADDRESS,
    functionName: "getContractName",
    params: {},
  })

  let approveOptions = {
    abi: tokenAbi,
    contractAddress: PFST_TOKEN_ADDRESS,
    functionName: "approve",
    gasLimit: "5000000",
  }

  let depositOptions = {
    abi: abi,
    contractAddress: PFS_CONTRACT_ADDRESS,
    functionName: "depositAssets",
    gasLimit: "5000000",
  }

  let depositEthOptions = {
    abi: abi,
    contractAddress: PFS_CONTRACT_ADDRESS,
    functionName: "depositEth",
    gasLimit: "5000000",
  }

  let nftIssuedOptions = {
    abi: abi,
    contractAddress: PFS_CONTRACT_ADDRESS,
    functionName: "issueNFT",
  }

  const { runContractFunction: mintbasicCFCNFT } = useWeb3Contract({
    abi: basicCFCNftAbi,
    contractAddress: BASIC_CFC_NFT_ADDRESS,
    functionName: "mintNft",
    params: {},
  })

  // MINTS NFT and triggers the NFTIssued event in PayForSuccess CONTRACT
  async function mintNFT() {
    console.log("\n.....................Minting NFT")
    const tokenId = await mintbasicCFCNFT({
      onError: (error) => console.log(error),
      onSuccess: (tokenId) => {
        handleSuccess(tokenId)
      },
    })
    console.log("Minted Token Id:", tokenId)

    //call NFTIssued from PFS Contract
    const nftIssue = await NFTIssued()
  }

  async function NFTIssued() {
    nftIssuedOptions.params = {
      amount: 1,
      assetAddress: PFST_TOKEN_ADDRESS,
      uri: TOKEN_URI,
    }
    const tx = await runContractFunction({
      params: nftIssuedOptions,
      onError: (error) => console.log(error),
      onSuccess: (tx) => {
        handleSuccess(tx)
      },
    })
  }

  async function handleDeposit(data) {
    const token = data.data[0].inputResult
    const amtToApprove = data.data[1].inputResult
    console.log(" Token - ", token, " amt:", amtToApprove)

    if (token === "CFC Token") {
      approveOptions.params = {
        amount: amtToApprove, //ethers.utils.parseUnits(amtToApprove, "ether").toString(),
        spender: PFS_CONTRACT_ADDRESS,
      }
      console.log(`...approving...${amtToApprove}`)
      const tx = await runContractFunction({
        params: approveOptions,
        onError: (error) => console.log(error),
        onSuccess: () => {
          handleApproveSuccess(approveOptions.params.amount)
        },
      })
    } else {
      //DEPOSIT ETH
      // depositEthOptions.params = {
      //   value: amtToApprove * 10e17,
      // }
      depositEthOptions.msgValue = amtToApprove * 10e17

      console.log(`.......ETH depositing......${depositEthOptions.msgValue}`)

      const tx = await runContractFunction({
        params: depositEthOptions,
        onError: (error) => console.log(error),
        onSuccess: (tx) => {
          handleSuccess(tx)
        },
      })
    }

    //Mint NFT
    console.log("MINTING NFT for the Donation.....................")
    const tx = await mintNFT()

    //router.reload()
  }

  async function handleApproveSuccess(amtToDeposit) {
    depositOptions.params = {
      amount: amtToDeposit,
      assetAddress: PFST_TOKEN_ADDRESS,
    }
    console.log(`.......depositing......${depositOptions.params.amount}`)

    const tx = await runContractFunction({
      params: depositOptions,
      onError: (error) => console.log(error),
      onSuccess: (tx) => {
        handleSuccess(tx)
      },
    })
  }

  //User account BALANCE for Asset passed
  const { runContractFunction: getUserAsset } = useWeb3Contract({
    abi: abi,
    contractAddress: PFS_CONTRACT_ADDRESS,
    functionName: "getUserAsset",
    params: { assetAddress: PFST_TOKEN_ADDRESS },
  })

  //Total Contract Token balance
  const { runContractFunction: getTotalTokenDeposited } = useWeb3Contract({
    abi: tokenAbi,
    contractAddress: PFST_TOKEN_ADDRESS,
    functionName: "balanceOf",
    params: { account: PFS_CONTRACT_ADDRESS },
  })

  const { runContractFunction: getUserEthAmount } = useWeb3Contract({
    abi: abi,
    contractAddress: PFS_CONTRACT_ADDRESS,
    functionName: "getUserEthAmount",
    params: {},
  })
  async function getUserEth() {
    let _amt = await getUserEthAmount()
    //_amt = ethers.utils.formatEther(_amt)
    console.log("ETH amount:", _amt)
    setUserEthAmount(_amt)
  }

  async function getContractEthAmount() {
    _amt = await ethers.provider.getBalance(PFS_CONTRACT_ADDRESS)
    setContractEthAmount(_amt)
  }

  // Probably could add some error handling
  const handleSuccess = async (tx) => {
    if (chainString != 31337) {
      await tx.wait(1)
    }
    handleNewNotification(tx)
    updateUI()
  }

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    })
  }

  const handleError = async (tx) => {
    //await tx.wait(1)
    //updateUIValues()
    //handleNewNotification(tx)
    console.log("THE ERROR occured ")
  }

  async function updateUI() {
    console.log("UPDATE UI..................")
    const _userBal = await getUserAsset()
    if (typeof _userBal !== "undefined") {
      setUserDepositAmt(_userBal.toString())
    }

    // const _totalTokenBal = await getTotalTokenDeposited()
    // setTotalTokenDeposited(_totalTokenBal.toString())

    getUserEth()
  }

  useEffect(() => {
    updateUI()
  }, [isWeb3Enabled])

  return (
    <div>
      <div className="p-5">
        <Input
          label="CFC Token funded by User:"
          name="contract-total-cfc"
          value={userDepositAmt}
        />
      </div>
      <br />
      <div>
        <Input label="ETH funded by User:" name="contract-total-cfc" value={userEthAmount} />
      </div>
      <br />
      <Form
        onSubmit={handleDeposit}
        data={[
          {
            name: "Asset Type",
            selectOptions: [
              {
                id: "PFST",
                label: "CFC Token",
              },
              {
                id: "eth",
                label: "Native Ethereum",
              },
              {
                id: "DAI",
                label: "DAI Token",
              },
            ],
            type: "select",
            value: "Native Ethereumn",
          },
          {
            inputWidth: "50%",
            name: "Amount to deposit ",
            type: "number",
            value: ".001",
            key: "amountToStake",
          },
        ]}
        title="Donate!!!"
        id="depositForm"
      ></Form>
    </div>
  )
}
