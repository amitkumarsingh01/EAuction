const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleAuction contract...");

  // Get the contract factory
  const SimpleAuction = await hre.ethers.getContractFactory("SimpleAuction");
  
  // Deploy the contract
  const auction = await SimpleAuction.deploy();
  
  // Wait for deployment
  await auction.waitForDeployment();
  
  const address = await auction.getAddress();
  
  console.log("✅ SimpleAuction deployed to:", address);
  console.log("📋 Contract Address:", address);
  console.log("🔗 Network:", hre.network.name);
  console.log("📝 Save this address for frontend integration!");
  
  // If deploying to testnet, verify the contract
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await auction.deploymentTransaction().wait(5);
    
    console.log("🔍 Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

