import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import KeyboardNavigationProvider from "@/components/KeyboardNavigationProvider";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import AutoFocusMain from "@/components/AutoFocusMain";
import AnalyticsBanner from "@/components/AnalyticsBanner";
import AlphaBanner from "@/components/AlphaBanner";
import Footer from "@/components/Footer";
import { SidebarProvider } from "@/contexts/SidebarContext";
import HamburgerMenu from "@/components/HamburgerMenu";

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen">
        <KeyboardNavigationProvider />
        <AutoFocusMain />
        <AlphaBanner />
        <header
          className="flex-shrink-0 flex justify-between items-center z-10 px-6 py-3.5"
          style={{
            background: "var(--bg)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="flex items-center gap-3">
            <HamburgerMenu />
            <Image
              src="/images/gray-matter-logo.jpg"
              alt="Gray Matter Logo"
              width={36}
              height={36}
              quality={95}
              className="w-9 h-9 rounded-lg"
            />
            <span
              className="font-semibold text-base"
              style={{ color: "var(--fg)", letterSpacing: "-0.01em" }}
            >
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
            className="flex-1 overflow-y-auto focus:outline-none"
            style={{
              background: "var(--bg)",
              color: "var(--fg)",
            }}
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
  );
}
