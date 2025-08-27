const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in .env file");
    process.exit(1);
  }

  try {
    // Remove 0x prefix if present
    const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
      ? process.env.PRIVATE_KEY.slice(2) 
      : process.env.PRIVATE_KEY;
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    
    console.log("\n✅ Wallet Configuration Valid!");
    console.log("📍 Wallet Address:", wallet.address);
    console.log("🔑 Private Key Format: Correct");
    
    // Connect to provider to check balance
    const [signer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(signer.address);
    
    console.log("\n💰 Wallet Balance on", hre.network.name);
    console.log("   Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.log("\n⚠️  Your wallet has no ETH!");
      console.log("   Get Base Sepolia test ETH from:");
      console.log("   https://www.coinbase.com/faucets/base-sepolia-faucet");
    } else {
      console.log("\n✅ Ready to deploy!");
    }
    
  } catch (error) {
    console.error("\n❌ Invalid private key format!");
    console.error("   Error:", error.message);
    console.log("\n💡 Make sure your private key:");
    console.log("   - Is 64 hex characters long");
    console.log("   - Contains only 0-9 and a-f characters");
    console.log("   - Can include or exclude 0x prefix");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });