"use client";

import { useState } from "react";
import { connectWallet } from "@/lib/wallet";
import { getContract } from "@/lib/contract";
import { uploadToIPFS } from "@/lib/ipfs";
import { ethers } from "ethers";

export default function CreateBook() {
    const [file, setFile] = useState<File | null>(null);
    const [price, setPrice] = useState("");

    async function handleCreate() {
        if (!file) return;

        const signer = await connectWallet();
        const contract = getContract(signer);

        const ipfsUri = await uploadToIPFS(file);

        const tx = await contract.createBook(
            ipfsUri,
            ethers.parseEther(price)
        );

        const receipt = await tx.wait();

        const bookId = receipt.logs[0].args[0];

        await fetch("/api/books", {
            method: "POST",
            body: JSON.stringify({
                bookId,
                metadataURI: ipfsUri,
                price,
            }),
        });

        alert("Book created!");
    }

    return (
        <div>
            <h1>Create Book</h1>

            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <input
                placeholder="Price in ETH"
                onChange={(e) => setPrice(e.target.value)}
            />

            <button onClick={handleCreate}>Publish</button>
        </div>
    );
}