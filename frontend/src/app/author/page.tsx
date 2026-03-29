"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { create } from "kubo-rpc-client";
import { Button } from "@/components/ui/button";
import { connectWallet } from "@/lib/wallet";
import { getContract } from "@/lib/contract";

export default function AuthorPanel() {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");

  const uploadToIPFS = async () => {
    setStatus("Uploading files to server...");
    
    if (!imageFile || !docFile) throw new Error("Missing files");

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("document", docFile);
    formData.append("title", title);
    formData.append("author", authorName);

    const res = await fetch("/api/ipfs", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to upload to IPFS node");
    }

    const { metadataCID } = await res.json();
    return metadataCID;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsUploading(true);
    setStatus("Connecting wallet...");
    
    try {
      const signer = await connectWallet();
      const address = await signer.getAddress();
      const contract = getContract(signer);

      const metadataCID = await uploadToIPFS();
      const metadataURI = `ipfs://${metadataCID}`;
      
      setStatus("Confirming transaction...");
      const priceWei = ethers.parseEther(price);
      
      const tx = await contract.createBook(metadataURI, priceWei);
      
      setStatus("Waiting for transaction confirmation...");
      const receipt = await tx.wait();
      
      setStatus("Transaction confirmed! Extracting book ID...");
      
      // Parse logs for BookCreated event
      let bookId: string | null = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log as any);
          if (parsedLog && parsedLog.name === "BookCreated") {
             bookId = parsedLog.args[0].toString();
             break;
          }
        } catch(e) {}
      }

      if (bookId !== null) {
        setStatus("Saving book directly to DB cache...");
        await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             bookId,
             author: address,
             metadataURI,
             price: priceWei.toString(),
          })
        });
        setStatus("Book successfully published!");
      } else {
        setStatus("Transaction success, but failed to find BookCreated event in logs.");
      }
      
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white border shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Publish a New Book</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-black">
        <input 
          type="text" 
          placeholder="Book Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required
          className="p-2 border rounded"
        />
        <input 
          type="text" 
          placeholder="Author Name" 
          value={authorName} 
          onChange={e => setAuthorName(e.target.value)} 
          required
          className="p-2 border rounded"
        />
        <input 
          type="number" 
          step="0.0001"
          placeholder="Price in ETH" 
          value={price} 
          onChange={e => setPrice(e.target.value)} 
          required
          className="p-2 border rounded"
        />
        
        <div className="flex flex-col">
          <label>Book Cover Image (PNG/JPG)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e => setImageFile(e.target.files?.[0] || null)} 
            required
            className="p-2 border rounded"
          />
        </div>

        <div className="flex flex-col">
          <label>Book Document (PDF/EPUB)</label>
          <input 
            type="file" 
            accept=".pdf,.epub" 
            onChange={e => setDocFile(e.target.files?.[0] || null)} 
            required
            className="p-2 border rounded"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isUploading} 
          className="bg-primary text-primary-foreground py-2 mt-2 cursor-pointer"
        >
          {isUploading ? "Publishing..." : "Submit Book"}
        </Button>
      </form>
      
      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-700">
          Status: {status}
        </div>
      )}
    </div>
  );
}
