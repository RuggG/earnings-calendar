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
    "Upcoming earnings events and preview reports from Primer Reports. Track the next 30 days of earnings with advanced filtering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 antialiased`}
      >
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 transition group-hover:bg-violet-700">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-900">
                    Earnings Calendar
                  </span>
                  <span className="text-xs text-slate-500">by Primer Reports</span>
                </div>
              </Link>
              <a
                href="https://primerapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-slate-600 hover:text-violet-600 transition"
              >
                Learn more about Primer →
              </a>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
          <footer className="border-t border-slate-200 bg-white mt-20">
            <div className="mx-auto max-w-7xl px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-600">
                  © {new Date().getFullYear()} Primer Reports. All rights reserved.
                </p>
                <div className="flex gap-6">
                  <a
                    href="mailto:hello@primerapp.com"
                    className="text-sm text-slate-600 hover:text-violet-600 transition"
                  >
                    Contact
                  </a>
                  <a
                    href="https://primerapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 hover:text-violet-600 transition"
                  >
                    Website
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
