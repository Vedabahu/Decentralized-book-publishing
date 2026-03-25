"use client";

import { useState } from "react";
import { useToast } from "../contexts/ToastContext";
import { useWallet } from "../contexts/WalletContext";

function shortenAddress(address) {
  if (!address) {
    return "";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletButton() {
  const { account, connectWallet } = useWallet();
  const { showToast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (account || isConnecting) {
      return;
    }

    setIsConnecting(true);
    try {
      const result = await connectWallet();
      if (result?.success) {
        showToast({ message: "Wallet connected", type: "success" });
      } else if (result?.reason === "missing_wallet") {
        showToast({ message: "MetaMask is not installed", type: "error" });
      } else if (result?.reason === "cancelled") {
        showToast({ message: "Wallet connection cancelled", type: "error" });
      } else if (result?.reason === "failed") {
        showToast({ message: "Wallet connection failed", type: "error" });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const buttonLabel = account
    ? shortenAddress(account)
    : isConnecting
      ? "Connecting..."
      : "Connect Wallet";

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={Boolean(account) || isConnecting}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition duration-200 ${
        account
          ? "cursor-default bg-emerald-100 text-emerald-800"
          : "bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-700"
      } ${isConnecting ? "opacity-80" : ""}`}
    >
      {buttonLabel}
    </button>
  );
}
