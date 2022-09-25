import React, { useState } from "react"
import axios from "axios"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { Form } from "web3uikit"
import networkMap from "../constants/networkMap.json"
import { ethers } from "ethers"

const CallAPI = function () {
  const [cid, setCid] = useState("")
  const { chainId, isWeb3Enabled, account } = useMoralis()
  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  const nftContractAddress = networkMap[4].CNFT[0]
  let chainName = ""
  chainString == "4" ? (chainName = "rinkeby") : (chainName = "mumbai")
  console.log(
    "ChainName:",
    chainName,
    "nftcontractAddress:",
    nftContractAddress,
    "account",
    account
  )

  async function createNFT(data) {
    const _name = data.data[0].inputResult
    const _description = data.data[1].inputResult

    //path to image in local directory
    const _filePath = data.data[2].inputResult

    const donation_level = data.data[3].inputResult
    const cure_category = data.data[4].inputResult
    console.log(`args ${_name} ${_description}  ${_filePath} ${donation_level} ${cure_category}`)

    const custom_fields = {
      donation_level,
      cure_category,
    }

    const imageParams = {
      filePath: _filePath,
    }

    //upload image using NFTPort
    const image_url = await uploadImageNftPort(imageParams)
    console.log("NFTPort image_url:", image_url)

    const params = {
      name: _name,
      description: _description,
      file_url: image_url,
      custom_fields: custom_fields,
    }

    const metadata_uri = await uploadMetadataNftPort(params)
    console.log("NFTPort metadata_uri:", metadata_uri)

    //chain, contract_address, metadata_uri, mint_to_address
    const nftParams = {
      chain: chainName,
      contract_address: nftContractAddress,
      metadata_uri: metadata_uri,
      mint_to_address: account,
    }

    // call createNFT using NFTPort
    const txHash = await createNFTPort(nftParams)
    console.log(`TaxHash ${txHash}`)
  }

  async function createNFTPort(params) {
    console.log("Create NFT using NftPort........")
    let _txHash = ""
    await axios
      .post("/api/createNFTNP", {
        params,
      })
      .then((res) => {
        console.log("Res", res)
        _txHash = res.data.transaction_hash
        console.log("returned txHash: ", _txHash)
      })
      .catch((err) => console.log("error occured", err))
    return _txHash
  }

  async function uploadMetadataNftPort(params) {
    console.log("UploadMetadataNftPort........")
    let _cid = ""
    await axios
      .post("/api/uploadMetadataNP", {
        params,
      })
      .then((res) => {
        console.log("Res", res)
        _cid = res.data.metadata_uri
        console.log("returned cid: ", _cid)
      })
      .catch((err) => console.log("error occured", err))
    return _cid
  }

  async function uploadImageNftPort(params) {
    console.log("UploadImageNftPort........")
    let _cid = ""
    await axios
      .post("/api/uploadImageNP", {
        params,
      })
      .then((res) => {
        console.log("Res", res)
        _cid = res.data.ipfs_url
        console.log("returned cid: ", _cid)
      })
      .catch((err) => console.log("error occured", err))
    return _cid
  }

  return (
    <div>
      <Form
        onSubmit={createNFT}
        data={[
          {
            inputWidth: "25%",
            name: "Name",
            type: "text",
            value: "John Reed",
            key: "name",
          },
          {
            inputWidth: "50%",
            name: "Description",
            type: "text",
            value: "Medical Impact DAO NFT",
            key: "description",
          },
          {
            inputWidth: "25%",
            name: "ImageFile",
            type: "text",
            value: "images/med-impact.jpg",
            key: "imageFile",
          },
          {
            inputWidth: "25%",
            name: "DonationLevel",
            type: "text",
            value: "CFC",
            key: "donation_level",
          },
          {
            inputWidth: "25%",
            name: "CureCategory",
            type: "text",
            value: "Ketamine to treat depression",
            key: "cure_category",
          },
        ]}
        title="Create Health data NFT"
        id="createHealthDataNFT"
      ></Form>
    </div>
  )
}
export default CallAPI
