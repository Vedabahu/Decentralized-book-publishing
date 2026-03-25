"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

const WalletContext = createContext(undefined);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const syncWalletState = async (accountsFromEvent) => {
    if (typeof window === "undefined" || !window.ethereum) {
      setAccount(null);
      setProvider(null);
      setSigner(null);
      return;
    }

    const currentProvider = new BrowserProvider(window.ethereum);
    setProvider(currentProvider);

    const accounts =
      accountsFromEvent ?? (await window.ethereum.request({ method: "eth_accounts" }));

    if (!accounts || accounts.length === 0) {
      setAccount(null);
      setSigner(null);
      return;
    }

    setAccount(accounts[0]);
    const currentSigner = await currentProvider.getSigner();
    setSigner(currentSigner);
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      return { success: false, reason: "missing_wallet" };
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      await syncWalletState(accounts);
      return { success: true, account: accounts?.[0] ?? null };
    } catch (error) {
      console.error("Wallet connection failed:", error);
      const code = error?.code ?? error?.info?.error?.code;
      if (code === 4001 || code === "ACTION_REJECTED") {
        return { success: false, reason: "cancelled" };
      }

      return { success: false, reason: "failed" };
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      return;
    }

    const initialSyncTimer = window.setTimeout(() => {
      syncWalletState();
    }, 0);

    const handleAccountsChanged = (accounts) => {
      syncWalletState(accounts);
    };

    const handleChainChanged = () => {
      syncWalletState();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.clearTimeout(initialSyncTimer);
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ connectWallet, account, provider, signer }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used inside a WalletProvider");
  }

  return context;
}
