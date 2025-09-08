import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import KeyboardNavigationProvider from "@/components/KeyboardNavigationProvider";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import AutoFocusMain from "@/components/AutoFocusMain";

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
    <html lang="en" data-theme="system">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <div className="flex flex-col h-screen">
          <KeyboardNavigationProvider />
          <AutoFocusMain />
          <header className="flex-shrink-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex justify-between items-center z-50">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/gray-matter-logo.jpg"
                alt="Gray Matter Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg"
              />
              <span className="font-bold text-lg text-[var(--card-foreground)]">Gray Matter Workshop</span>
            </div>
            <SearchBar />
          </header>
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main 
              className="flex-1 overflow-y-auto bg-[var(--card)] text-[var(--card-foreground)] focus:outline-none"
              tabIndex={0}
            >
              {children}
            </main>
          </div>
          <KeyboardShortcutsHelp />
        </div>
      </body>
    </html>
  );
}
