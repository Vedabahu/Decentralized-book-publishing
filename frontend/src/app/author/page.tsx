"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { connectWallet } from "@/lib/wallet";
import { getContract, getUserAuthContract } from "@/lib/contract";

export default function AuthorPanel() {
  // Registration State
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);
  const [isRegisteredAuthor, setIsRegisteredAuthor] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  
  // Register Form State
  const [regUsername, setRegUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Upload Form State
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function checkRegistration() {
      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const userContract = getUserAuthContract(await provider.getSigner());
            
            try {
              // Get user info tuple
              const userInfo = await userContract.users(accounts[0]);
              const onboarded = userInfo[1];
              const userType = userInfo[2];
              
              // Check if user is an Author (userType = 1)
              if (onboarded && Number(userType) === 1) {
                setIsRegisteredAuthor(true);
              } else {
                setIsRegisteredAuthor(false);
              }
            } catch (err) {
              console.error("Contract check failed", err);
              setIsRegisteredAuthor(false);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingRegistration(false);
      }
    }
    
    checkRegistration();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setStatus("Connecting wallet for registration...");

    try {
      const signer = await connectWallet();
      const userContract = getUserAuthContract(signer);

      let avatarUrl = "";
      if (avatarFile) {
        setStatus("Uploading avatar to IPFS...");
        const formData = new FormData();
        formData.append("file", avatarFile);

        const res = await fetch("/api/ipfs-single", {
          method: "POST",
          body: formData
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to upload avatar");
        }

        const { cid } = await res.json();
        avatarUrl = `ipfs://${cid}`;
      }

      setStatus("Confirming registration transaction...");
      
      // setUserInfo(string _username, UserType _usertype, string _profileUrl)
      // userType 1 = Author
      const tx = await userContract.setUserInfo(regUsername, 1, avatarUrl);
      
      setStatus("Waiting for transaction confirmation...");
      await tx.wait();
      
      setStatus("Successfully registered as Author!");
      setIsRegisteredAuthor(true);
      
      // Auto clear status
      setTimeout(() => setStatus(""), 3000);
      
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

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
        
        // Clear form
        setTitle("");
        setPrice("");
        setImageFile(null);
        setDocFile(null);
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

  if (isCheckingRegistration) {
    return <div className="text-center mt-20 text-lg">Checking wallet registration...</div>;
  }

  // Registration View
  if (!isRegisteredAuthor) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-card text-card-foreground border border-border shadow-md rounded-md transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-2">Register as Author</h2>
        <p className="text-muted-foreground mb-6 font-medium">To create and sell books, you must register your Author Profile on the blockchain.</p>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Author Display Name" 
            value={regUsername} 
            onChange={e => setRegUsername(e.target.value)} 
            required
            className="p-2 border border-border bg-background rounded placeholder:text-muted-foreground"
          />
          
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-foreground font-semibold">Profile Avatar (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => setAvatarFile(e.target.files?.[0] || null)} 
              className="p-2 border border-border bg-background rounded"
            />
            <span className="text-xs text-muted-foreground mt-1">This will be securely uploaded and pinned to your profile via IPFS.</span>
          </div>

          <Button 
            type="submit" 
            disabled={isRegistering} 
            className="bg-primary text-primary-foreground py-2 mt-4 cursor-pointer"
          >
            {isRegistering ? "Registering on Blockchain..." : "Complete Registration"}
          </Button>
        </form>
        
        {status && (
          <div className="mt-6 p-3 bg-secondary/50 border border-secondary rounded text-sm text-secondary-foreground">
            Current Status: {status}
          </div>
        )}
      </div>
    );
  }

  // Author Module View
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-card text-card-foreground border border-border shadow-md rounded-md transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4">Publish a New Book</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Book Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required
          className="p-2 border border-border bg-background rounded placeholder:text-muted-foreground"
        />
        <input 
          type="text" 
          placeholder="Author Name" 
          value={authorName} 
          onChange={e => setAuthorName(e.target.value)} 
          required
          className="p-2 border border-border bg-background rounded placeholder:text-muted-foreground"
        />
        <input 
          type="number" 
          step="0.0001"
          placeholder="Price in ETH" 
          value={price} 
          onChange={e => setPrice(e.target.value)} 
          required
          className="p-2 border border-border bg-background rounded placeholder:text-muted-foreground"
        />
        
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Book Cover Image (PNG/JPG)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e => setImageFile(e.target.files?.[0] || null)} 
            required
            className="p-2 border border-border bg-background rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Book Document (Strictly PDF)</label>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={e => setDocFile(e.target.files?.[0] || null)} 
            required
            className="p-2 border border-border bg-background rounded"
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
        <div className="mt-4 p-3 bg-secondary/50 border border-secondary rounded text-sm text-secondary-foreground">
          Status: {status}
        </div>
      )}
    </div>
  );
}
