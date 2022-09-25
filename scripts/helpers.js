const fs = require("fs");
const hre = require("hardhat");
const ethers = hre.ethers;

const DEFAULT_ARTIFACTS_PATH = "./artifacts/contracts";
const DEPLOYMENT_PATH = "./deployments";
const ERC20_TOKEN_PATH = "./artifacts/@openzeppelin/contracts/token/ERC20";

function getAccountAddress() {
    return JSON.parse(fs.readFileSync("./contract_address.json"))
}

function getContractABI(path) {
    return JSON.parse(fs.readFileSync(`${DEFAULT_ARTIFACTS_PATH}/${path}`)).abi
};


function getTokenABI(path) {
    return JSON.parse(fs.readFileSync(`${ERC20_TOKEN_PATH}/${path}`)).abi
};

function getContractAddress(env,path){
    return JSON.parse(fs.readFileSync(`${DEPLOYMENT_PATH}/${env}/${path}`)).address
}

module.exports = {
                getAccountAddress,
                getContractABI, 
                getTokenABI,
                getContractAddress,
        };
