"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Publish", href: "/publish" },
  { label: "Library", href: "/library" },
  { label: "Resale", href: "/resale" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-slate-900 transition hover:text-slate-700"
        >
          BookChain
        </Link>

        <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end sm:gap-3">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="ml-0 sm:ml-2">
            <WalletButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
