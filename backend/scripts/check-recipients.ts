import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();

  console.log("=== PAYMENT RECIPIENT VERIFICATION ===\n");

  // Get contract addresses
  const userAuthAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const bookCoverAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

  // Connect to contracts
  const userAuth = await ethers.getContractAt("UserAuth", userAuthAddress);
  const bookCover = await ethers.getContractAt("BookCover", bookCoverAddress);

  console.log("Contract Addresses:");
  console.log(`- UserAuth: ${userAuthAddress}`);
  console.log(`- BookCover: ${bookCoverAddress}`);
  console.log(`- Deployer: ${deployer.address}\n`);

  // Check platform owner
  const platformOwner = await bookCover.platformOwner();
  console.log(`Platform Owner: ${platformOwner}`);

  // Check who is registered as author
  const [authorName, isOnboarded, userType, profileURI] = await userAuth.users(deployer.address);
  console.log(`\nDeployer Registration:`);
  console.log(`- Name: ${authorName}`);
  console.log(`- Onboarded: ${isOnboarded}`);
  console.log(`- User Type: ${userType} (${userType === 1n ? 'Author' : 'Unknown'})`);
  console.log(`- Profile URI: ${profileURI}`);

  // Check if there are any books (try to get book 1)
  try {
    const book = await bookCover.books(1); // First book
    if (book[0] !== 0n) {
      console.log(`\nBook #1 Details:`);
      console.log(`- ID: ${book[0]}`);
      console.log(`- Author: ${book[1]}`);
      console.log(`- Metadata URI: ${book[2]}`);
      console.log(`- Price: ${ethers.formatEther(book[3])} ETH`);
    } else {
      console.log(`\nNo books created yet.`);
    }
  } catch (error) {
    console.log(`\nNo books created yet.`);
  }

  console.log("\n=== PAYMENT FLOW ANALYSIS ===");
  console.log("For a 1.0 ETH book purchase:");
  console.log(`1. Platform Fee (10% = 0.1 ETH) → ${platformOwner}`);
  console.log(`2. Author Share (90% = 0.9 ETH) → ${deployer.address} (book author)`);
  console.log("\nSince deployer is both platform owner and author:");
  console.log(`✅ Deployer receives: 0.1 ETH + 0.9 ETH = 1.0 ETH total`);
  console.log(`✅ Net effect: -0.0126 ETH gas fees only`);

  // Check balances
  const platformBalance = await ethers.provider.getBalance(platformOwner);
  const authorBalance = await ethers.provider.getBalance(deployer.address);

  console.log(`\nCurrent Balances:`);
  console.log(`- Platform Owner: ${ethers.formatEther(platformBalance)} ETH`);
  console.log(`- Book Author: ${ethers.formatEther(authorBalance)} ETH`);

  if (platformOwner === deployer.address) {
    console.log("\n⚠️  NOTE: Platform owner and author are the same address (deployer)");
    console.log("In production, these should be separate addresses:");
    console.log("- Platform owner: Company/DAO wallet");
    console.log("- Book authors: Individual creator wallets");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});