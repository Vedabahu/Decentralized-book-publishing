import { BrowserProvider, Contract } from "ethers";

export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

export const CONTRACT_ABI = [
  "function getBook(uint256 bookId) view returns (tuple(uint256 id, string metadataURI, uint256 price))",
  "function buyBook(uint256 bookId) payable",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
];

export function getProvider() {
  if (typeof window === "undefined") {
    throw new Error("Wallet access is only available in the browser.");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }

  return new BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  return provider.getSigner();
}

export async function getContract() {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
