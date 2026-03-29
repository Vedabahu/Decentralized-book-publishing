import { network } from "hardhat";

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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
