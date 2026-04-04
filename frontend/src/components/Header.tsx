"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { connectWallet } from "@/lib/wallet";
import { getReadonlyUserAuthContract } from "@/lib/contract";

export function Header() {
  const [address, setAddress] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const fetchUserProfile = async (walletAddress: string) => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const userContract = getReadonlyUserAuthContract(provider);
        
        try {
          const userInfo = await userContract.users(walletAddress);
          const userNameVal = userInfo[0];
          const onboarded = userInfo[1];
          const profileUrl = userInfo[3];
          
          if (onboarded) {
            setUserName(userNameVal);
            if (profileUrl) {
              if (profileUrl.startsWith("ipfs://")) {
                const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "http://127.0.0.1:8080/ipfs/";
                setAvatarUrl(`${gateway}${profileUrl.replace("ipfs://", "")}`);
              } else {
                setAvatarUrl(profileUrl);
              }
            } else {
              setAvatarUrl("/assets/default-avatar.jpg");
            }
          } else {
            setUserName("Unregistered");
            setAvatarUrl("/assets/default-avatar.jpg");
          }
        } catch (err) {
          // If contract fails or not deployed
          setUserName("Unregistered");
          setAvatarUrl("/assets/default-avatar.jpg");
        }
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
      setUserName("Unregistered");
      setAvatarUrl("/assets/default-avatar.jpg");
    }
  };

  useEffect(() => {
    async function checkConnection() {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            await fetchUserProfile(accounts[0]);
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
      const addr = await signer.getAddress();
      setAddress(addr);
      await fetchUserProfile(addr);
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
          <div className="flex items-center gap-3">
            {avatarUrl && (
              <div className="relative group cursor-pointer inline-flex justify-center items-center">
                <img 
                  src={avatarUrl} 
                  alt="User Avatar" 
                  className="w-10 h-10 rounded-full border border-gray-300 object-cover shadow-sm bg-gray-100"
                />
                
                {/* Comic-style Tooltip */}
                <span className="absolute top-12 whitespace-nowrap px-3 py-1 bg-white text-black text-xs font-bold border-2 border-black rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {userName}
                </span>
              </div>
            )}
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md font-mono text-sm shadow-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
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
