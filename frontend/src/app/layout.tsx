import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium, Roboto_Slab } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";
import { cn } from "@/lib/utils";

const robotoSlabHeading = Roboto_Slab({subsets:['latin'],variable:'--font-heading'});

const oxanium = Oxanium({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", oxanium.variable, robotoSlabHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1 p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
