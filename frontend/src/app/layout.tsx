import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";

import { Sidebar } from "@/components/Sidebar";
import FloatingChatbot from "@/components/FloatingChatbot";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Aura-Style Premier Banking & Wealth Platform",
  description:
    "Next.js and FastAPI platform inspired by Aura India navigation, banking and wealth journeys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-[color:var(--canvas)] text-[color:var(--ink)]`}>
        <div className="min-h-screen xl:grid xl:grid-cols-[340px_1fr]">
          <Sidebar className="w-full" />
          <div className="min-h-screen">
            <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--canvas)]/90 backdrop-blur">
              <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--brand-red)]">
                    Premier operating console
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    One household view across banking, wealth, FX and compliance.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/global-transfers"
                    className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)]"
                  >
                    Global transfers
                  </Link>
                  <span className="rounded-full bg-[color:var(--brand-red)] px-4 py-2 text-sm font-semibold text-white">
                    AI services online
                  </span>
                </div>
              </div>
            </header>
            <main className="mx-auto max-w-[1440px] px-5 py-6 lg:px-8 lg:py-8">
              {children}
            </main>
            <FloatingChatbot />
          </div>
        </div>
      </body>
    </html>
  );
}
