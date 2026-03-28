"use client";

import { useEffect, useState } from "react";
import { BookCard } from "@/components/BookCard";

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then(setBooks);
  }, []);

  return (
    <div>
      <h1>Marketplace</h1>

      {books.map((book: any) => (
        <BookCard key={book.bookId} book={book} />
      ))}
    </div>
  );
}