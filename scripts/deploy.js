const hre = require("hardhat");

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n🚀 Deploying HodlVault contract...");
  console.log("📍 Network:", hre.network.name);
  console.log("👤 Deployer:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // Deploy HodlVault
  console.log("⚡ Deploying HodlVault...");
  const HodlVault = await hre.ethers.getContractFactory("HodlVault");
  const vault = await HodlVault.deploy();
  
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  
  console.log("✅ HodlVault deployed to:", vaultAddress);
  
  // Wait for confirmations
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n⏳ Waiting for block confirmations...");
    await vault.deploymentTransaction().wait(5);
    console.log("✅ Confirmed!");
    
    // Verify contract on Etherscan
    console.log("\n🔍 Verifying contract on Etherscan...");
    console.log("   Using Etherscan v2 API with chain ID:", hre.network.config.chainId);
    
    try {
      await hre.run("verify:verify", {
        address: vaultAddress,
        constructorArguments: [],
        contract: "contracts/HodlVault.sol:HodlVault",
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("ℹ️  Contract already verified!");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log("\n💡 Try manual verification:");
        console.log(`   npx hardhat run scripts/verify.js --network ${hre.network.name} ${vaultAddress}`);
        console.log("\n   Or verify manually at:");
        const explorerUrl = hre.network.name === "base" 
          ? `https://basescan.org/address/${vaultAddress}#code`
          : `https://sepolia.basescan.org/address/${vaultAddress}#code`;
        console.log(`   ${explorerUrl}`);
      }
    }
  }
  
  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📄 DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log("Network:        ", hre.network.name);
  console.log("Contract:       ", "HodlVault");
  console.log("Address:        ", vaultAddress);
  console.log("Deployer:       ", deployer.address);
  console.log("=".repeat(50));
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contract: "HodlVault",
    address: vaultAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };
  
  console.log("\n📝 Deployment info saved:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Instructions for next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Update the contract address in your frontend (.env.local):");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${vaultAddress}`);
  console.log("2. Test the contract with small amounts first");
  
  if (hre.network.name === "baseSepolia") {
    console.log("\n🌐 Useful Links:");
    console.log(`Contract on Base Sepolia Explorer: https://sepolia.basescan.org/address/${vaultAddress}`);
    console.log(`Get test ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet`);
  } else if (hre.network.name === "base") {
    console.log("\n🌐 Useful Links:");
    console.log(`Contract on Base Explorer: https://basescan.org/address/${vaultAddress}`);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });