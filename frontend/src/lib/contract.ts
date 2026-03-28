import { ethers } from "ethers";
import abi from "../artifacts/contracts/BookCover.sol/BookCover.json";

export function getContract(signer: ethers.Signer) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    abi.abi,
    signer
  );
}