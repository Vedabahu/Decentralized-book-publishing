"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { connectWallet } from "@/lib/wallet";
import { getContract, getReadonlyContract } from "@/lib/contract";

export function BookCard({ book }: { book: any }) {
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (book?.metadataURI?.startsWith("ipfs://")) {
      const cid = book.metadataURI.replace("ipfs://", "");
      const gateway =
        process.env.NEXT_PUBLIC_IPFS_GATEWAY || "http://127.0.0.1:8080/ipfs/";

      fetch(`${gateway}${cid}`)
        .then((res) => res.json())
        .then(setMetadata)
        .catch(console.error);
    }
  }, [book]);

  useEffect(() => {
    async function checkOwnership() {
      if (typeof window !== "undefined" && window.ethereum && book?.bookId) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (!accounts || accounts.length === 0) return;

          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = getReadonlyContract(provider);
            const owned = await contract.hasBoughtBook(
              accounts[0],
              BigInt(book.bookId),
            );
            setIsSuccess(!!owned);
          } catch (err) {
            // Silently ignore contract call errors (book may not exist on current deployment)
            setIsSuccess(false);
          }
        } catch (err) {
          // Silently ignore wallet access errors
        }
      }
    }

    checkOwnership();
  }, [book.bookId]);

  const imageUrl = metadata?.image?.startsWith("ipfs://")
    ? `${process.env.NEXT_PUBLIC_IPFS_GATEWAY || "http://127.0.0.1:8080/ipfs/"}${metadata.image.replace("ipfs://", "")}`
    : "";

  async function buy() {
    try {
      setIsLoading(true);
      const signer = await connectWallet();
      const contract = getContract(signer);

      const tx = await contract.buyBook(BigInt(book.bookId), {
        value: BigInt(book.price),
      });

      await tx.wait();
      setIsSuccess(true);
      alert("Purchase successful!");
    } catch (e) {
      console.error(e);
      alert("Purchase failed. Check console.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="border border-border rounded-xl shadow-lg p-4 max-w-sm flex flex-col bg-card overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className="h-48 w-full bg-muted overflow-hidden rounded relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={metadata?.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Loading cover...
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col flex-1">
        <h3 className="font-bold text-xl text-card-foreground">
          {metadata?.name || "Unknown Title"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {metadata?.author || "Author Loading..."}
        </p>

        <div className="mt-auto flex justify-between items-center border-t border-border pt-4">
          <span className="font-semibold text-lg text-emerald-600 dark:text-emerald-400 font-mono">
            {ethers.formatEther(BigInt(book.price || 0))} ETH
          </span>

          <button
            onClick={buy}
            disabled={isLoading || isSuccess}
            className={`px-4 py-2 font-medium rounded-md shadow transition-colors ${
              isSuccess
                ? "bg-green-500 text-primary-foreground cursor-default"
                : isLoading
                  ? "bg-amber-400 text-primary-foreground cursor-wait"
                  : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
            }`}
          >
            {isSuccess ? "Owned" : isLoading ? "Buying..." : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
