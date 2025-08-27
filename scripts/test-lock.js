const { ethers } = require("hardhat");

async function main() {
  console.log("Testing HodlVault lock functionality...\n");

  // Get the deployed contract address from .env
  const VAULT_ADDRESS = "0x127eb266727f6Db226703b44d951E1ED51B0d09b";
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Testing with account:", signer.address);

  // Get contract instance
  const HodlVault = await ethers.getContractFactory("HodlVault");
  const vault = HodlVault.attach(VAULT_ADDRESS);

  // Test token addresses on Base
  const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // Check contract state
  console.log("\nContract State:");
  console.log("- Total locks:", await vault.totalLocks());
  console.log("- Lock ID counter:", await vault.lockIdCounter());

  // Check allowed durations
  console.log("\nAllowed Durations:");
  console.log("- 1 Month:", await vault.ONE_MONTH(), "seconds");
  console.log("- 6 Months:", await vault.SIX_MONTHS(), "seconds");
  console.log("- 1 Year:", await vault.ONE_YEAR(), "seconds");
  console.log("- 3 Years:", await vault.THREE_YEARS(), "seconds");
  console.log("- 10 Years:", await vault.TEN_YEARS(), "seconds");

  // Get user's locks
  console.log("\nUser's Current Locks:");
  const userLocks = await vault.getUserLocks(signer.address);
  console.log("- Total locks for user:", userLocks.length);
  
  if (userLocks.length > 0) {
    console.log("\nLock Details:");
    userLocks.forEach((lock, index) => {
      console.log(`Lock ${index}:`);
      console.log(`  - Token: ${lock.token}`);
      console.log(`  - Amount: ${ethers.formatUnits(lock.amount, 18)}`);
      console.log(`  - Unlock Time: ${new Date(Number(lock.unlockTime) * 1000).toISOString()}`);
      console.log(`  - Claimed: ${lock.claimed}`);
    });
  }

  console.log("\n✅ Contract is ready for locking tokens!");
  console.log("\nIMPORTANT: To test locking:");
  console.log("1. Make sure you have some WETH or USDC tokens");
  console.log("2. Approve the vault contract to spend your tokens");
  console.log("3. Call lockTokens with the token address, amount, and duration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });