"use client";

import { useDeferredValue, useMemo, useState } from "react";
import BookCard from "../components/BookCard";
import { useApp } from "../contexts/AppContext";

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

export function PagePlaceholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] px-8 py-16 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-500">
          Phase 1
        </p>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          {subtitle}
        </p>
      </section>
    </main>
  );
}

export default function HomePage() {
  const { books } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const authorOptions = useMemo(() => {
    const uniqueAuthors = new Set();

    books.forEach((book) => {
      uniqueAuthors.add(getPrimaryAuthor(book));
    });

    return ["all", ...Array.from(uniqueAuthors)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const titleMatches = book.title
        .toLowerCase()
        .includes(deferredSearchTerm.trim().toLowerCase());
      if (!titleMatches) {
        return false;
      }

      const authorName = getPrimaryAuthor(book);
      const authorMatches = selectedAuthor === "all" || authorName === selectedAuthor;
      if (!authorMatches) {
        return false;
      }

      const numericPrice = Number(book.price);
      const min = minPrice === "" ? null : Number(minPrice);
      const max = maxPrice === "" ? null : Number(maxPrice);

      if (min !== null && numericPrice < min) {
        return false;
      }

      if (max !== null && numericPrice > max) {
        return false;
      }

      return true;
    });
  }, [books, deferredSearchTerm, selectedAuthor, minPrice, maxPrice]);

  const isFiltering = searchTerm !== deferredSearchTerm;

  return (
    <main className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <section className="mx-auto w-full max-w-7xl rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Marketplace
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600 sm:text-lg">
          Browse featured books in this demo marketplace.
        </p>

        <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-white/75 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition duration-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />

          <select
            value={selectedAuthor}
            onChange={(event) => setSelectedAuthor(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition duration-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {authorOptions.map((authorOption) => (
              <option key={authorOption} value={authorOption}>
                {authorOption === "all" ? "All Authors" : authorOption}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="Min price (ETH)"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition duration-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />

          <input
            type="number"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Max price (ETH)"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition duration-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {isFiltering ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Updating results...
          </div>
        ) : null}

        {filteredBooks.length === 0 ? (
          <p className="mt-10 text-center text-base font-medium text-slate-600">
            No books found
          </p>
        ) : (
          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                bookId={book.id}
                title={book.title}
                author={getPrimaryAuthor(book)}
                price={book.price}
                image={book.image}
                totalCopies={book.totalCopies ?? 100}
                soldCopies={book.soldCopies ?? 0}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
