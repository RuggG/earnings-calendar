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
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 antialiased`}
      >
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white shadow-sm">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="text-xl font-semibold text-slate-900">
                Earnings Calendar
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
                <Link
                  href="/"
                  className="transition hover:text-slate-900"
                >
                  Calendar
                </Link>
                <Link
                  href="/previews"
                  className="transition hover:text-slate-900"
                >
                  Next 5 Business Days
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
