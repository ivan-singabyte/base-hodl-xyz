const hre = require("hardhat");

async function main() {
  // Get the contract address from command line arguments
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.error("❌ Please provide the contract address as an argument");
    console.log("Usage: npx hardhat run scripts/verify.js --network baseSepolia CONTRACT_ADDRESS");
    process.exit(1);
  }

  console.log("\n🔍 Verifying HodlVault contract...");
  console.log("📍 Network:", hre.network.name);
  console.log("📝 Contract Address:", contractAddress);
  console.log("🔑 Chain ID:", hre.network.config.chainId);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/HodlVault.sol:HodlVault",
    });
    
    console.log("✅ Contract verified successfully!");
    
    const explorerUrl = hre.network.name === "baseSepolia" 
      ? `https://sepolia.basescan.org/address/${contractAddress}#code`
      : `https://basescan.org/address/${contractAddress}#code`;
    
    console.log("\n🌐 View on Explorer:");
    console.log(explorerUrl);
    
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("ℹ️  Contract is already verified!");
      
      const explorerUrl = hre.network.name === "baseSepolia" 
        ? `https://sepolia.basescan.org/address/${contractAddress}#code`
        : `https://basescan.org/address/${contractAddress}#code`;
      
      console.log("\n🌐 View on Explorer:");
      console.log(explorerUrl);
    } else {
      console.error("❌ Verification failed:", error.message);
      console.log("\n💡 Troubleshooting tips:");
      console.log("1. Make sure ETHERSCAN_API_KEY is set in .env");
      console.log("2. Wait a minute after deployment before verifying");
      console.log("3. Check that the contract address is correct");
      console.log("4. Try manual verification at https://sepolia.basescan.org/verifyContract");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });