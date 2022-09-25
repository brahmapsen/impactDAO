const fetch = require('node-fetch');

if (process.env.NFTPORT_KEY === undefined) {
  console.log('Please define NFTPORT_KEY as environment variable');
}
const NFTPORT_KEY = process.env.NFTPORT_KEY;

//Creates NFT using NFTPort
module.exports = async (req, res) => {
  console.log('call NFTPort getNFTData');
  //const { params } = req.query;
  const { chain, contract_address } = req.query;
  console.log(` Input:  ${chain} ${contract_address}`);

  const options = {
    method: 'GET',
    headers: {
      Authorization: NFTPORT_KEY,
      'Content-Type': 'application/json',
    },
  };

  fetch(
    `https://api.nftport.xyz/v0/nfts/${contract_address}?chain=${chain}`,
    options
  )
    .then((response) => {
      return response.json();
    })
    .then((responseJson) => {
      console.log('createNFT POST response:', responseJson);
      res.status(200).json(responseJson);
    })
    .catch((err) => {
      console.log('getNFTData error:', err);
    });
};
