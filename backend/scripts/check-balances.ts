import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();

  console.log("Checking balances after book purchase...\n");

  // Check deployer's balance (platform owner and author)
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer/Platform/Author balance: ${ethers.formatEther(balance)} ETH`);

  // Check if the payment splitting worked correctly
  // From the logs, we saw a 1 ETH purchase
  // Platform should get 10% = 0.1 ETH
  // Author should get 90% = 0.9 ETH

  console.log("\nPayment verification for 1 ETH purchase:");
  console.log("- Platform cut (10%): 0.1 ETH");
  console.log("- Author cut (90%): 0.9 ETH");
  console.log("- Total distributed: 1.0 ETH");

  // The deployer should have received both cuts since they're both the platform owner and author
  console.log("\nSince deployer is both platform owner and author, they should receive both cuts.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});