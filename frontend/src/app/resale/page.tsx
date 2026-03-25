"use client";

import { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";

const initialResaleListings = [
  {
    id: 1,
    bookId: 1,
    title: "Blockchain Basics",
    price: "0.015",
    seller: "0x9f13...2e4a",
  },
  {
    id: 2,
    bookId: 2,
    title: "Smart Contracts",
    price: "0.025",
    seller: "0x7a22...91c0",
  },
  {
    id: 3,
    bookId: 3,
    title: "Web3 for Writers",
    price: "0.018",
    seller: "0x3d90...be77",
  },
];

export default function ResalePage() {
  const { books, ownedBooks, buyBook, removeOwnedBook } = useApp();
  const [processingId, setProcessingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [resaleListings, setResaleListings] = useState(initialResaleListings);
  const [nextListingId, setNextListingId] = useState(1000);
  const [listingBookId, setListingBookId] = useState(null);
  const { showToast } = useToast();
  const ownedBookItems = books.filter((book) => ownedBooks.includes(String(book.id)));
  const listedOwnedBookIds = resaleListings.map((listing) => String(listing.bookId));

  const handleBuyResale = async (listingId, title) => {
    if (processingId !== null || cancelingId !== null) {
      return;
    }

    setProcessingId(listingId);
    await new Promise((resolve) => {
      setTimeout(resolve, 900);
    });

    const listing = resaleListings.find((item) => item.id === listingId);
    if (listing) {
      buyBook(listing.bookId);
      setResaleListings((prevListings) =>
        prevListings.filter((item) => item.id !== listingId),
      );
    }

    setProcessingId(null);
    showToast({
      message: `Demo mode: ${title} resale purchased successfully`,
      type: "success",
    });
  };

  const handleCancelListing = async (listingId) => {
    if (processingId !== null || cancelingId !== null) {
      return;
    }

    setCancelingId(listingId);
    await new Promise((resolve) => {
      setTimeout(resolve, 600);
    });

    const listing = resaleListings.find((item) => item.id === listingId);
    if (listing) {
      buyBook(listing.bookId);
      setResaleListings((prevListings) =>
        prevListings.filter((item) => item.id !== listingId),
      );
      showToast({ message: `${listing.title} listing cancelled`, type: "success" });
    }

    setCancelingId(null);
  };

  const handleListForResale = (book) => {
    const alreadyListed = listedOwnedBookIds.includes(String(book.id));
    if (alreadyListed) {
      showToast({ message: "This book is already listed for resale", type: "error" });
      return;
    }

    const listingId = nextListingId;
    setListingBookId(book.id);
    setNextListingId((prevId) => prevId + 1);
    window.setTimeout(() => {
      const listing = {
        id: listingId,
        bookId: book.id,
        title: book.title,
        price: (Number(book.price) + 0.005).toFixed(3),
        seller: "You",
      };

      setResaleListings((prevListings) => [listing, ...prevListings]);
      removeOwnedBook(book.id);
      setListingBookId(null);
      showToast({ message: `${book.title} listed for resale`, type: "success" });
    }, 800);
  };

  return (
    <main className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <section className="mx-auto w-full max-w-6xl rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8 sm:py-10">
        <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Resale Marketplace
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600 sm:text-lg">
          Explore books listed by other readers.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">List Owned Books for Resale</h2>
          {ownedBookItems.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No owned books available to list.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {ownedBookItems.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{book.title}</p>
                    <p className="text-sm text-slate-600">Base price: {book.price} ETH</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleListForResale(book)}
                    disabled={listingBookId === book.id}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      listingBookId === book.id
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                        : "border-slate-300 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100"
                    }`}
                  >
                    {listingBookId === book.id ? "Listing..." : "List for Resale"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {resaleListings.length === 0 ? (
          <p className="mt-8 text-center text-base font-medium text-slate-600">
            No resale listings available
          </p>
        ) : (
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resaleListings.map((listing) => (
              <article
                key={listing.id}
                className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {listing.title}
                </h2>
                <p className="mt-3 text-sm text-slate-600">Seller: {listing.seller}</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {listing.price} ETH
                </p>

                <button
                  type="button"
                  onClick={() =>
                    listing.seller === "You"
                      ? handleCancelListing(listing.id)
                      : handleBuyResale(listing.id, listing.title)
                  }
                  disabled={processingId === listing.id || cancelingId === listing.id}
                  className={`mt-5 w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white transition ${
                    processingId === listing.id || cancelingId === listing.id
                      ? "cursor-not-allowed bg-slate-500"
                      : listing.seller === "You"
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-slate-900 hover:bg-slate-700"
                  }`}
                >
                  {processingId === listing.id
                    ? "Processing..."
                    : cancelingId === listing.id
                      ? "Cancelling..."
                      : listing.seller === "You"
                        ? "Cancel Listing"
                        : "Buy Resale"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
