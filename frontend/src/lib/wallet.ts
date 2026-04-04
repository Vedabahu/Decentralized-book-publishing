import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const HARDHAT_CHAIN_ID = "0x7a69"; // Hex for 31337

export async function connectWallet() {
  if (!window.ethereum) throw new Error("No wallet found");

  try {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    if (currentChainId !== HARDHAT_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: HARDHAT_CHAIN_ID }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: HARDHAT_CHAIN_ID,
                chainName: "Hardhat Localhost",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["http://127.0.0.1:8545/"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }
  } catch (e) {
    console.error("Failed to switch to Hardhat network", e);
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}
