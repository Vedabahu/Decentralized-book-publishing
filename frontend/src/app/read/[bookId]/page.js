"use client";

import { useParams, useRouter } from "next/navigation";
import { useOwnership } from "../../../contexts/OwnershipContext";

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.bookId ?? "";
  const { isBookOwned } = useOwnership();
  const isOwned = isBookOwned(bookId);

  return (
    <main className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] px-6 py-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-10 sm:py-12">
        {!isOwned ? (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              You do not own this book
            </h1>
            <p className="text-base text-slate-600">
              Buy this book first to unlock the reader experience.
            </p>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
              Reader
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Rendering decrypted PDF...
            </h1>
            <p className="text-base text-slate-600">Book ID: {bookId}</p>
          </div>
        )}
      </section>
    </main>
  );
}
