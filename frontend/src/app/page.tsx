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
  return (
    <PagePlaceholder
      title="Marketplace"
      subtitle="A clean placeholder for the decentralized book marketplace."
    />
  );
}
