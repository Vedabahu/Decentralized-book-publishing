"use client";

import { connectWallet } from "@/lib/wallet";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";

export function BookCard({ book }: any) {
    async function buy() {
        const signer = await connectWallet();
        const contract = getContract(signer);

        const tx = await contract.buyBook(book.bookId, {
            value: ethers.parseEther(book.price),
        });

        await tx.wait();
        alert("Purchased!");
    }

    return (
        <div>
            <p>{book.metadataURI}</p>
            <button onClick={buy}>Buy</button>
        </div>
    );
}