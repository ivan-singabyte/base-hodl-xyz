const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing deployment on local Hardhat network...\n");

  // Deploy HodlVault
  const HodlVault = await hre.ethers.getContractFactory("HodlVault");
  const vault = await HodlVault.deploy();
  await vault.waitForDeployment();
  
  const vaultAddress = await vault.getAddress();
  console.log("✅ HodlVault deployed to:", vaultAddress);
  
  // Deploy test tokens for testing
  console.log("\n📦 Deploying test tokens...");
  
  const TestERC20 = await hre.ethers.getContractFactory("TestERC20");
  
  const testToken1 = await TestERC20.deploy(
    "Test USDC",
    "USDC",
    hre.ethers.parseEther("1000000")
  );
  await testToken1.waitForDeployment();
  console.log("✅ Test USDC deployed to:", await testToken1.getAddress());
  
  const testToken2 = await TestERC20.deploy(
    "Test WETH",
    "WETH",
    hre.ethers.parseEther("1000000")
  );
  await testToken2.waitForDeployment();
  console.log("✅ Test WETH deployed to:", await testToken2.getAddress());
  
  // Test basic functionality
  console.log("\n🧪 Testing basic functionality...");
  
  const [deployer, user1] = await hre.ethers.getSigners();
  
  // Transfer some tokens to user1
  await testToken1.transfer(user1.address, hre.ethers.parseEther("1000"));
  console.log("✅ Transferred 1000 USDC to user1");
  
  // User1 approves and locks tokens
  const amount = hre.ethers.parseEther("100");
  await testToken1.connect(user1).approve(vaultAddress, amount);
  console.log("✅ User1 approved vault to spend USDC");
  
  const lockTx = await vault.connect(user1).lockTokens(
    await testToken1.getAddress(),
    amount,
    30 * 24 * 60 * 60 // 1 month
  );
  await lockTx.wait();
  console.log("✅ User1 locked 100 USDC for 1 month");
  
  // Check user's locks
  const locks = await vault.getUserLocks(user1.address);
  console.log("✅ User1 has", locks.length, "lock(s)");
  
  // Print deployment summary
  console.log("\n" + "=".repeat(50));
  console.log("📄 LOCAL DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log("HodlVault:      ", vaultAddress);
  console.log("Test USDC:      ", await testToken1.getAddress());
  console.log("Test WETH:      ", await testToken2.getAddress());
  console.log("=".repeat(50));
  console.log("\n✨ Local deployment and testing completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });