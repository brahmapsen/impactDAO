import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useMoralis, useWeb3Contract } from "react-moralis"
import abi from "../constants/PayForSuccess.json"
import tokenAbi from "../constants/PayForSuccessToken.json"
import { NFT, NFTBalance, Form, Button, Checkbox, Input, useNotification } from "web3uikit"
import { ethers } from "ethers"
import networkMap from "../constants/networkMap.json"
import axios from "axios"

import NFTBox from "../components/NFTBox"

import { useQuery } from "@apollo/client"

export default function showNFT() {
  const router = useRouter()
  const [listedNfts, setListedNfts] = useState("")
  const [nftTokenId, setNftTokenId] = useState("")
  const [nftDetail, setNftDetail] = useState("")
  const { chainId, isWeb3Enabled, account } = useMoralis()
  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  //console.log("CHAIN ID:", chainId, "Chain String:", chainString)
  const nftContractAddress = networkMap[4].CNFT[0]
  let chainName = ""
  chainString == "4" ? (chainName = "rinkeby") : (chainName = "mumbai")
  console.log("ChainName:", chainName, "nftcontractAddress:", nftContractAddress)

  //const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)

  async function getNFTData() {
    await axios
      .get("/api/getNFTData", {
        params: {
          chain: chainName,
          contract_address: nftContractAddress,
        },
      })
      .then((response) => {
        console.log("Response.data:", response.data)
        const _data = response.data
        if (_data.response == "OK") {
          console.log("MATCH:")
          setListedNfts(_data.nfts)
          _data.nfts.map((row) => {
            console.log(row.token_id)
            setNftTokenId(row.token_id)
          })
        }
      })

    //console.log("Listed NFTs", listedNfts)
  }

  async function getNFTDetails(data) {
    const token_id = data.data[0].inputResult
    console.log("getNFTDetails:", token_id)
    await axios
      .get("/api/getNFTDetails", {
        params: {
          chain: chainName,
          contract_address: nftContractAddress,
          token_id,
        },
      })
      .then((response) => {
        console.log("Detail data:", response.data)
        const _data = response.data
        if (_data.response == "OK") {
          console.log("Detail ONE MATCH: ", _data.nft.cached_file_url)
          setNftDetail(_data.nft.cached_file_url)
        }
      })

    console.log("DETAIL NFTs", listedNfts)
  }

  useEffect(() => {
    getNFTData()
    console.log("NFTTokenId---------", nftTokenId)
  }, [isWeb3Enabled])

  return (
    <div>
      <div className="container mx-auto">
        <div className="flex flex-wrap">
          <Form
            onSubmit={getNFTDetails}
            data={[
              {
                inputWidth: "50%",
                name: "NFT Token ID ",
                type: "number",
                value: nftTokenId,
                key: "token_id",
              },
            ]}
            title="show NFT details!"
            id="nft-details"
          ></Form>
        </div>
        <div>
          NFT details
          <img src={nftDetail} alt={listedNfts.token_id} />
        </div>
      </div>
    </div>
  )
}
