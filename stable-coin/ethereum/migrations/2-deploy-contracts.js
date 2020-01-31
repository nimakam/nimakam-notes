const PeggedToken = artifacts.require("PeggedToken");
const System = artifacts.require("System");
const SystemLoans = artifacts.require("SystemLoans");
const SystemFeeds = artifacts.require("SystemFeeds");
const SystemSavings = artifacts.require("SystemSavings");
const SystemLiquidations = artifacts.require("SystemLiquidations");

const TOKEN_DECIMALS = 18;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


module.exports = async function(deployer) {
  await deployer.deploy(PeggedToken, (10 ** TOKEN_DECIMALS).toString(), "PegDollar", TOKEN_DECIMALS, "PGUSD");
  let peggedToken = await PeggedToken.deployed();

  await deployer.deploy(System, peggedToken.address);
  let system = await System.deployed();

  await deployer.deploy(SystemFeeds, peggedToken.address, system.address);
  let systemFeeds = await SystemFeeds.deployed();

  await deployer.deploy(SystemSavings, peggedToken.address, system.address, systemFeeds.address);
  let systemSavings = await SystemSavings.deployed();

  await deployer.deploy(SystemLoans, peggedToken.address, system.address, systemFeeds.address, systemSavings.address);
  let systemLoans = await SystemLoans.deployed(); 

  await deployer.deploy(SystemLiquidations, peggedToken.address, system.address, systemLoans.address);
  let systemLiquidations = await SystemLiquidations.deployed(); 

  await peggedToken.initialize(system.address, systemLoans.address); 
  
  await system.initialize(systemFeeds.address, systemLoans.address, systemSavings.address, systemLiquidations.address);

  await systemSavings.initialize(systemLoans.address); 
  
  //await systemFeeds.initialize(systemLoans.address, systemSavings.address); 
  await systemFeeds.initialize(systemLoans.address); 

  // await deployer.deploy(Loan, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS);
  // await deployer.deploy(PriceFeed, ZERO_ADDRESS, ZERO_ADDRESS);

  //await systemLoans.initialize(system.address);  
};