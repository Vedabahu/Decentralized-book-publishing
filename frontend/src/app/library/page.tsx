"use client";

import { useState } from "react";
import BookCard from "../../components/BookCard";
import { useApp } from "../../contexts/AppContext";

export default function LibraryPage() {
  const { books, ownedBooks } = useApp();
  const ownedList = books.filter((book) => ownedBooks.includes(String(book.id)));
  const [listedBookIds, setListedBookIds] = useState([]);

  const shortenWallet = (wallet) => {
    if (!wallet) {
      return "Unknown";
    }

    return `${wallet.slice(0, 4)}...${wallet.slice(-2)}`;
  };

  const getPrimaryAuthor = (book) => {
    if (book.author) {
      return book.author;
    }

    if (Array.isArray(book.authors) && book.authors.length > 0) {
      const firstAuthor = book.authors[0];
      if (typeof firstAuthor === "string") {
        return firstAuthor;
      }

      return firstAuthor?.name || shortenWallet(firstAuthor?.wallet);
    }

    return "Unknown";
  };

  const handleListForResale = (bookId) => {
    setListedBookIds((prevIds) =>
      prevIds.includes(String(bookId)) ? prevIds : [...prevIds, String(bookId)],
    );
  };

  return (
    <main className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <section className="mx-auto w-full max-w-7xl rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          My Library
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600 sm:text-lg">
          Your purchased books are available here.
        </p>

        {ownedList.length === 0 ? (
          <p className="mt-10 text-center text-base font-medium text-slate-600">
            No books owned yet
          </p>
        ) : (
          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {ownedList.map((book) => (
              <div key={book.id} className="w-full max-w-sm space-y-3">
                <BookCard
                  bookId={book.id}
                  title={book.title}
                  author={getPrimaryAuthor(book)}
                  price={book.price}
                  image={book.image}
                  totalCopies={book.totalCopies ?? 100}
                  soldCopies={book.soldCopies ?? 0}
                />

                {listedBookIds.includes(String(book.id)) ? (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700">
                    Listed for resale
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleListForResale(book.id)}
                    className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    List for Resale
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
