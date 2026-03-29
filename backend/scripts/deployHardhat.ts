import { network } from "hardhat";

async function main() {
  // Hardhat 3 with ESM uses network.connect() to expose plugins like ethers
  const { ethers } = await network.connect();
  
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy UserAuth
  const UserAuth = await ethers.getContractFactory("UserAuth");
  const userAuth = await UserAuth.deploy();
  await userAuth.waitForDeployment();
  const userAuthAddress = await userAuth.getAddress();
  
  console.log("UserAuth deployed to:", userAuthAddress);

  // 2. Deploy BookCover
  const BookCover = await ethers.getContractFactory("BookCover");
  const bookCover = await BookCover.deploy(userAuthAddress);
  await bookCover.waitForDeployment();
  const bookCoverAddress = await bookCover.getAddress();

  console.log("BookCover deployed to:", bookCoverAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
