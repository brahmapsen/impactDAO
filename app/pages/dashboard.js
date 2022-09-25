import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useMoralis, useWeb3Contract } from "react-moralis"
import abi from "../constants/PayForSuccess.json"
import tokenAbi from "../constants/PayForSuccessToken.json"
import { Input, useNotification } from "web3uikit"
import { ethers } from "ethers"
import networkMapping from "../constants/networkMapping.json"

export default function dashboard() {
  //const router = useRouter()
  const { chainId, isWeb3Enabled, account } = useMoralis()
  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  console.log("CHAIN ID", chainId, chainString)

  const dispatch = useNotification()

  const PFS_CONTRACT_ADDRESS = networkMapping[chainString].PayForSuccess[0]
  //console.log("PFS CONTRACT ADDRESS: ", PFS_CONTRACT_ADDRESS)

  const PFST_TOKEN_ADDRESS = networkMapping[chainString].PayForSuccessToken[0]
  //console.log("PFST TOKEN ADDRESS: ", PFST_TOKEN_ADDRESS)

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
      <div className="p-3">
        <Input
          label="Total CFC Token deposited in Contract:"
          name="contract-total-cfc"
          value={totalTokenDeposited}
        />
      </div>

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
    </div>
  )
}
