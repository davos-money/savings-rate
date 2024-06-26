const { ethers, upgrades, network } = require('hardhat');
const { expect, assert } = require("chai");
const NetworkSnapshotter = require("../helpers/networkSnapshotter");
const { advanceTime, randomBN, toRay, toRad, impersonateAccount, format } = require("../helpers/utils");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { parseEther } = ethers.utils;

const toBN = ethers.BigNumber.from;
const e18 = parseEther('1');
const ray = toRay('1');


let vat, vow, interaction, davosJoin, jug, davos, davosProvider, pot, sDusd, asset, deployer, signer1, signer2, signer3,
  davosDeployer, multisig;

const networks = [
/*  {
    name: "Ethereum",
    forking: {
      jsonRpcUrl: "https://rpc.ankr.com/eth",
      // blockNumber: 18976837,
    },
    getAsset: async (signer) => await signer.sendTransaction(
      { to: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", value: parseEther('1000') }),
    addresses: {
      asset: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // wstEth
      collaterals: [
        "0x0730BA2252670Cd71580dadf471f3E137592e800", // wstEth
        "0x7281d1bCcbe34574Ee6507b3f4816AFBe85A2e3d", // rEth
        "0xc7b219a9A8e246f9C4d4A1c7d4a371F0840ff724", // sfrx
        "0x97f0BdaDbfAA05a1944fFbA862b3336a175056cF", // ankrEth
        "0xd4E426ABA74Ece196D375e01b53A70ebeA51Cf25", // swEth
        "0xD9dbd69974733481eeCD0125898C8Bb63c51f783", // sDAI
      ],
      vat: "0x1c539E755A1BdaBB168aA9ad60B31548991981F9",
      vow: "0xb2565e05816963CFD957d8baEab95033470352bb",
      auctionProxy: "0x1A80B0512580791dDA042FeF0083e6Ce7cbd5d88",
      interaction: "0x2F2E746b2e9ef33c2AC6348985f100AF8DBC944d",
      davosJoin: "0xec348813A94c2873E4D2372ae40955392A12ACFF",
      jug: "0xbbF35c9Dcb16eA3cB64A0FcE51c51F9Ca34079Fe",
      davos: "0xa48F322F8b3edff967629Af79E027628b9Dd1298",
      davosProvider: "0xd25B3DBb79888F548ccfb3FfCf530Fb0Cb69bc4f",
      deployer: "0xA8979dF21B6Dc13935A17F9C13ec6C82942eB9f5",
    }
  },
  {
    name: "Arbitrum",
    forking: {
      jsonRpcUrl: "https://rpc.ankr.com/arbitrum",
      // blockNumber: 169367783,
    },
    getAsset: async (signer) => {
      const address = "0x916792f7734089470de27297903BED8a4630b26D";
      await helpers.impersonateAccount(address);
      const holder = await ethers.getSigner(address);
      const amount = await asset.balanceOf(holder.address);
      console.log(`Amount: ${format(amount)}`);
      await asset.connect(holder).transfer(signer.address, amount);
    },
    addresses: {
      asset: "0x5979D7b546E38E414F7E9822514be443A4800529", // wstEth
      collaterals: [
        "0x30aCD3e86f42Fcc87c6FB9873058d8d7133785d4", // wstEth
        "0x9eDC0ea75e6023b93bbB41c16818e314cfE59D2b", // rEth
        "0xEC38621e72D86775a89C7422746de1f52bbA5320", // stEUR
        "0x5E851dC1f56A05Bb6d3C053FA756304a5171C345", // ankrEth
      ],
      vat: "0x2304CE6B42D505141A286B7382d4D515950b1890",
      vow: "0xe84d3029feDd3CbE3d30c5245679CBD9B30118bC",
      auctionProxy: "0x1c539E755A1BdaBB168aA9ad60B31548991981F9",
      interaction: "0xa48F322F8b3edff967629Af79E027628b9Dd1298",
      davosJoin: "0x92E77bA6ceCb46733aE482ba1d7E011Aa872Ad7e",
      jug: "0xb396b31599333739A97951b74652c117BE86eE1D",
      davos: "0x8EC1877698ACF262Fe8Ad8a295ad94D6ea258988",
      davosProvider: "0x7eF3991f54D2cBefe247C2ff7c35a8a9609dcEfa",
      deployer: "0x39355FFAfC47E54E7d7e786b1Df0fa0e222FBd06",
    }
  },
  {
    name: "Optimism",
    forking: {
      jsonRpcUrl: "https://rpc.ankr.com/optimism",
      // blockNumber: 114690552,
    },
    getAsset: async (signer) => {
      const address = "0xbb0b4642492b275F154e415fc52Dacc931103fD9";
      await helpers.impersonateAccount(address);
      const holder = await ethers.getSigner(address);
      await signer.sendTransaction(
        { to: address, value: parseEther('1') });
      const amount = await asset.balanceOf(holder.address);
      console.log(`Amount: ${format(amount)}`);
      await asset.connect(holder).transfer(signer.address, amount);
    },
    addresses: {
      asset: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb", // wstEth
      collaterals: [
        "0xb44A251d1C31dd32700E5F2584B4282716C43EB3", // wstEth
        "0x9c44E6A927302dA33dd76abe4558f26e31C48019", // rEth
      ],
      vat: "0xf2393EEAdD67bf68a60f39992113775966F34E1e",
      vow: "0x74FB5adf4eBA704c42f5974B83E53BBDA46F0C96",
      auctionProxy: "0xa48F322F8b3edff967629Af79E027628b9Dd1298",
      interaction: "0xBDF1dceC3CD02a5230672fa4bd779Bdb2E4a67a3",
      davosJoin: "0xe84d3029feDd3CbE3d30c5245679CBD9B30118bC",
      jug: "0xa0CF627D429F35411820590D72eBaD183FD61C33",
      davos: "0xb396b31599333739A97951b74652c117BE86eE1D",
      davosProvider: "0x86e956154df2cd9495b6d92d9b0c2b00f8e390b1",
      deployer: "0xd41773c62c84f828D5Db0F9B8B0274cB5aB352Bd",
    }
  },
  {
    name: "zkEvm",
    forking: {
      jsonRpcUrl: "https://rpc.ankr.com/polygon_zkevm",
      // blockNumber: 9164545,
    },
    getAsset: async (signer) => {
      const address = "0x261BDd807d36e5bA486B9cA63b6473AAb49E67f3";
      await helpers.impersonateAccount(address);
      const holder = await ethers.getSigner(address);
      await signer.sendTransaction(
        { to: address, value: parseEther('1') });
      const amount = await asset.balanceOf(holder.address);
      console.log(`Amount: ${format(amount)}`);
      await asset.connect(holder).transfer(signer.address, amount);
    },
    addresses: {
      asset: "0x5D8cfF95D7A57c0BF50B30b43c7CC0D52825D4a9", // wstEth
      collaterals: [
        "0x24318b8a0CBaCc61cAdE47e5457Eea7237EB2c0E", // wstEth
        "0x93402F1908dD009C857962b45278E71C7F63647f", // rEth
        "0x687B069759b053866715542f22877DA9091f20f5", // ankrEth
      ],
      vat: "0xd659ae8b53f5733532CE6a2e881420D0C0740509",
      vow: "0xb2565e05816963CFD957d8baEab95033470352bb",
      auctionProxy: "0xbfD158A63D2f58F7F723939bD492dAF111d6Efb4",
      interaction: "0x442dC9E8A0370AdC4A1D250dA0d04803EDfE9C56",
      davosJoin: "0x491579Bed0862Fd1f691A8eab2f614Ec48BACD0D",
      jug: "0x00658FC8ec685727F3F59d381B8Ad8f5E0FeDBc2",
      davos: "0x819d1Daa794c1c46B841981b61cC978d95A17b8e",
      davosProvider: "0xfaa4D9f3198ef616E6BA69DA2c9Bb9359e9Fe493",
      deployer: "0xA8979dF21B6Dc13935A17F9C13ec6C82942eB9f5",
    }
  },
  {
    name: "BSC",
    forking: {
      jsonRpcUrl: "https://rpc.ankr.com/bsc",
      // blockNumber: 35154035,
    },
    getAsset: async (signer) => {
      const address = "0x9E5d0dCF8A08b19064B4171bDF8CD66A6E8CA7Bb";
      await helpers.impersonateAccount(address);
      const holder = await ethers.getSigner(address);
      const amount = await asset.balanceOf(holder.address);
      console.log(`Amount: ${format(amount)}`);
      await asset.connect(holder).transfer(signer.address, amount);
    },
    addresses: {
      asset: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827", // ankrBNB
      collaterals: [
        "0x4e90156997BB469c6F5975e13FF1451C9500B711", // ankrBNB
        "0xb44A251d1C31dd32700E5F2584B4282716C43EB3", // vUSDT
        "0x87ad5Ab05d7C1E1F904e029783810A2a95702563", // vUSDC
      ],
      vat: "0x2304CE6B42D505141A286B7382d4D515950b1890",
      vow: "0xe84d3029feDd3CbE3d30c5245679CBD9B30118bC",
      auctionProxy: "0x1c539E755A1BdaBB168aA9ad60B31548991981F9",
      interaction: "0xa48F322F8b3edff967629Af79E027628b9Dd1298",
      davosJoin: "0x92E77bA6ceCb46733aE482ba1d7E011Aa872Ad7e",
      jug: "0xb396b31599333739A97951b74652c117BE86eE1D",
      davos: "0x8EC1877698ACF262Fe8Ad8a295ad94D6ea258988",
      davosProvider: "0xB298F06cC6fdB89f632e87C58144504A021ac2Da",
      deployer: "0x0567E328D0E23be8B8cB8c3004bEAc39fbD11082",
    }
  },*/

  //Testnet
  {
    name: "Goerli",
    forking: {
      jsonRpcUrl: "https://goerli.gateway.tenderly.co",
      // blockNumber: 10377827,
    },
    getAsset: async (signer) => {
      const token = new ethers.Contract(asset.address, ['function mint(uint256)']);
      await token.connect(signer).mint(parseEther('1000'));
    },
    addresses: {
      asset: "0xA74702b0853cbDA178626d915A7f38dcBE5DC6A5", // wstEth
      collaterals: [
        "0x9f787C93A4e1e99189A5BEB85Cf0F6645a850cbC", // wstEth
        "0xf6059e63f4d64a8ecA0Bb7ebc520785F0A1fFF86", // ceMATIC
        "0xD0A40831721Ba2d334251fc676f5a5EC17bF1a2B", // rETH
        "0xca333ef009210C0d77bebBE03D1AF65E427Bf08A", // sfrxETH
        "0x3C89DdE9467c8995791244C03886a77E5A5A377C", // ankrETH
        "0x22152368fFBC8cea9E5632898FC42C9b071FC947", // swETH
        "0x2814Ea58A7E3E119E43f39eDC4E3aFf7C0FF290B", // sDAI
      ],
      vat: "0xD3Fa07Fd66197EF36bCf882d6977D8cfcEd79a82",
      vow: "0x8524E40E5209eFF2c9B49b231a555cc0F0A1442f",
      auctionProxy: "0x93C1840808ea2Bb887cD93f4220bC0a0436EA725",
      interaction: "0xDB1cE9755Acd035C72d231c4c877F211d48f232B",
      davosJoin: "0x2bd37dd458Aa7Add2fC086a0236B7ffcd8Fc2277",
      jug: "0x8C4409305E4775984b2D8aEf3a05d1A6c940A3ac",
      davos: "0x80f6017aEc2f60079CAc141904b6d2e1Fb2599e7",
      davosProvider: "0xc8fD165808E6ce587A0038BeAc76263E577DA8E3",
      deployer: "0x2850C2929B33BCE33b8aa81B0A9D1d3632118896",
      pot: "0x63a5CF1f495D65b80C077d19D6Ab1bb115888b49",
      sDusd: "0xc9bBE2FcD63111d01850A4f16b272A5f40D1e771",
    }
  },
]

