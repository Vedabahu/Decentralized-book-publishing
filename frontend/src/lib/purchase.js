import { ethers } from "ethers";
import { CONTRACT_ADDRESS, getContract } from "./contract";

function isUserRejectedError(error) {
  const errorCode = error?.code ?? error?.info?.error?.code;
  const errorMessage = `${error?.shortMessage ?? ""} ${error?.message ?? ""}`.toLowerCase();

  return (
    errorCode === 4001 ||
    errorCode === "ACTION_REJECTED" ||
    errorMessage.includes("user rejected") ||
    errorMessage.includes("user denied")
  );
}

function isInsufficientFundsError(error) {
  const errorCode = error?.code ?? error?.info?.error?.code;
  const errorMessage = `${error?.shortMessage ?? ""} ${error?.message ?? ""}`.toLowerCase();

  return errorCode === "INSUFFICIENT_FUNDS" || errorMessage.includes("insufficient funds");
}

function isPlaceholderAddress(address) {
  return String(address).toLowerCase() === "0x0000000000000000000000000000000000000000";
}

export async function buyBookWithEth(bookId, price) {
  try {
    if (isPlaceholderAddress(CONTRACT_ADDRESS)) {
      return { success: true, demoMode: true };
    }

    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const contract = await getContract();
    const tx = await contract.buyBook(bookId, {
      value: ethers.parseEther(String(price)),
    });
    await tx.wait();

    return { success: true };
  } catch (error) {
    if (isUserRejectedError(error)) {
      return { success: false, cancelled: true, error };
    }

    if (isInsufficientFundsError(error)) {
      return { success: false, insufficientFunds: true, error };
    }

    return { success: false, cancelled: false, error };
  }
}
