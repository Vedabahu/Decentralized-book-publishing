import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();
  
  console.log("Deployer:", deployer.address);

  // 1. Deploy UserAuth
  const UserAuth = await ethers.getContractFactory("UserAuth");
  const userAuth = await UserAuth.deploy();
  await userAuth.waitForDeployment();
  const userAuthAddress = await userAuth.getAddress();
  console.log("UserAuth:", userAuthAddress);

  // 2. Deploy BookCover
  const BookCover = await ethers.getContractFactory("BookCover");
  const bookCover = await BookCover.deploy(userAuthAddress);
  await bookCover.waitForDeployment();
  const bookCoverAddress = await bookCover.getAddress();
  console.log("BookCover:", bookCoverAddress);

  // 3. Register deployer as Author
  console.log("Registering Deployer as Author...");
  const tx = await userAuth.setUserInfo("AdminAuthor", 1, "ipfs://profile");
  await tx.wait();
  console.log("Registered!");

  // 4. Output addresses to JSON file
  const addresses = {
    Deployer: deployer.address,
    UserAuth: userAuthAddress,
    BookCover: bookCoverAddress,
  };

  // Create shared directory if it doesn't exist
  const sharedDir = "/shared";
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  // Write addresses to JSON file
  const addressesFile = path.join(sharedDir, "addresses.json");
  fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));
  console.log("Addresses written to:", addressesFile);
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
