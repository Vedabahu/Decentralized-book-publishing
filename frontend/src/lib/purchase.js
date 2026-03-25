import { ethers } from "ethers";
import { CONTRACT_ADDRESS, getContract } from "./contract";

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function emitStatus(onStatus, message, waitMs = 0) {
  if (typeof onStatus === "function") {
    onStatus(message);
  }

  if (waitMs > 0) {
    await delay(waitMs);
  }
}

function isPlaceholderAddress(address) {
  return String(address).toLowerCase() === "0x0000000000000000000000000000000000000000";
}

function isInsufficientFundsError(error) {
  const errorCode = error?.code ?? error?.info?.error?.code;
  return errorCode === "INSUFFICIENT_FUNDS" || errorCode === -32000;
}

export async function buyBookWithEth(bookId, price, options = {}) {
  const { onStatus } = options;
  const placeholderContract = isPlaceholderAddress(CONTRACT_ADDRESS);

  await emitStatus(onStatus, "Preparing transaction...", 500);
  await emitStatus(onStatus, "Awaiting wallet confirmation...", 700);

  if (placeholderContract) {
    await emitStatus(onStatus, "Processing transaction...", 900);
    return { success: true, demoMode: true, message: "Demo mode purchase successful" };
  }

  try {
    if (typeof window === "undefined" || !window.ethereum) {
      return { success: false, message: "Wallet not available" };
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const contract = await getContract();
    const tx = await contract.buyBook(bookId, {
      value: ethers.parseEther(String(price)),
    });
    await emitStatus(onStatus, "Processing transaction...");
    await tx.wait();

    return { success: true, demoMode: false, message: "Purchase successful" };
  } catch (error) {
    console.error("Buy flow failed:", error);
    if (isInsufficientFundsError(error)) {
      return { success: false, insufficientFunds: true, message: "Not enough ETH in wallet", error };
    }

    return { success: false, message: "Purchase failed", error };
  }
}
