"use client";

import { useEffect, useState } from "react";
import { BookCard } from "@/components/BookCard";

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then(setBooks)
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl font-heading">
          Decentralized <span className="text-blue-600">Marketplace</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Discover, purchase, and own books truly through the blockchain.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map((book: any) => (
          <BookCard key={book.bookId} book={book} />
        ))}
      </div>
      
      {books.length === 0 && (
        <div className="text-center py-20 text-gray-500 text-lg">
          No books available yet. Be the first to publish one!
        </div>
      )}
    </div>
  );
}