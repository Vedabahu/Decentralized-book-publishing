import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../components/Navbar";
import ToastViewport from "../components/ToastViewport";
import { AppProvider } from "../contexts/AppContext";
import { ToastProvider } from "../contexts/ToastContext";
import { WalletProvider } from "../contexts/WalletContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Decentralized Book Publishing",
  description: "Phase 1 placeholder UI for the marketplace flows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <AppProvider>
          <WalletProvider>
            <ToastProvider>
              <Navbar />
              <main className="pt-24 pb-6">{children}</main>
              <ToastViewport />
            </ToastProvider>
          </WalletProvider>
        </AppProvider>
      </body>
    </html>
  );
}
