"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useOwnership } from "../contexts/OwnershipContext";
import { buyBookWithEth } from "../lib/purchase";

export default function BookCard({ bookId, title, author, price, image }) {
  const router = useRouter();
  const { addOwnedBook, isBookOwned } = useOwnership();
  const isOwned = isBookOwned(bookId);
  const [isBuying, setIsBuying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("idle");

  const handleBuy = async (id) => {
    if (isBuying || isOwned) {
      return;
    }

    setStatusMessage("");
    setStatusType("loading");
    setIsBuying(true);
    const result = await buyBookWithEth(id, price);

    if (result.success) {
      addOwnedBook(id);
      setStatusType("success");
      setStatusMessage(
        result.demoMode ? "Demo mode: Book purchased successfully" : "Purchase successful!",
      );
    } else if (result.cancelled) {
      setStatusType("error");
      setStatusMessage("Transaction cancelled");
    } else if (result.insufficientFunds) {
      setStatusType("error");
      setStatusMessage("Insufficient funds in wallet");
    } else {
      setStatusType("error");
      setStatusMessage("Purchase failed");
    }

    setIsBuying(false);
  };

  const handleRead = () => {
    router.push(`/read/${bookId}`);
  };

  return (
    <article className="group w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={`${title} cover`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-2 p-5 sm:p-6">
        <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h3>
        <p className="text-sm text-slate-600 sm:text-base">{author}</p>
        <p className="text-base font-semibold text-slate-900 sm:text-lg">{price} ETH</p>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href={`/book/${bookId}`}
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View Details
          </Link>

          {isOwned ? (
            <button
              type="button"
              onClick={handleRead}
              className="w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Read
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleBuy(bookId)}
              disabled={isBuying}
              className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white transition ${
                isBuying
                  ? "cursor-not-allowed bg-slate-500 opacity-85"
                  : "bg-slate-900 hover:bg-slate-700"
              }`}
            >
              {isBuying ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Processing...
                </span>
              ) : (
                "Buy"
              )}
            </button>
          )}
        </div>

        {statusMessage && (
          <p
            className={`text-sm ${
              statusType === "success" ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </article>
  );
}
