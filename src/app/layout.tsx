import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Primer Reports Earnings Calendar",
  description:
    "Upcoming earnings events and preview reports pulled from Primer Reports data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gradient-to-br from-slate-50 to-blue-50/30 antialiased`}
      >
        <div className="min-h-screen">
          <header className="border-b border-blue-100/50 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Earnings Calendar
                </span>
              </Link>
              <nav className="flex items-center gap-2">
                <Link
                  href="/"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Calendar
                </Link>
                <Link
                  href="/previews"
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500"
                >
                  Next 5 Days
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
