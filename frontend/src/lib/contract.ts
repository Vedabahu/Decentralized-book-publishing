import { ethers } from "ethers";
import { loadContractAddresses } from "./abi-loader";

// Fallback static ABIs (load from shared artifacts folder mounted by Docker)
import abi from "../../public/shared/artifacts/contracts/BookCover.sol/BookCover.json";
import userAuthAbi from "../../public/shared/artifacts/contracts/User.sol/UserAuth.json";

export function getContract(signer: ethers.Signer) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_BOOK_COVER_ADDRESS!,
    abi.abi,
    signer,
  );
}

export function getReadonlyContract(provider: ethers.Provider) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_BOOK_COVER_ADDRESS!,
    abi.abi,
    provider,
  );
}

export function getUserAuthContract(signer: ethers.Signer) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_USER_AUTH_ADDRESS!,
    userAuthAbi.abi,
    signer,
  );
}

export function getReadonlyUserAuthContract(provider: ethers.Provider) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_USER_AUTH_ADDRESS!,
    userAuthAbi.abi,
    provider,
  );
}

/**
 * Dynamically load contract with addresses from shared folder
 * This is used in Docker environment where addresses are deployed at runtime
 */
export async function getContractWithDynamicAddress(
  signer: ethers.Signer
) {
  const addresses = await loadContractAddresses();
  return new ethers.Contract(addresses.BookCover, abi.abi, signer);
}

export async function getReadonlyContractWithDynamicAddress(
  provider: ethers.Provider
) {
  const addresses = await loadContractAddresses();
  return new ethers.Contract(addresses.BookCover, abi.abi, provider);
}

export async function getUserAuthContractWithDynamicAddress(
  signer: ethers.Signer
) {
  const addresses = await loadContractAddresses();
  return new ethers.Contract(addresses.UserAuth, userAuthAbi.abi, signer);
}

export async function getReadonlyUserAuthContractWithDynamicAddress(
  provider: ethers.Provider
) {
  const addresses = await loadContractAddresses();
  return new ethers.Contract(
    addresses.UserAuth,
    userAuthAbi.abi,
    provider
  );
}
