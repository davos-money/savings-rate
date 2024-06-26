const { ethers, upgrades, network } = require('hardhat');
const { expect, assert } = require("chai");
const NetworkSnapshotter = require("../helpers/networkSnapshotter");
const { ether } = require("@openzeppelin/test-helpers");
const { advanceTime, randomBN, toRay } = require("../helpers/utils");
const { parseEther } = ethers.utils;
const toBN = ethers.BigNumber.from;

const e18 = parseEther('1');
const ray = toRay('1');
describe('===DSR===', function () {

  this.timeout(30000);

  let _chainId, _mat, _dgtRewardsPoolLimitInEth, _vat_Line, _vat_line,
    _spot_par, _dog_Hole, _dog_hole, _dog_chop, _abacus_tau, _clip_buf, _clip_tail,
    _clip_cusp, _clip_chip, _clip_tip, _clip_stopped, _multisig, _vat_dust, dMatic;

  //Accounts
  let deployer, signer1, signer2, signer3;

  async function deploySwapPool() {
    const mintAmount = parseEther("10000000");

    const WNativeFactory = await ethers.getContractFactory("Token");
    const CerosTokenFactory = await ethers.getContractFactory("Token");

    wNative = await WNativeFactory.connect(deployer).deploy();
    await wNative.deployed();
    cerosToken = await CerosTokenFactory.connect(deployer).deploy();
    await cerosToken.deployed();

    await wNative.mint(signer1.address, mintAmount);
    await cerosToken.mint(signer1.address, mintAmount);

    await cerosToken.setRatio(parseEther("0.6"));

    // Initialize Contracts
    return [wNative, cerosToken];
  }

  const networkSnapshotter = new NetworkSnapshotter();

  async function init() {

    _mat = "1333333333333333333333333333";
    _dgtRewardsPoolLimitInEth = "100000000";
    _vat_Line = "5000000";
    _vat_line = "5000000";
    _vat_dust = "100";
    _spot_par = "1";
    _dog_Hole = "50000000";
    _dog_hole = "50000000";
    _dog_chop = "1100000000000000000";
    _abacus_tau = "36000";
    _clip_buf = "1100000000000000000000000000";
    _clip_tail = "10800";
    _clip_cusp = "600000000000000000000000000";
    _clip_chip = "100000000000000";
    _clip_tip = "10";
    _clip_stopped = "0";
    _chainId = "97";

    wad = "000000000000000000", // 18 Decimals
      // ray = "000000000000000000000000000", // 27 Decimals
      rad = "000000000000000000000000000000000000000000000", // 45 Decimals
      ONE = 10 ** 27;
    YEAR = 31556952;

    // Signer
    _multisig = deployer.address;

    [wMatic, aMaticc] = await deploySwapPool();
    collateralToken = aMaticc;

    _ilkCeMatic = ethers.utils.formatBytes32String("aMATICc");

    // Contracts Fetching
    CeaMATICc = await ethers.getContractFactory("CeToken");
    CeVault = await ethers.getContractFactory("CeVault");
    AMATICb = await ethers.getContractFactory("aMATICb");
    AMATICc = await ethers.getContractFactory("aMATICc");
    DMatic = await ethers.getContractFactory("dMATIC");
    CerosRouter = await ethers.getContractFactory("CerosRouterLs");
    DavosProvider = await ethers.getContractFactory("DavosProvider");
    Vat = await ethers.getContractFactory("Vat");
    Spot = await ethers.getContractFactory("Spotter");
    Davos = await ethers.getContractFactory("Davos");
    GemJoin = await ethers.getContractFactory("GemJoin");
    DavosJoin = await ethers.getContractFactory("DavosJoin");
    Oracle = await ethers.getContractFactory("Oracle");
    Jug = await ethers.getContractFactory("Jug");
    Vow = await ethers.getContractFactory("Vow");
    Dog = await ethers.getContractFactory("Dog");
    Clip = await ethers.getContractFactory("Clipper");
    Abacus = await ethers.getContractFactory("LinearDecrease");
    DgtToken = await ethers.getContractFactory("DGTToken");
    DgtRewards = await ethers.getContractFactory("DGTRewards");
    DgtOracle = await ethers.getContractFactory("DGTOracle");
    AuctionProxy = await ethers.getContractFactory("AuctionProxy");
    Pot = await ethers.getContractFactory("Pot");
    sDusd = await ethers.getContractFactory("sDusd");

    const auctionProxy = await this.AuctionProxy.deploy();
    await auctionProxy.deployed();
    Interaction = await ethers.getContractFactory("Interaction", {
      unsafeAllow: ['external-library-linking'],
      libraries: {
        AuctionProxy: auctionProxy.address
      }
    });

    dMatic = await upgrades.deployProxy(this.DMatic, [], { initializer: "initialize" });
    await dMatic.deployed();
    dMaticImp = await upgrades.erc1967.getImplementationAddress(dMatic.address);

    abacus = await upgrades.deployProxy(this.Abacus, [], { initializer: "initialize" });
    await abacus.deployed();
    abacusImp = await upgrades.erc1967.getImplementationAddress(abacus.address);

    oracle = await this.Oracle.deploy();
    await oracle.deployed();
    await oracle.setPrice("2" + wad); // 2$

    vat = await upgrades.deployProxy(this.Vat, [], { initializer: "initialize" });
    await vat.deployed();
    vatImp = await upgrades.erc1967.getImplementationAddress(vat.address);

    spot = await upgrades.deployProxy(this.Spot, [vat.address], { initializer: "initialize" });
    await spot.deployed();
    spotImp = await upgrades.erc1967.getImplementationAddress(spot.address);

    davos = await upgrades.deployProxy(this.Davos, [_chainId, "DAVOS", "5000000" + wad], { initializer: "initialize" });
    await davos.deployed();
    davosImp = await upgrades.erc1967.getImplementationAddress(davos.address);

    davosJoin = await upgrades.deployProxy(this.DavosJoin, [vat.address, davos.address], { initializer: "initialize" });
    await davosJoin.deployed();
    davosJoinImp = await upgrades.erc1967.getImplementationAddress(davosJoin.address);

    gemJoin = await upgrades.deployProxy(this.GemJoin, [vat.address, _ilkCeMatic, collateralToken.address], { initializer: "initialize" });
    await gemJoin.deployed();
    gemJoinImp = await upgrades.erc1967.getImplementationAddress(gemJoin.address);

    jug = await upgrades.deployProxy(this.Jug, [vat.address], { initializer: "initialize" });
    await jug.deployed();
    jugImp = await upgrades.erc1967.getImplementationAddress(jug.address);

    vow = await upgrades.deployProxy(this.Vow, [vat.address, davosJoin.address, _multisig], { initializer: "initialize" });
    await vow.deployed();
    vowImp = await upgrades.erc1967.getImplementationAddress(vow.address);

    dog = await upgrades.deployProxy(this.Dog, [vat.address], { initializer: "initialize" });
    await dog.deployed();
    dogImpl = await upgrades.erc1967.getImplementationAddress(dog.address);

    clip = await upgrades.deployProxy(this.Clip, [vat.address, spot.address, dog.address, _ilkCeMatic], { initializer: "initialize" });
    await clip.deployed();
    clipImp = await upgrades.erc1967.getImplementationAddress(dog.address);

    rewards = await upgrades.deployProxy(this.DgtRewards, [vat.address, ether(_dgtRewardsPoolLimitInEth).toString(), 5], { initializer: "initialize" });
    await rewards.deployed();
    rewardsImp = await upgrades.erc1967.getImplementationAddress(rewards.address);

    interaction = await upgrades.deployProxy(this.Interaction, [vat.address, spot.address, davos.address, davosJoin.address, jug.address, dog.address, rewards.address],
      {
        initializer: "initialize",
        unsafeAllowLinkedLibraries: true,
      }
    );
    await interaction.deployed();
    interactionImplAddress = await upgrades.erc1967.getImplementationAddress(interaction.address);

    davosProvider = await upgrades.deployProxy(this.DavosProvider, [collateralToken.address, dMatic.address, collateralToken.address, interaction.address, false], { initializer: "initialize" });
    await davosProvider.deployed();
    davosProviderImplementation = await upgrades.erc1967.getImplementationAddress(davosProvider.address);

    await vat.rely(gemJoin.address);
    await vat.rely(spot.address);
    await vat.rely(davosJoin.address);
    await vat.rely(jug.address);
    await vat.rely(dog.address);
    await vat.rely(clip.address);
    await vat.rely(interaction.address);
    await vat["file(bytes32,uint256)"](ethers.utils.formatBytes32String("Line"), _vat_Line + rad);
    await vat["file(bytes32,bytes32,uint256)"](_ilkCeMatic, ethers.utils.formatBytes32String("line"), _vat_line + rad);
    await vat["file(bytes32,bytes32,uint256)"](_ilkCeMatic, ethers.utils.formatBytes32String("dust"), _vat_dust + rad);

    await davos.rely(davosJoin.address);
    await davos.setSupplyCap("5000000" + wad);

    await spot.rely(interaction.address);
    await spot["file(bytes32,bytes32,address)"](_ilkCeMatic, ethers.utils.formatBytes32String("pip"), oracle.address);
    await spot["file(bytes32,uint256)"](ethers.utils.formatBytes32String("par"), ray.mul(_spot_par)); // It means pegged to 1$

    await rewards.rely(interaction.address);

    await gemJoin.rely(interaction.address);
    await davosJoin.rely(interaction.address);
    await davosJoin.rely(vow.address);

    await dog.rely(interaction.address);
    await dog.rely(clip.address);
    await dog["file(bytes32,address)"](ethers.utils.formatBytes32String("vow"), vow.address);
    await dog["file(bytes32,uint256)"](ethers.utils.formatBytes32String("Hole"), _dog_Hole + rad);
    await dog["file(bytes32,bytes32,uint256)"](_ilkCeMatic, ethers.utils.formatBytes32String("hole"), _dog_hole + rad);
    await dog["file(bytes32,bytes32,uint256)"](_ilkCeMatic, ethers.utils.formatBytes32String("chop"), _dog_chop);
    await dog["file(bytes32,bytes32,address)"](_ilkCeMatic, ethers.utils.formatBytes32String("clip"), clip.address);

    await clip.rely(interaction.address);
    await clip.rely(dog.address);
    await clip["file(bytes32,uint256)"](ethers.utils.formatBytes32String("buf"), _clip_buf); // 10%
    await clip["file(bytes32,uint256)"](ethers.utils.formatBytes32String("tail"), _clip_tail); // 3H reset time
    await clip["file(bytes32,uint256)"](ethers.utils.formatBytes32String("cusp"), _clip_cusp); // 60% reset ratio
    await clip["file(bytes32,uint256)"](ethers.utils.formatBytes32String("chip"), _clip_chip); // 0.01% vow incentive
    await clip["file(bytes32,uint256)"](ethers.utils.formatBytes32String("tip"), _clip_tip + rad); // 10$ flat incentive
    await clip["file(bytes32,uint256)"](ethers.utils.formatBytes32String("stopped"), _clip_stopped);
    await clip["file(bytes32,address)"](ethers.utils.formatBytes32String("spotter"), spot.address);
    await clip["file(bytes32,address)"](ethers.utils.formatBytes32String("dog"), dog.address);
    await clip["file(bytes32,address)"](ethers.utils.formatBytes32String("vow"), vow.address);
    await clip["file(bytes32,address)"](ethers.utils.formatBytes32String("calc"), abacus.address);

    await jug.rely(interaction.address);
    await jug["file(bytes32,address)"](ethers.utils.formatBytes32String("vow"), vow.address);

    await vow.rely(dog.address);
    await vow["file(bytes32,address)"](ethers.utils.formatBytes32String("davos"), davos.address);

    await abacus.connect(deployer)["file(bytes32,uint256)"](ethers.utils.formatBytes32String("tau"), _abacus_tau); // Price will reach 0 after this time

    await setCollateralType();

    //Saving rates
    pot = await upgrades.deployProxy(this.Pot, [vat.address], { initializer: "initialize" });
    await pot.deployed();
    await pot.connect(deployer)["file(bytes32,uint256)"](ethers.utils.formatBytes32String("dsr"), "1000000000315522921573372069");
    await pot.connect(deployer)["file(bytes32,address)"](ethers.utils.formatBytes32String("vow"), vow.address)

    sDusd = await upgrades.deployProxy(this.sDusd, [davosJoin.address, pot.address], { initializer: "initialize" });
    await sDusd.deployed();
    await vat.rely(pot.address);
    await davosJoin.rely(sDusd.address);

    await pot.connect(deployer)["file(bytes32,uint256)"](ethers.utils.formatBytes32String("dsr"), "1000000000315522921573372069");
    await pot.connect(deployer)["file(bytes32,address)"](ethers.utils.formatBytes32String("vow"), vow.address)

    interaction.depositAndBorrowMax = async function (signer, amount) {
      if (signer.address !== signer1.address) {
        await aMaticc.connect(signer1).transfer(signer.address, amount);
      }

      await aMaticc.connect(signer).approve(this.address, ethers.constants.MaxUint256);
      await this.connect(signer).deposit(signer.address, aMaticc.address, amount);
      const availableToBorrow = (await this.availableToBorrow(aMaticc.address, signer.address))
        .mul(90n).div(100n);
      console.log(`available to borrow: ${availableToBorrow}`);

      const davosBalanceBefore = await davos.balanceOf(signer.address);
      await this.connect(signer).borrow(aMaticc.address, availableToBorrow);
      const davosBalanceAfter = await davos.balanceOf(signer.address);
      const borrowed = davosBalanceAfter.sub(davosBalanceBefore);
      console.log(`Borrowed DUSD: ${borrowed}`);
      return borrowed;
    }

  }

  async function setCollateralType() {
    await interaction.setCollateralType(collateralToken.address, gemJoin.address, _ilkCeMatic, clip.address, _mat);
    await interaction.poke(collateralToken.address);
    await interaction.drip(collateralToken.address);
  }

  before(async function () {
    [deployer, signer1, signer2, signer3] = await ethers.getSigners();
    await init();
    await networkSnapshotter.firstSnapshot();
  });

  describe('mint davos', async () => {

    before(async function () {
      await networkSnapshotter.revert();
    })

    it('mint davos = bridge', async () => {

      console.log(`wards: ${await davos.wards(deployer.address)}`);

      console.log(`signer balance before: ${await davos.balanceOf(signer1.address)}`);
      console.log(`total supply before: ${await davos.totalSupply()}`);

      await davos.mint(signer1.address, parseEther('1'));
      console.log(`signer balance after: ${await davos.balanceOf(signer1.address)}`);
      console.log(`total supply after: ${await davos.totalSupply()}`);
      console.log(`vat.vice: ${await vat.vice()}`);

    })

  })


  describe('ERC-4626', async () => {

    it('asset: returns asset address', async function () {
      expect(await sDusd.asset()).to.be.eq(davos.address);
    })

  })

  describe('previews', async () => {

    before(async function () {
      await networkSnapshotter.revert();

      const depositAmount = parseEther('1000');
      await interaction.depositAndBorrowMax(signer1, depositAmount);
      await davos.connect(signer1).approve(sDusd.address, depositAmount);
    })

    const args = [
      {
        amount: randomBN(18),
      },
      {
        amount: randomBN(18),
      },
      {
        amount: toBN('999999999999999999'),
      },
      {
        amount: toBN(2),
      },
      {
        amount: toBN(1),
      },
      {
        amount: toBN(0),
      }
    ]

    args.forEach(function (arg) {
      it(`previewDeposit: ${arg.amount}`, async function () {
        const signer = signer1;
        const sdusdBalanceBefore = await sDusd.balanceOf(signer.address);

        await sDusd.connect(signer)['deposit(uint256,address)'](arg.amount, signer.address);
        const previewDeposit = await sDusd.previewDeposit(arg.amount);
        const convertedAmount = await sDusd.convertToShares(arg.amount);

        const chi = await pot.chi();
        const sdusdBalanceAfter = await sDusd.balanceOf(signer.address);

        expect(sdusdBalanceAfter.sub(sdusdBalanceBefore)).to.be.eq(previewDeposit);
        expect(sdusdBalanceAfter.sub(sdusdBalanceBefore)).to.be.eq(convertedAmount);
        expect(sdusdBalanceAfter.sub(sdusdBalanceBefore)).to.be.closeTo(arg.amount.mul(ray).div(chi), 1);
      })

      it(`previewMint: ${arg.amount}`, async function () {
        const signer = signer1;
        const sdusdBalanceBefore = await sDusd.balanceOf(signer.address);
        const davosBalanceBefore = await davos.balanceOf(signer.address);

        await sDusd.connect(signer)['mint(uint256,address)'](arg.amount, signer.address);
        const previewMint = await sDusd.previewMint(arg.amount);

        const chi = await pot.chi();
        const sdusdBalanceAfter = await sDusd.balanceOf(signer.address);
        const davosBalanceAfter = await davos.balanceOf(signer.address);

        expect(sdusdBalanceAfter.sub(sdusdBalanceBefore)).to.be.eq(arg.amount);
        expect(davosBalanceBefore.sub(davosBalanceAfter)).to.be.eq(previewMint); //davos burned
        expect(previewMint).to.be.closeTo(arg.amount.mul(chi).div(ray), 1);
      })
    })


  })

  describe('deposit and mint sDusd', async () => {

    let totalDeposited = toBN(0);
    let totalShares = toBN(0);

    before(async function () {
      await networkSnapshotter.revert();
    })

    const args = [
      {
        name: 'deposit 1st user',
        signer: () => signer1,
        receiver: () => signer1,
        amount: parseEther('100'),
      },
      {
        name: 'deposit the same user 1 more time',
        signer: () => signer1,
        receiver: () => signer2,
        amount: parseEther('75'),

      },
      {
        name: 'deposit 2nd user',
        signer: () => signer2,
        receiver: () => signer2,
        amount: parseEther('100'),
      },
    ]

    args.forEach(function (arg) {
      it(`deposit sDusd ${arg.name}`, async function () {
        const signer = arg.signer();
        const receiver = arg.receiver();
        const saveAmount = await interaction.depositAndBorrowMax(signer, arg.amount);
        totalDeposited = totalDeposited.add(saveAmount);

        const davosBalanceBefore = await davos.balanceOf(signer.address);
        const sdusdBalanceBefore = await sDusd.balanceOf(receiver.address);

        await davos.connect(signer).approve(sDusd.address, saveAmount);
        await sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, receiver.address);
        const chi = await pot.chi();

        const davosBalanceAfter = await davos.balanceOf(signer.address);
        const sdusdBalanceAfter = await sDusd.balanceOf(receiver.address);
        const shares = sdusdBalanceAfter.sub(sdusdBalanceBefore);
        totalShares = totalShares.add(shares);

        console.log(`Total deposited ${totalDeposited}`);
        console.log(`Total asset: ${await sDusd.totalAssets()}`);

        expect(davosBalanceBefore.sub(davosBalanceAfter)).to.be.eq(saveAmount);
        expect(shares).to.be.closeTo(saveAmount.mul(ray).div(chi), 10);
        expect(await sDusd.totalAssets()).to.be.closeTo(totalShares.mul(chi).div(ray), 10);
      })
    })

    args.forEach(function (arg) {
      it(`deposit with referral code sDusd ${arg.name}`, async function () {
        const signer = arg.signer();
        const receiver = arg.receiver();
        const saveAmount = await interaction.depositAndBorrowMax(signer, arg.amount);
        totalDeposited = totalDeposited.add(saveAmount);

        const davosBalanceBefore = await davos.balanceOf(signer.address);
        const sdusdBalanceBefore = await sDusd.balanceOf(receiver.address);

        await davos.connect(signer).approve(sDusd.address, saveAmount);
        await sDusd.connect(signer)['deposit(uint256,address,uint16)'](saveAmount, receiver.address, randomBN(4));
        const chi = await pot.chi();

        const davosBalanceAfter = await davos.balanceOf(signer.address);
        const sdusdBalanceAfter = await sDusd.balanceOf(receiver.address);
        const shares = sdusdBalanceAfter.sub(sdusdBalanceBefore);
        totalShares = totalShares.add(shares);

        console.log(`Total deposited ${totalDeposited}`);
        console.log(`Total asset: ${await sDusd.totalAssets()}`);

        expect(davosBalanceBefore.sub(davosBalanceAfter)).to.be.eq(saveAmount);
        expect(shares).to.be.closeTo(saveAmount.mul(ray).div(chi), 10);
        expect(await sDusd.totalAssets()).to.be.closeTo(totalShares.mul(chi).div(ray), 10);
      })
    })

    args.forEach(function (arg) {
      it(`mint sDusd ${arg.name}`, async function () {
        const signer = arg.signer();
        const receiver = arg.receiver();
        const borrowed = await interaction.depositAndBorrowMax(signer, arg.amount);
        const saveAmount = borrowed.mul(99).div(100);

        const davosBalanceBefore = await davos.balanceOf(signer.address);
        const sdusdBalanceBefore = await sDusd.balanceOf(receiver.address);

        await davos.connect(signer).approve(sDusd.address, borrowed);
        await sDusd.connect(signer)['mint(uint256,address)'](saveAmount, receiver.address);
        const chi = await pot.chi();

        const davosBalanceAfter = await davos.balanceOf(signer.address);
        const sdusdBalanceAfter = await sDusd.balanceOf(receiver.address);
        totalShares = totalShares.add(saveAmount);

        console.log(`Total asset: ${await sDusd.totalAssets()}`);

        expect(sdusdBalanceAfter.sub(sdusdBalanceBefore)).to.be.eq(saveAmount);
        expect(davosBalanceBefore.sub(davosBalanceAfter)).to.be.closeTo(saveAmount.mul(chi).div(ray), 1);
        expect(await sDusd.totalAssets()).to.be.closeTo(totalShares.mul(chi).div(ray), 10);
      })
    })

    it('Reverts: deposit to 0 address', async function() {
      const signer = signer1;
      const receiver = '0x0000000000000000000000000000000000000000';
      const saveAmount = await interaction.depositAndBorrowMax(signer, parseEther('75'));

      await davos.connect(signer).approve(sDusd.address, saveAmount);
      await expect(sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, receiver))
        .to.be.revertedWith('SavingsDUSD/invalid-address');
    })

    it('Reverts: deposit insufficient balance', async function() {
      await networkSnapshotter.revert();
      const signer = signer1;
      const receiver = signer1;
      let saveAmount = await interaction.depositAndBorrowMax(signer, parseEther('75'));
      saveAmount = saveAmount.add(parseEther('1'));
      console.log(`Deposit amount: ${saveAmount}`);

      await davos.connect(signer).approve(sDusd.address, saveAmount);
      await expect(sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, receiver.address))
        .to.be.revertedWith('Davos/insufficient-balance');
    })

    it('Reverts: deposit insufficient allowance', async function() {
      await networkSnapshotter.revert();
      const signer = signer1;
      const receiver = signer1;
      const saveAmount = await interaction.depositAndBorrowMax(signer, parseEther('75'));
      console.log(`Deposit amount: ${saveAmount}`);

      await expect(sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, receiver.address))
        .to.be.revertedWith('Davos/insufficient-allowance');
    })

  })

  describe('Deposit and earn', async () => {

    before(async function () {
      await networkSnapshotter.revert();
    })

    it('Deposit and gain rewards', async function () {
      await interaction.setCollateralDuty(collateralToken.address, "1000000000315522921573372069");
      const signer = signer1;
      const receiver = signer1;
      await interaction.depositAndBorrowMax(signer, parseEther('100'));
      const saveAmount = parseEther('10');

      await davos.connect(signer).approve(sDusd.address, saveAmount);
      await sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, receiver.address);
      const davosBalanceBefore = await davos.balanceOf(signer.address);
      const sdusdBalanceBefore = await sDusd.balanceOf(receiver.address);
      console.log(`davosBalanceBefore: ${davosBalanceBefore}`);
      console.log(`sdusdBalanceBefore: ${sdusdBalanceBefore}`);
      console.log(`vat.vice: ${await vat.vice()}`);

      const chi = await pot.chi();
      await advanceTime(365 * 86400);
      const maxRedeem = await sDusd.maxRedeem(signer.address);
      await sDusd.connect(signer).redeem(maxRedeem, receiver.address, signer.address);

      const davosBalanceAfter = await davos.balanceOf(signer.address);
      const sdusdBalanceAfter = await sDusd.balanceOf(receiver.address);
      console.log(`davosBalanceAfter: ${davosBalanceAfter}`);
      console.log(`sdusdBalanceAfter: ${sdusdBalanceAfter}`);
      console.log(`vat.vice: ${await vat.vice()}`);
      console.log(`Total asset: ${await sDusd.totalAssets()}`);

      //Pay off
      const debt = (await vat.vice());
      const debtWad = debt.div(ray).add(1);
      console.log(`debt in wad: ${debtWad}`);

      await davos.mint(signer2.address, debtWad);
      await davos.connect(signer2).approve(vow.address, debtWad);
      await vow.connect(signer2).feed(debtWad);

      await vow.connect(signer2).heal(debt);
      console.log(`vat.vice: ${await vat.vice()}`);

      // expect(sdusdBalanceAfter.sub(sdusdBalanceBefore)).to.be.eq(saveAmount);
      // expect(davosBalanceBefore.sub(davosBalanceAfter)).to.be.closeTo(saveAmount.mul(chi).div(ray), 1);
      // expect(await sDusd.totalAssets()).to.be.closeTo(totalShares.mul(chi).div(ray), 10);
    })


  })

  describe('Withdraw and redeem sDusd', async () => {

    before(async function () {
      await networkSnapshotter.revert();
    })

    const args = [
      {
        name: '0',
        signer: () => signer1,
        receiver: () => signer1,
        depositAmount: parseEther('100'),
        withdrawAmount: toBN(0),
      },
      {
        name: '1',
        signer: () => signer1,
        receiver: () => signer1,
        depositAmount: parseEther('100'),
        withdrawAmount: toBN(1),
      },
      {
        name: 'half',
        signer: () => signer1,
        receiver: () => signer1,
        depositAmount: parseEther('100'),
        withdrawPercent: 50,
      },
      {
        name: 'all',
        signer: () => signer1,
        receiver: () => signer2,
        depositAmount: parseEther('100'),
        withdrawPercent: 100,
      },
    ]

    args.forEach(function (arg) {
      it(`Redeem shares: ${arg.name}`, async function () {
        const signer = arg.signer();
        const receiver = arg.receiver();
        const saveAmount = await interaction.depositAndBorrowMax(signer, arg.depositAmount);

        await davos.connect(signer).approve(sDusd.address, saveAmount);
        await sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, signer.address);

        await advanceTime(365 * 86400);
        const sdusdBalanceBefore = await sDusd.balanceOf(signer.address);
        const davosBalanceBefore = await davos.balanceOf(receiver.address);
        console.log(`davosBalanceBefore ${davosBalanceBefore}`);

        let withdrawAmount = arg.withdrawAmount;
        if (arg.withdrawPercent !== undefined) {
          withdrawAmount = sdusdBalanceBefore.mul(arg.withdrawPercent).div(100);
        }
        console.log(`Withdraw amount: ${withdrawAmount}`);

        const maxRedeem = await sDusd.maxRedeem(signer.address);
        await sDusd.connect(signer).redeem(withdrawAmount, receiver.address, signer.address);
        const preview = await sDusd.connect(signer).previewRedeem(withdrawAmount);
        const chi = await pot.chi();

        const sdusdBalanceAfter = await sDusd.balanceOf(signer.address);
        const davosBalanceAfter = await davos.balanceOf(receiver.address);
        console.log(`davosBalanceAfter ${davosBalanceAfter}`);
        console.log(`sdusdBalanceAfter ${sdusdBalanceAfter}`);
        console.log(`earnings ${davosBalanceAfter.sub(saveAmount)}`);
        console.log(`Total assets: ${await sDusd.totalAssets()}`);

        expect(sdusdBalanceBefore.sub(sdusdBalanceAfter)).to.be.eq(withdrawAmount);
        expect(davosBalanceAfter.sub(davosBalanceBefore)).to.be.closeTo(withdrawAmount.mul(chi).div(ray), 1);
        expect(preview).to.be.eq(davosBalanceAfter.sub(davosBalanceBefore));
        expect(maxRedeem).to.be.eq(sdusdBalanceBefore);
      })
    })

    args.forEach(function (arg) {
      it(`Withdraw amount: ${arg.name}`, async function () {
        const signer = arg.signer();
        const receiver = arg.receiver();
        const saveAmount = await interaction.depositAndBorrowMax(signer, arg.depositAmount);

        await davos.connect(signer).approve(sDusd.address, saveAmount);
        await sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, signer.address);

        await advanceTime(365 * 86400);
        const sdusdBalanceBefore = await sDusd.balanceOf(signer.address);
        const davosBalanceBefore = await davos.balanceOf(receiver.address);

        let withdrawAmount = arg.withdrawAmount;
        if (arg.withdrawPercent !== undefined) {
          withdrawAmount = await sDusd.previewRedeem(sdusdBalanceBefore.mul(arg.withdrawPercent).div(100));
        }
        console.log(`Withdraw amount: ${withdrawAmount}`);

        await sDusd.connect(signer).withdraw(withdrawAmount, receiver.address, signer.address);
        const preview = await sDusd.connect(signer).previewWithdraw(withdrawAmount);
        const chi = await pot.chi();

        const sdusdBalanceAfter = await sDusd.balanceOf(signer.address);
        const davosBalanceAfter = await davos.balanceOf(receiver.address);
        console.log(`davosBalanceAfter ${davosBalanceAfter}`);
        console.log(`sdusdBalanceAfter ${sdusdBalanceAfter}`);
        console.log(`Total assets: ${await sDusd.totalAssets()}`);

        expect(sdusdBalanceBefore.sub(sdusdBalanceAfter)).to.be.closeTo(withdrawAmount.mul(ray).div(chi), 1);
        expect(davosBalanceAfter.sub(davosBalanceBefore)).to.be.eq(withdrawAmount);
        expect(preview).to.be.eq(sdusdBalanceBefore.sub(sdusdBalanceAfter));
      })
    })

    it('Reverts: withdraw to 0 address', async function() {
      const signer = signer1;
      const receiver = '0x0000000000000000000000000000000000000000';
      const saveAmount = await interaction.depositAndBorrowMax(signer, parseEther('75'));

      await davos.connect(signer).approve(sDusd.address, saveAmount);
      await sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, signer.address);
      const sdusdBalance = await sDusd.balanceOf(signer.address);

      const withdrawAmount = await sDusd.previewRedeem(sdusdBalance);
      await expect(sDusd.connect(signer).withdraw(withdrawAmount, receiver, signer.address))
        .to.be.revertedWith('Davos/mint-to-zero-address');
    })

    it('Reverts: redeem to 0 address', async function() {
      const signer = signer1;
      const receiver = '0x0000000000000000000000000000000000000000';
      const saveAmount = await interaction.depositAndBorrowMax(signer, parseEther('75'));

      await davos.connect(signer).approve(sDusd.address, saveAmount);
      await sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, signer.address);
      const sdusdBalance = await sDusd.balanceOf(signer.address);

      await expect(sDusd.connect(signer).redeem(sdusdBalance, receiver, signer.address))
        .to.be.revertedWith('Davos/mint-to-zero-address');
    })

    it('Reverts: withdraw insufficient balance', async function() {
      const signer = signer1;
      const receiver = signer1;
      const saveAmount = await interaction.depositAndBorrowMax(signer, parseEther('75'));

      await davos.connect(signer).approve(sDusd.address, saveAmount);
      await sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, signer.address);
      const sdusdBalance = await sDusd.balanceOf(signer.address);

      const withdrawAmount = await sDusd.previewRedeem(sdusdBalance);
      await expect(sDusd.connect(signer).withdraw(withdrawAmount.add(parseEther('1')), receiver.address, signer.address))
        .to.be.revertedWith('SavingsDUSD/insufficient-balance');
    })

    it('Reverts: redeem insufficient balance', async function() {
      const signer = signer1;
      const receiver = signer1;
      const saveAmount = await interaction.depositAndBorrowMax(signer, parseEther('75'));

      await davos.connect(signer).approve(sDusd.address, saveAmount);
      await sDusd.connect(signer)['deposit(uint256,address)'](saveAmount, signer.address);
      const sdusdBalance = await sDusd.balanceOf(signer.address);

      await expect(sDusd.connect(signer).redeem(sdusdBalance.add(parseEther('1')), receiver.address, signer.address))
        .to.be.revertedWith('SavingsDUSD/insufficient-balance');
    })

  })

});

const currentTime = async () => {
  const block = await ethers.provider.getBlock('latest');
  return block.timestamp;
}