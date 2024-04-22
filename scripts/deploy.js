let hre = require("hardhat");
let {ethers, upgrades} = require("hardhat");
const fs = require("fs");

const admin_slot = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

function parseAddress(addressString){
    const buf = Buffer.from(addressString.replace(/^0x/, ''), 'hex');
    if (!buf.slice(0, 12).equals(Buffer.alloc(12, 0))) {
        return undefined;
    }
    const address = '0x' + buf.toString('hex', 12, 32); // grab the last 20 bytes
    return ethers.utils.getAddress(address);
}

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
    } else if (hre.network.name == "optimism") {
        multisig = "0xd41773c62c84f828D5Db0F9B8B0274cB5aB352Bd";
        dusdJoin = "0xe84d3029feDd3CbE3d30c5245679CBD9B30118bC";
        vat = "0xf2393EEAdD67bf68a60f39992113775966F34E1e";
    } else if (hre.network.name == "bsc") {
        multisig = "0x0567E328D0E23be8B8cB8c3004bEAc39fbD11082";
        dusdJoin = "0x92E77bA6ceCb46733aE482ba1d7E011Aa872Ad7e";
        vat = "0x2304CE6B42D505141A286B7382d4D515950b1890";
    } else if (hre.network.name == "ethereumTestnet") {
        multisig = "0x9126BC45A20076Eb9f65dE83C18bd3d618759Fc4";
        dusdJoin = "0x2bd37dd458Aa7Add2fC086a0236B7ffcd8Fc2277";
        vat = "0xD3Fa07Fd66197EF36bCf882d6977D8cfcEd79a82";
    } else if (hre.network.name == "arbitrumTestnet") {
        multisig = "0x9126BC45A20076Eb9f65dE83C18bd3d618759Fc4";
        dusdJoin = "0x0Bd25e4e793340134bc560Cd04D24A3937e4a419";
        vat = "0x13f906d331E78fFca64232358E3F0D15DDf33Ce9";
    } else if (hre.network.name == "optimismTestnet") {
        multisig = "0x2850C2929B33BCE33b8aa81B0A9D1d3632118896";
        dusdJoin = "0x6e5F76492b663828A481201AFd43e50aB2a461F1";
        vat = "0x6e2B5b6Df646091C69299cF93F3D1CdCB11c2Fb7";
    } else if (hre.network.name == "bscTestnet") {
        multisig = "0x9126BC45A20076Eb9f65dE83C18bd3d618759Fc4";
        dusdJoin = "0x18706a546E93B33b0DF6957d94fFd3a4e7dC92aA";
        vat = "0xFBd9a7332f0F4B78a55D5f6460D75b7affe9A06c";
    } else if (hre.network.name == "lineaTestnet") {
        multisig = "0x2850C2929B33BCE33b8aa81B0A9D1d3632118896";
        dusdJoin = "0x0b512BEfF98Dd112Bc4026eD23150d9F2263741A";
        vat = "0xd4c60fA43c95F9355316ad60Eb33D55e6c7a5aEF";
    } else if (hre.network.name == "linea") {
        multisig = "0x8F0E864AE6aD45d973BD5B3159D5a7079A83B774";
        dusdJoin = "0x8ed3b45662e885aABbEBd89EBe8850aD9c3C96Aa";
        vat = "0x9032bDa78d8fCe219fB0E95b69E54047921BB816";
    } else if (hre.network.name == "mode") {
        multisig = "0x772bBC002e6FF0905B9fB3B5E12Ff1d78d4aa215";
        dusdJoin = "0x77F4C841cb87fDFa43aB909cf56f7710Af648a8e";
        vat = "0x08ABFd7DEd42CC33900d3457118eAB7fC40b71c8";
    } else if (hre.network.name == "modeTestnet") {
        multisig = "0x772bBC002e6FF0905B9fB3B5E12Ff1d78d4aa215";
        dusdJoin = "0x441B80BA4B7e3d5868d3224CE8501F7d2EAe7B31";
        vat = "0xB87028398607A1D3C97bC3693b612Af6f9019F1B";
    } else throw "ERROR";
    
    // Fetching
    this.Pot = await hre.ethers.getContractFactory("Pot");
    this.SDusd = await hre.ethers.getContractFactory("sDusd");

    // Deployment
    console.log("Deploying...");

    let pot = await upgrades.deployProxy(this.Pot, [vat], {initializer: "initialize"});
    await pot.deployed();
    // let potImp = await upgrades.erc1967.getImplementationAddress(pot.address);
    console.log("Pot              : " + pot.address);
    // console.log("Imp              : " + potImp);
    

    let sdusd = await upgrades.deployProxy(this.SDusd, [dusdJoin, pot.address], {initializer: "initialize"});
    await sdusd.deployed();
    // let sdusdImp = await upgrades.erc1967.getImplementationAddress(sdusd.address);
    console.log("Sdusd            : " + sdusd.address);
    // console.log("imp              : " + sdusdImp);

    // Store Deployed Contracts
    const addresses = {
        _pot             : pot.address,
        _sdusd           : sdusd.address,
    }

    const json_addresses = JSON.stringify(addresses);
    fs.writeFileSync(`./scripts/addresses_${network.name}.json`, json_addresses);
    console.log("Addresses Recorded to: " + `./scripts/addresses_${network.name}.json`);

    console.log("Transfering Ownership");

    initialNonce = await ethers.provider.getTransactionCount(deployer.address);
    _nonce = initialNonce

    await (await pot.rely(multisig, {nonce: _nonce})).wait(); _nonce += 1; console.log("Relied");

    const proxyAdminAddress = parseAddress(await ethers.provider.getStorageAt(pot.address, admin_slot));

    let PROXY_ADMIN_ABI = ["function owner() public view returns (address)"];
    let proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, proxyAdminAddress);

    let owner = await proxyAdmin.owner();
    console.log("Owner: ", owner);
    console.log("Multi: ", multisig);

    if (owner != ethers.constants.AddressZero && owner != multisig) {
        PROXY_ADMIN_ABI = ["function transferOwnership(address newOwner) public"];
        let proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, proxyAdminAddress);
        await(await proxyAdmin.transferOwnership(multisig, {nonce: _nonce})).wait();
        console.log("proxyAdmin transferred");
    } else {
        console.log("Already owner of proxyAdmin")
    }

    console.log("FINISHED");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});