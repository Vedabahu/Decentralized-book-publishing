"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../contexts/AppContext";

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.bookId ?? "";
  const { books, ownedBooks } = useApp();
  const isOwned = ownedBooks.includes(String(bookId));
  const book = books.find((currentBook) => String(currentBook.id) === String(bookId));
  const [stage, setStage] = useState("verifying");

  useEffect(() => {
    let ignore = false;
    let fetchTimer = null;
    let decryptTimer = null;

    const runFlow = () => {
      setStage("verifying");

      const verifyTimer = window.setTimeout(() => {
        if (ignore) {
          return;
        }

        if (!isOwned) {
          setStage("denied");
          return;
        }

        setStage("fetchingKey");

        const fetchDelay = 1000 + Math.floor(Math.random() * 1000);
        fetchTimer = window.setTimeout(() => {
          if (ignore) {
            return;
          }

          setStage("decrypting");
          decryptTimer = window.setTimeout(() => {
            if (!ignore) {
              setStage("ready");
            }
          }, 900);
        }, fetchDelay);
      }, 700);

      return verifyTimer;
    };

    const verifyTimer = runFlow();

    return () => {
      ignore = true;
      window.clearTimeout(verifyTimer);
      if (fetchTimer !== null) {
        window.clearTimeout(fetchTimer);
      }
      if (decryptTimer !== null) {
        window.clearTimeout(decryptTimer);
      }
    };
  }, [isOwned, bookId]);

  const isLoading = stage === "verifying" || stage === "fetchingKey" || stage === "decrypting";

  const loadingMessage =
    stage === "verifying"
      ? "Verifying ownership..."
      : stage === "fetchingKey"
        ? "Fetching decryption key..."
        : "Decrypting book...";

  return (
    <main className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-10 sm:py-12">
        <div className="transition-all duration-300">
          {isLoading ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {loadingMessage}
              </h1>
              <p className="text-base text-slate-600">
                Please wait while secure access checks are completed.
              </p>
            </div>
          ) : null}

          {stage === "denied" ? (
            <div className="space-y-5 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Access Denied
              </h1>
              <p className="text-base text-slate-600">You do not own this book</p>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Go Back
              </button>
            </div>
          ) : null}

          {stage === "ready" ? (
            <div className="space-y-6">
              <div className="space-y-3 text-center">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
                  Reader
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {book?.title ?? `Book #${bookId}`}
                </h1>
                <p className="text-base font-medium text-emerald-700">Decrypted content ready</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                  Download disabled
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                  Protected content
                </span>
              </div>

              <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 leading-7 text-slate-700 sm:p-6">
                <div className="select-none" onContextMenu={(event) => event.preventDefault()}>
                  <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Reader Placeholder
                    </p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                      Protected PDF Viewer Placeholder
                    </h2>
                    <p className="mt-3 max-w-md text-sm text-slate-600">
                      The actual PDF was intentionally removed. This area is reserved for secure
                      decrypted content rendering.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        Download disabled
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Protected content
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
