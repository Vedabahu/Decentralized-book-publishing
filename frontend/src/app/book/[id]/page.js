"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "../../../contexts/AppContext";
import { useToast } from "../../../contexts/ToastContext";
import { buyBookWithEth } from "../../../lib/purchase";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id ?? "1";
  const { books, ownedBooks, buyBook } = useApp();
  const { showToast } = useToast();
  const isOwned = ownedBooks.includes(String(bookId));
  const [isBuying, setIsBuying] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const book =
    books.find((currentBook) => String(currentBook.id) === String(bookId)) ?? {
      id: Number(bookId),
      title: "Blockchain Basics",
      description: "Learn blockchain fundamentals",
      authors: ["Alice", "Bob"],
      price: "0.01",
      image: "/book1.jpg",
      totalCopies: 0,
      soldCopies: 45,
    };

  const totalCopies = book.totalCopies ?? 0;
  const soldCopies = book.soldCopies ?? 0;
  const shortenWallet = (wallet) => {
    if (!wallet) {
      return "Unknown";
    }

    return `${wallet.slice(0, 4)}...${wallet.slice(-2)}`;
  };

  const authorRows = (book.authors ?? [book.author ?? "Unknown"]).map((author) => {
    if (typeof author === "string") {
      return { name: author, royalty: null };
    }

    return {
      name: author.name || shortenWallet(author.wallet),
      royalty: author.royalty ?? null,
    };
  });

  const equalRoyalty = authorRows.length > 0 ? (100 / authorRows.length).toFixed(0) : "0";

  const handleBuy = async () => {
    if (isBuying) {
      return;
    }

    setIsBuying(true);
    setMessage("");
    setMessageType("info");

    const result = await buyBookWithEth(bookId, book.price, {
      onStatus: (statusMessage) => {
        setMessageType("info");
        setMessage(statusMessage);
      },
    });

    if (result.success) {
      buyBook(bookId);
      setMessageType("success");
      const successMessage = result.message || "Transaction sent";
      setMessage(successMessage);
      showToast({ message: successMessage, type: "success" });
    } else if (result.insufficientFunds) {
      setMessageType("error");
      setMessage("Not enough ETH in wallet");
      showToast({ message: "Not enough ETH in wallet", type: "error" });
    } else {
      const errorMessage = result.message || "Purchase failed";
      setMessageType("error");
      setMessage(errorMessage);
      showToast({ message: errorMessage, type: "error" });
    }

    setIsBuying(false);
  };

  const handleRead = () => {
    router.push(`/read/${bookId}`);
  };

  return (
    <main className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <section className="mx-auto w-full max-w-6xl rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-12">
        <div className="grid items-start gap-8 md:gap-10 lg:gap-14 md:grid-cols-[320px_1fr]">
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
            <Image
              src={book.image}
              alt={`${book.title} cover`}
              width={640}
              height={800}
              className="h-auto w-full object-cover"
              priority
            />
          </div>

          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Book #{book.id}
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {book.title}
            </h1>

            <p className="text-base leading-7 text-slate-600 sm:text-lg">{book.description}</p>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">
                Authors
              </h2>
              <ul className="space-y-1 text-slate-700">
                {authorRows.map((author) => (
                  <li key={author.name} className="flex items-center justify-between gap-3">
                    <span>{author.name}</span>
                    <span className="text-sm font-semibold text-slate-600">
                      {author.royalty ?? equalRoyalty}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xl font-semibold text-slate-900">{book.price} ETH</p>
            <div className="space-y-1 rounded-xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-700">
              <p>
                Total Copies: <span className="font-semibold text-slate-900">{totalCopies}</span>
              </p>
              <p>
                Sold: <span className="font-semibold text-slate-900">{soldCopies}</span>
              </p>
            </div>

            <div className="pt-2">
              {isOwned ? (
                <button
                  type="button"
                  onClick={handleRead}
                  className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-lg"
                >
                  Read Book
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={isBuying}
                  className={`rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 ${
                    isBuying
                      ? "cursor-not-allowed bg-slate-500"
                      : "bg-slate-900 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-lg"
                  }`}
                >
                  {isBuying ? "Processing..." : "Buy"}
                </button>
              )}
            </div>

            {message && (
              <p
                className={`text-sm font-medium ${
                  messageType === "success"
                    ? "text-emerald-700"
                    : messageType === "info"
                      ? "text-slate-600"
                      : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
