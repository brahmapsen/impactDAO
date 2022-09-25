const fetch = require('node-fetch');

if (process.env.NFTPORT_KEY === undefined) {
  console.log('Please define NFTPORT_KEY as environment variable');
}
const NFTPORT_KEY = process.env.NFTPORT_KEY;

//Saves Metadata to IPFS/Filecoin using NFTPort
module.exports = async (req, res) => {
  console.log('call save file to IPFS---');
  const { params } = req.body;
  const { name, description, file_url, custom_fields } = params; //req.query;
  console.log(
    ` File:  ${name} ${description} ${file_url} ${JSON.stringify(
      custom_fields
    )}`
  );

  const options = {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      file_url,
      custom_fields,
    }),
    headers: {
      Authorization: NFTPORT_KEY,
    },
  };

  fetch('https://api.nftport.xyz/v0/metadata', options)
    .then((response) => {
      return response.json();
    })
    .then((responseJson) => {
      console.log('IPNFT POST call response:', responseJson);
      res.status(200).json(responseJson);
    });
};
