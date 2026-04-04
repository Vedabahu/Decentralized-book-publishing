import { ethers } from "ethers";
import abi from "../artifacts/contracts/BookCover.sol/BookCover.json";
import userAuthAbi from "../artifacts/contracts/User.sol/UserAuth.json";

export function getContract(signer: ethers.Signer) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_BOOK_COVER_ADDRESS!,
    abi.abi,
    signer
  );
}

export function getReadonlyContract(provider: ethers.Provider) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_BOOK_COVER_ADDRESS!,
    abi.abi,
    provider
  );
}

export function getUserAuthContract(signer: ethers.Signer) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_USER_AUTH_ADDRESS!,
    userAuthAbi.abi,
    signer
  );
}

export function getReadonlyUserAuthContract(provider: ethers.Provider) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_USER_AUTH_ADDRESS!,
    userAuthAbi.abi,
    provider
  );
}