"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useOwnership } from "../../../contexts/OwnershipContext";
import { buyBookWithEth } from "../../../lib/purchase";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id ?? "1";
  const { addOwnedBook, isBookOwned } = useOwnership();
  const isOwned = isBookOwned(bookId);
  const [isBuying, setIsBuying] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const book = {
    id: Number(bookId),
    title: "Blockchain Basics",
    description: "Learn blockchain fundamentals",
    authors: ["Alice", "Bob"],
    price: "0.01",
    image: "/book1.jpg",
  };

  const handleBuy = async () => {
    if (isBuying) {
      return;
    }

    setIsBuying(true);
    setMessage("");

    const result = await buyBookWithEth(bookId, book.price);

    if (result.success) {
      addOwnedBook(bookId);
      setMessageType("success");
      setMessage(
        result.demoMode
          ? "Demo mode: Book purchased successfully"
          : "Purchase successful. You now own this book.",
      );
    } else if (result.cancelled) {
      setMessageType("error");
      setMessage("Transaction cancelled");
    } else if (result.insufficientFunds) {
      setMessageType("error");
      setMessage("Insufficient funds in wallet");
    } else {
      setMessageType("error");
      setMessage("Purchase failed");
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
                {book.authors.map((author) => (
                  <li key={author}>{author}</li>
                ))}
              </ul>
            </div>

            <p className="text-xl font-semibold text-slate-900">{book.price} ETH</p>

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
                  messageType === "success" ? "text-emerald-700" : "text-red-600"
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
