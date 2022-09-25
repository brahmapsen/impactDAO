const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');

if (process.env.NFTPORT_KEY === undefined) {
  console.log('Please define NFTPORT_KEY as environment variable');
}
const NFTPORT_KEY = process.env.NFTPORT_KEY;

//Saves image to IPFS/Filecoin using NFTPort
module.exports = async (req, res) => {
  console.log('call save file to IPFS---');
  const { params } = req.body;
  const { filePath } = params; //req.query;
  console.log(` File:  ${filePath}`);

  const form = new FormData();
  const fileStream = fs.createReadStream(filePath);
  form.append('file', fileStream);

  const options = {
    method: 'POST',
    body: form,
    headers: {
      Authorization: NFTPORT_KEY,
    },
  };

  fetch('https://api.nftport.xyz/v0/files', options)
    .then((response) => {
      return response.json();
    })
    .then((responseJson) => {
      console.log('IPNFT POST call response:', responseJson);
      res.status(200).json(responseJson);
    });
};
