"use client";

import { createContext, useContext, useState } from "react";

const AppContext = createContext(undefined);

const initialBooks = [
  {
    id: 1,
    title: "Blockchain Basics",
    author: "Alice",
    description: "Learn blockchain fundamentals",
    authors: [
      { name: "Alice", wallet: "0xA11ce0000000000000000000000000000000A11", royalty: 60 },
      { name: "Bob", wallet: "0xB0b0000000000000000000000000000000000B0b", royalty: 40 },
    ],
    price: "0.01",
    image: "/bitcoin.jpg",
    totalCopies: 100,
    soldCopies: 34,
  },
  {
    id: 2,
    title: "Smart Contracts",
    author: "Bob",
    description: "Build and understand smart contracts from scratch",
    authors: [{ name: "Bob", wallet: "0xB0b0000000000000000000000000000000000B0b", royalty: 100 }],
    price: "0.02",
    image: "/satoshi.jpg",
    totalCopies: 80,
    soldCopies: 21,
  },
  {
    id: 3,
    title: "Web3 for Writers",
    author: "Carol",
    description: "A practical guide for creators entering Web3 publishing",
    authors: [
      { name: "Carol", wallet: "0xCar0100000000000000000000000000000000CaR", royalty: 100 },
    ],
    price: "0.03",
    image: "/block-chain.jpg",
    totalCopies: 120,
    soldCopies: 57,
  },
  {
    id: 4,
    title: "NFT Publishing Guide",
    author: "David",
    description: "Tokenize books and launch decentralized publishing workflows",
    authors: [
      { name: "David", wallet: "0xDav1d0000000000000000000000000000000DaV", royalty: 100 },
    ],
    price: "0.04",
    image: "/bitcoin.jpg",
    totalCopies: 60,
    soldCopies: 19,
  },
];

export function AppProvider({ children }) {
  const [books, setBooks] = useState(initialBooks);
  const [ownedBooks, setOwnedBooks] = useState([]);

  const addBook = (book) => {
    if (!book) {
      return;
    }

    setBooks((prevBooks) => [...prevBooks, book]);
  };

  const buyBook = (bookId) => {
    const normalizedId = String(bookId);

    setOwnedBooks((prevOwnedBooks) =>
      prevOwnedBooks.includes(normalizedId)
        ? prevOwnedBooks
        : [...prevOwnedBooks, normalizedId],
    );
  };

  const removeOwnedBook = (bookId) => {
    const normalizedId = String(bookId);
    setOwnedBooks((prevOwnedBooks) =>
      prevOwnedBooks.filter((ownedBookId) => ownedBookId !== normalizedId),
    );
  };

  const value = {
    books,
    ownedBooks,
    addBook,
    buyBook,
    removeOwnedBook,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside an AppProvider");
  }

  return context;
}
