let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function main() {

    let multisig, dusdJoin, vat;

    // Signer
    [deployer] = await ethers.getSigners();
    let initialNonce = await ethers.provider.getTransactionCount(deployer.address);
    let _nonce = initialNonce

    // Network config
    if (hre.network.name == "ethereum") {
        multisig = "0x42bA6167ac1e5a37bA2B773EC3b7e4761cBC821C";
        dusdJoin = "0xec348813A94c2873E4D2372ae40955392A12ACFF";
        vat = "0x1c539E755A1BdaBB168aA9ad60B31548991981F9";
    } else if (hre.network.name == "arbitrum") {
        multisig = "0x39355FFAfC47E54E7d7e786b1Df0fa0e222FBd06";
        dusdJoin = "0x92E77bA6ceCb46733aE482ba1d7E011Aa872Ad7e";
        vat = "0x2304CE6B42D505141A286B7382d4D515950b1890";
    } else if (hre.network.name == "ethereumTestnet") {
        multisig = "0x2850C2929B33BCE33b8aa81B0A9D1d3632118896";
        dusdJoin = "0x2bd37dd458Aa7Add2fC086a0236B7ffcd8Fc2277";
        vat = "0xD3Fa07Fd66197EF36bCf882d6977D8cfcEd79a82";
    } else if (hre.network.name == "arbitrumTestnet") {
        multisig = "0x2850C2929B33BCE33b8aa81B0A9D1d3632118896";
        dusdJoin = "0x0Bd25e4e793340134bc560Cd04D24A3937e4a419";
        vat = "0x13f906d331E78fFca64232358E3F0D15DDf33Ce9";
    } else throw "ERROR";
    
    // Fetching
    this.Pot = await hre.ethers.getContractFactory("Pot");
    this.SDusd = await hre.ethers.getContractFactory("sDusd");

    // Deployment
    console.log("Deploying...");

    let pot = await upgrades.deployProxy(this.Pot, [vat], {initializer: "initialize", nonce: _nonce}); _nonce += 1
    await pot.deployed();
    let potImp = await upgrades.erc1967.getImplementationAddress(pot.address);
    console.log("Pot              : " + pot.address);
    console.log("Imp              : " + potImp);

    let sdusd = await upgrades.deployProxy(this.SDusd, [dusdJoin, pot.address], {initializer: "initialize", nonce: _nonce}); _nonce += 1;
    await sdusd.deployed();
    let sdusdImp = await upgrades.erc1967.getImplementationAddress(sdusd.address);
    console.log("Sdusd            : " + sdusd.address);
    console.log("imp              : " + sdusdImp);

    // Store Deployed Contracts
    const addresses = {
        _pot             : pot.address,
        _sdusd           : sdusd.address,
    }

    const json_addresses = JSON.stringify(addresses);
    fs.writeFileSync(`./scripts/addresses_${network.name}.json`, json_addresses);
    console.log("Addresses Recorded to: " + `./scripts/addresses_${network.name}.json`);

    console.log("Transfering Ownership");

    await pot.rely(multisig);

    console.log("FINISHED");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});