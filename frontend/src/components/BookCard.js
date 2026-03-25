"use client";

export default function BookCard({ title, author, price, image }) {
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

        <button
          type="button"
          className="mt-2 w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Buy
        </button>
      </div>
    </article>
  );
}
