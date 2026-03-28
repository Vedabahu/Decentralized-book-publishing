import { ethers } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) throw new Error("No wallet found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}