async function init(net) {
  //Accounts
  const [deployer, signer1, signer2, signer3] = await ethers.getSigners();
  //Davos deployer
  const davosDeployer = await impersonateAccount(net.addresses.deployer, parseEther("10"));

  //Davos
  console.log("=== Vat");
  const vatFactory = await ethers.getContractFactory("Vat");
  const vat = vatFactory.attach(net.addresses.vat);
  console.log("=== Vow");
  const vowFactory = await ethers.getContractFactory("Vow");
  const vow = vowFactory.attach(net.addresses.vow);
  console.log("=== Interaction");
  const auctionProxyFactory = await ethers.getContractFactory("AuctionProxy");
  const auctionProxy = auctionProxyFactory.attach(net.addresses.auctionProxy);
  const intFactory = await ethers.getContractFactory("Interaction", {
    unsafeAllow: ['external-library-linking'],
    libraries: {
      AuctionProxy: net.addresses.auctionProxy,
    }
  });
  const interaction = intFactory.attach(net.addresses.interaction);
  console.log("=== DavosJoin");
  const dJoinFactory = await ethers.getContractFactory("DavosJoin");
  const davosJoin = dJoinFactory.attach(net.addresses.davosJoin);
  console.log("=== Jug");
  const jugFactory = await ethers.getContractFactory("Jug");
  const jug = jugFactory.attach(net.addresses.jug);
  console.log("=== Davos");
  const davosFactory = await ethers.getContractFactory("Davos");
  const davos = davosFactory.attach(net.addresses.davos);
  console.log("=== Davos Provider");
  const davosProviderFactory = await ethers.getContractFactory("DavosProvider");
  const davosProvider = davosProviderFactory.attach(net.addresses.davosProvider);

  //Asset wstEth
  const assetFactory = await ethers.getContractFactory("ERC20");
  const asset = assetFactory.attach(net.addresses.asset);

  let pot, sDusd;
  if (net.addresses.pot && net.addresses.sDusd) { //If deployed
    console.log("=== Pot Attached");
    const potFactory = await ethers.getContractFactory("Pot");
    pot = potFactory.attach(net.addresses.pot);

    console.log("=== SDUSD Attached");
    const sDusdFactory = await ethers.getContractFactory("sDusd");
    sDusd = sDusdFactory.attach(net.addresses.sDusd);
  } else {
    //SDUSD
    console.log("=== Pot Deployed");
    const potFactory = await ethers.getContractFactory("Pot");
    pot = await upgrades.deployProxy(potFactory, [net.addresses.vat], { initializer: "initialize" });
    await vat.connect(davosDeployer).rely(pot.address);
    const dsrValue = ((1 + DSR / 100) ** (1 / (31536000))).toFixed(27).replaceAll(".", "");
    console.log(`Dsr value: ${dsrValue}`);
    await pot["file(bytes32,uint256)"](ethers.utils.formatBytes32String("dsr"), dsrValue);
    await pot["file(bytes32,address)"](ethers.utils.formatBytes32String("vow"), net.addresses.vow);

    console.log("=== SDUSD Deployed");
    const sDusdFactory = await ethers.getContractFactory("sDusd");
    sDusd = await upgrades.deployProxy(sDusdFactory, [net.addresses.davosJoin, pot.address], { initializer: "initialize" });
    await davosJoin.connect(davosDeployer).rely(sDusd.address);
  }

  return [vat, vow, interaction, davosJoin, jug, davos, davosProvider, pot, sDusd, asset, deployer, signer1, signer2, signer3, davosDeployer];
}

