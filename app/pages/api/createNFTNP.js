const fetch = require('node-fetch');

if (process.env.NFTPORT_KEY === undefined) {
  console.log('Please define NFTPORT_KEY as environment variable');
}
const NFTPORT_KEY = process.env.NFTPORT_KEY;

//Creates NFT using NFTPort
module.exports = async (req, res) => {
  console.log('call NFTPort createNFT---');
  const { params } = req.body;
  const { chain, contract_address, metadata_uri, mint_to_address } = params; //req.query;
  console.log(
    ` File:  ${chain} ${contract_address} ${metadata_uri} ${mint_to_address}`
  );

  const options = {
    method: 'POST',
    body: JSON.stringify({
      chain,
      contract_address,
      metadata_uri,
      mint_to_address,
    }),
    headers: {
      Authorization: NFTPORT_KEY,
    },
  };

  fetch('https://api.nftport.xyz/v0/mints/customizable', options)
    .then((response) => {
      return response.json();
    })
    .then((responseJson) => {
      console.log('createNFT POST response:', responseJson);
      res.status(200).json(responseJson);
    });
};
