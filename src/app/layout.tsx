import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import KeyboardNavigationProvider from "@/components/KeyboardNavigationProvider";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import AutoFocusMain from "@/components/AutoFocusMain";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AnalyticsBanner from "@/components/AnalyticsBanner";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import HamburgerMenu from "@/components/HamburgerMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gray Matter Coding Workshop",
  description:
    "FRC Programming Workshop covering best practices, hardware setup, command-based programming, and PID tuning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex flex-col h-screen">
              <KeyboardNavigationProvider />
              <AutoFocusMain />
              <header className="flex-shrink-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex justify-between items-center z-10">
                <div className="flex items-center space-x-3">
                  <HamburgerMenu />
                  <Image
                    src="/images/gray-matter-logo.jpg"
                    alt="Gray Matter Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-lg"
                  />
                  <span className="font-bold text-lg text-[var(--card-foreground)]">
                    Gray Matter Workshop
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <SearchBar />
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLScbzdTsfXt3xy9wTWsHpxCE919MJ1Cwv0wOOLifwnmvnilmHw/viewform?usp=header"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md transition-colors"
                    title="Give Feedback"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Feedback</span>
                  </a>
                </div>
              </header>
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main
                  className="flex-1 overflow-y-auto bg-[var(--card)] text-[var(--card-foreground)] focus:outline-none"
                  tabIndex={0}
                >
                  {children}
                  <Footer />
                </main>
              </div>
              <KeyboardShortcutsHelp />
              <AnalyticsBanner />
            </div>
          </SidebarProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
