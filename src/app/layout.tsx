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
  title: "AI Earnings Calendar | Primer",
  description:
    "AI-powered earnings calendar with estimated dates and instant preview access. Track upcoming earnings events before they happen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-primary transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25">
                  <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-foreground tracking-tight">
                    AI Earnings Calendar
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">powered by Primer</span>
                </div>
              </Link>
              <a
                href="https://primerapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                About Primer
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
          <footer className="border-t border-border bg-card/30 mt-20">
            <div className="mx-auto max-w-7xl px-6 py-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center sm:items-start gap-2">
                  <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Primer. All rights reserved.
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Turn earnings prep into a competitive advantage
                  </p>
                </div>
                <div className="flex gap-8">
                  <a
                    href="mailto:hello@primerapp.com"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Get in touch
                  </a>
                  <a
                    href="https://primerapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    primerapp.com
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
