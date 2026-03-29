"use client";

import { useState, useEffect } from "react";
import { connectWallet } from "@/lib/wallet";

export function Header() {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        } catch (e) {
          console.error("Failed to check wallet connection state", e);
        }
      }
    }
    checkConnection();
  }, []);

  const handleConnect = async () => {
    try {
      const signer = await connectWallet();
      setAddress(await signer.getAddress());
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet.");
    }
  };

  return (
    <header className="flex flex-wrap justify-between items-center p-4 border-b bg-white shadow-sm z-50 relative">
      <h1 className="text-2xl font-bold font-heading text-slate-800 tracking-tight">Web3 Bookstore</h1>
      <div className="flex gap-6 items-center flex-wrap mt-2 sm:mt-0">
        <a href="/" className="text-slate-600 hover:text-blue-600 font-medium transition">Home</a>
        <a href="/my-books" className="text-slate-600 hover:text-blue-600 font-medium transition">My Books</a>
        <a href="/author" className="text-slate-600 hover:text-blue-600 font-medium transition">Author Panel</a>
        
        {address ? (
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        ) : (
          <button 
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow flex-shrink-0 transition"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
