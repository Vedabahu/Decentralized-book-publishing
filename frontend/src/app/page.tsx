import BookCard from "../components/BookCard";

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

const books = [
  {
    id: 1,
    title: "Blockchain Basics",
    author: "Alice",
    price: "0.01",
    image: "/book1.jpg",
  },
  {
    id: 2,
    title: "Smart Contracts",
    author: "Bob",
    price: "0.02",
    image: "/book2.jpg",
  },
  {
    id: 3,
    title: "Web3 for Writers",
    author: "Carol",
    price: "0.03",
    image: "/book1.jpg",
  },
  {
    id: 4,
    title: "NFT Publishing Guide",
    author: "David",
    price: "0.04",
    image: "/book2.jpg",
  },
];

export default function HomePage() {
  return (
    <main className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <section className="mx-auto w-full max-w-7xl rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Marketplace
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600 sm:text-lg">
          Browse featured books in this demo marketplace.
        </p>

        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              title={book.title}
              author={book.author}
              price={book.price}
              image={book.image}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
