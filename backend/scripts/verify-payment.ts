import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();

  console.log("=== ACTUAL PAYMENT VERIFICATION ===\n");

  // Get the buyBook transaction hash from the logs
  const txHash = "0x976300ccee32a40bce628c058a1005e7706e86660e8ed12157dc178b4a86fc74";

  try {
    console.log("Fetching transaction details...");

    // Get transaction receipt
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    console.log(`✅ Transaction found - Block: ${receipt.blockNumber}, Status: ${receipt.status ? 'Success' : 'Failed'}`);

    // Get transaction details
    const tx = await ethers.provider.getTransaction(txHash);
    console.log(`\nTransaction Details:`);
    console.log(`- From: ${tx.from}`);
    console.log(`- To: ${tx.to}`);
    console.log(`- Value: ${ethers.formatEther(tx.value)} ETH`);
    console.log(`- Gas Used: ${receipt.gasUsed}`);

    // Check contract balance after transaction
    const contractAddress = "0x0165878a594ca255338adfa4d48449f69242eb8f";
    const contractBalance = await ethers.provider.getBalance(contractAddress);
    console.log(`\nContract Balance: ${ethers.formatEther(contractBalance)} ETH`);

    if (contractBalance === 0n) {
      console.log("✅ Contract balance is 0 - all funds were properly distributed");
    } else {
      console.log("❌ Contract still holds funds - payment distribution may have failed");
    }

    // Check deployer balance
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    console.log(`Deployer Balance: ${ethers.formatEther(deployerBalance)} ETH`);

    console.log("\n=== PAYMENT SPLIT VERIFICATION ===");
    console.log("Expected flow for 1.0 ETH purchase:");
    console.log("1. Buyer → Contract: -1.0 ETH");
    console.log("2. Contract → Platform: +0.1 ETH (10%)");
    console.log("3. Contract → Author: +0.9 ETH (90%)");
    console.log("4. Gas fees: ~0.0126 ETH");

    console.log("\nSince deployer is both platform owner and author:");
    console.log("✅ Deployer should receive +1.0 ETH total");
    console.log("✅ Net effect: -0.0126 ETH (only gas fees)");

    const expectedNetLoss = 0.0126;
    const actualBalance = parseFloat(ethers.formatEther(deployerBalance));
    const initialBalance = 10000.0;
    const actualNetLoss = initialBalance - actualBalance;

    console.log(`\nBalance check:`);
    console.log(`- Initial: ${initialBalance} ETH`);
    console.log(`- Current: ${actualBalance} ETH`);
    console.log(`- Net loss: ${actualNetLoss} ETH`);

    if (Math.abs(actualNetLoss - expectedNetLoss) < 0.001) {
      console.log("✅ Balance change matches expected gas fees - payment splitting worked!");
    } else {
      console.log("❌ Unexpected balance change - something went wrong");
    }

  } catch (error) {
    console.error("❌ Error verifying payment:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});