const DSR = 4; //% sDUSD saving rate = APY
describe("DSR", function () {
  this.timeout(150000);
  const networkSnapshotter = new NetworkSnapshotter();

  let totalFee = toBN(0);
  let totalVice = toBN(0);

  networks.forEach(function (net) {
    describe(`Forking ${net.name}`, function () {

      before(async function () {
        //Reset settings for forking
        await network.provider.send("hardhat_reset", [{
          forking: net.forking,
        }]);

        [vat, vow, interaction, davosJoin, jug, davos, davosProvider, pot, sDusd, asset, deployer, signer1, signer2, signer3, davosDeployer] = await init(net);
        multisig = await impersonateAccount(await vow.multisig(), parseEther('1'));
        // await networkSnapshotter.firstSnapshot();
      });

      let networkFee = toBN(0), networkBadDebt = toBN(0);
      net.addresses.collaterals.forEach(function (address) {
        it(`Drip ${address}`, async () => {
          const feeBefore = (await vat.davos(net.addresses.vow)).div(ray);
          console.log(`Fee before:\t${format(feeBefore)} DAVOS`);

          await interaction.drip(address);
          const feeAfter = (await vat.davos(net.addresses.vow)).div(ray);
          totalFee = totalFee.add(await vat.davos(net.addresses.vow));
          networkFee = networkFee.add(await vat.davos(net.addresses.vow));
          console.log(`Fee after:\t${format(feeAfter)} DAVOS`);
          console.log(`Collected:\t${format(feeAfter.sub(feeBefore))}`);

          const collateral = await interaction.collaterals(address);
          const duty = (await jug.ilks(collateral.ilk)).duty;
          const name = ethers.utils.parseBytes32String(collateral.ilk);
          console.log(`Duty ${name}:\t${duty}`);
        });
      });

      it("Get initial bad debt", async () => {
        totalVice = totalVice.add(await vat.vice());
        networkBadDebt = networkBadDebt.add(await vat.vice());
      });

      it("Borrow DAVOS", async () => {
        console.log(`Signer Eth balance before: ${format(await ethers.provider.getBalance(signer1.address))}`);
        //Get asset
        await net.getAsset(signer1);
        // await signer1.sendTransaction({to: asset.address, value: parseEther('1000')});
        const assetBalance = await asset.balanceOf(signer1.address);
        console.log(`Asset balance: ${format(assetBalance)}`);
        //Provide
        await asset.connect(signer1).approve(davosProvider.address, ethers.constants.MaxUint256);
        await davosProvider.connect(signer1).provide(assetBalance);
        //Borrow 75%
        const availableToBorrow = await interaction.availableToBorrow(net.addresses.collaterals[0], signer1.address);
        console.log(`Available to borrow: ${format(availableToBorrow)}`);
        const amount = availableToBorrow.mul(3).div(4); //75%
        await interaction.connect(signer1).borrow(net.addresses.collaterals[0], amount);
        console.log(`Davos balance: ${format(await davos.balanceOf(signer1.address))}`);
      });

      it("Get SDUSD", async () => {
        console.log(`Bad debt: ${format((await vat.vice()).div(ray))}`);
        const signer = signer1;
        const receiver = signer1;
        const saveAmount = await davos.balanceOf(signer.address);
        await davos.connect(signer).approve(sDusd.address, saveAmount);
        await sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, receiver.address);
        const chi = await pot.chi();

        const davosBalanceAfter = await davos.balanceOf(signer.address);
        const sdusdBalanceAfter = await sDusd.balanceOf(receiver.address);
        console.log(`Davos balance: ${format(davosBalanceAfter)}`);
        console.log(`SDUSD balance: ${format(sdusdBalanceAfter)}`);
      });

      it("Wait 1 year and redeem sDUSD", async () => {
        await advanceTime(365 * 86400);

        const maxRedeem = await sDusd.maxRedeem(signer1.address);
        await sDusd.connect(signer1).redeem(maxRedeem, signer1.address, signer1.address);

        const davosBalanceAfter = await davos.balanceOf(signer1.address);
        const sdusdBalanceAfter = await sDusd.balanceOf(signer1.address);
        console.log(`Davos balance: ${format(davosBalanceAfter)}`);
        console.log(`SDUSD balance: ${format(sdusdBalanceAfter)}`);
      })

      it("Drip: calculate earned borrowing fees", async () => {
        const feeBefore = (await vat.davos(net.addresses.vow)).div(ray);
        console.log(`Fee before: ${format(feeBefore)}`);

        for (const address of net.addresses.collaterals) {
          await interaction.drip(address);
        }

        const feeAfter = (await vat.davos(net.addresses.vow)).div(ray);
        const debt = (await vat.vice()).div(ray);
        console.log(`Collected:\t${format(feeAfter.sub(feeBefore))}`);
        console.log(`Fee after:\t${format(feeAfter)}`);
        console.log(`Bad debt:\t${format(debt)}`);
        expect(feeAfter).to.be.gt(debt);
      });

      it("Flap: send fee surplus to multisig account", async () => {
        const multisigBalanceBefore = await davos.balanceOf(multisig.address);
        console.log(`Multisig balance before:\t${format(multisigBalanceBefore)}`);

        await vow.flap();
        const multisigBalanceAfter = await davos.balanceOf(multisig.address);
        console.log(`Multisig balance after:\t${format(multisigBalanceAfter)}`);
      });

      it("Heal: pay off bad debt", async () => {
        const debt = (await vat.vice());
        const debtWad = debt.div(ray).add(1);
        const multisigBalance = await davos.balanceOf(multisig.address);
        console.log(`Balance:\t${format(multisigBalance)}`);
        console.log(`Bad debt:\t${format(debtWad)}`);
        console.log(`Multisig address: ${multisig.address}`);

        // await davos.connect(multisig).approve(vow.address, debtWad);
        // await vow.connect(multisig).feed(debtWad);

        await vow.connect(multisig).heal(debt);
        console.log(`Final debt: ${await vat.vice()}`);
      })

      it(`Drip after`, async () => {
        for (const address of net.addresses.collaterals) {
          const collateral = await interaction.collaterals(address);
          const name = ethers.utils.parseBytes32String(collateral.ilk);
          const fee = (await vat.davos(net.addresses.vow)).div(ray);
          console.log(`${name}:\t${format(fee)}`);
        }
      });

      after(async function () {
        console.log(`${net.name} Fee earned, DAVOS: ${format(networkFee.div(ray))}`);
        console.log(`${net.name} bad debt, DAVOS: ${format(networkBadDebt.div(ray))}`);
      });
    })
  })

  after(async function () {
    console.log(`Total Fee earned, DAVOS: ${format(totalFee.div(ray))}`);
    console.log(`Total bad debt, DAVOS: ${format(totalVice.div(ray))}`);
  });

})