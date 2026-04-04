"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "@/lib/contract";
import { ReaderOverlay } from "@/components/ReaderOverlay";

export default function MyBooks() {
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState<string | null>(null);
  const [activeDocUrl, setActiveDocUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyBooks() {
      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length === 0) {
            setIsLoading(false);
            return;
          }

          setWallet(accounts[0]);
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = getContract(signer);

          try {
            // Using the new helper function on the Smart Contract
            const tokenIds = await contract.getUserTokens(accounts[0]);

            const booksData = await Promise.all(
              tokenIds.map(async (tokenId: bigint) => {
                try {
                  const uri = await contract.getBookURI(tokenId);

                  if (uri.startsWith("ipfs://")) {
                    const cid = uri.replace("ipfs://", "");
                    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "http://127.0.0.1:8080/ipfs/";
                    const res = await fetch(`${gateway}${cid}`);
                    const metadata = await res.json();
                    return { tokenId: tokenId.toString(), metadata };
                  }
                  return { tokenId: tokenId.toString(), metadata: { name: "Unknown" } };
                } catch (err) {
                  console.error(`Failed to load book ${tokenId}:`, err);
                  return { tokenId: tokenId.toString(), metadata: { name: "Error loading" } };
                }
              })
            );

            setBooks(booksData);
          } catch (contractErr) {
            console.error("Failed to fetch user tokens from contract:", contractErr);
            // If getUserTokens fails, just show empty library
            setBooks([]);
          }
        }
      } catch (e) {
        console.error("Failed to load your library", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMyBooks();
  }, []);

  if (isLoading) return <div className="p-8 text-center text-lg text-muted-foreground">Loading your library...</div>;
  if (!wallet) return <div className="p-8 text-center text-lg text-muted-foreground">Please connect your wallet to view your library.</div>;

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold font-heading mb-8 text-foreground">My Library</h1>

      {books.length === 0 ? (
        <p className="text-muted-foreground text-lg">You do not own any books yet. Visit the Marketplace to buy some!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => {
            const { metadata } = book;
            const imageUrl = metadata?.image?.startsWith("ipfs://")
              ? `${process.env.NEXT_PUBLIC_IPFS_GATEWAY || "http://127.0.0.1:8080/ipfs/"}${metadata.image.replace("ipfs://", "")}`
              : "";

            const docUrl = metadata?.document?.startsWith("ipfs://")
              ? `${process.env.NEXT_PUBLIC_IPFS_GATEWAY || "http://127.0.0.1:8080/ipfs/"}${metadata.document.replace("ipfs://", "")}`
              : "#";

            return (
              <div key={book.tokenId} className="border border-border rounded-xl shadow-lg p-4 flex flex-col bg-card overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="h-48 w-full bg-muted overflow-hidden rounded relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt={metadata?.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No cover</div>
                  )}
                </div>

                <div className="mt-4 flex flex-col flex-1">
                  <h3 className="font-bold text-xl text-card-foreground">{metadata?.name || "Unknown Title"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{metadata?.author || "Author Loading..."}</p>

                  <div className="mt-auto border-t border-border pt-4">
                    <button
                      onClick={() => setActiveDocUrl(docUrl)}
                      className="block w-full text-center px-4 py-2 font-medium rounded-md shadow bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-colors"
                    >
                      Read Book
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Internal Anti-Piracy Full-Screen Reading Protocol */}
      {activeDocUrl && (
        <ReaderOverlay 
          url={activeDocUrl} 
          onClose={() => setActiveDocUrl(null)} 
        />
      )}
    </main>
  );
}
