import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/ThemeProvider";

/**
 * Three families, three jobs. The reasoning lives in `globals.css`, which is
 * this design's authority; `context/style-guide.md`, which this used to cite,
 * documented a colour palette that no longer exists and was deleted.
 *
 *   Instrument Sans  UI chrome, labels, buttons. Never body copy.
 *   Newsreader       Body copy and every display heading. Optical sizing is
 *                    on, so the same family reads right at 15px and at 124px.
 *   JetBrains Mono   Code, and the micro-labels that mark a piece of the
 *                    interface as machinery rather than prose.
 *
 * All three are variable fonts, so `weight` is deliberately omitted — next/font
 * ships the full axis and CSS picks the instance.
 */
const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gray Matter Coding Workshop",
  description:
    "FRC Programming Workshop covering proven patterns, hardware setup, command-based programming, and PID tuning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${jetbrainsMono.variable} ${newsreader.variable} antialiased bg-[var(--bg)] text-[var(--tx)]`}
        suppressHydrationWarning={true}
      >
        {/* Marks the document as "JavaScript is running", before first paint.
            Everything that hides itself waiting for script — today that is the
            home page's scroll reveal, see `.reveal` in globals.css — gates its
            hidden state on this class, so a visitor whose JS never arrives
            gets the resolved state rather than a blank section. Same technique
            and the same placement next-themes uses for its own pre-paint
            class.

            It also replays the mechanism a student picked on an earlier
            lesson, as `data-mechanism` on the same element. Every mechanism
            lesson ships both readings and `globals.css` hides one, so this
            attribute is what decides which lesson paints. Setting it here
            rather than in an effect is the difference between a flywheel
            student reading a flywheel page and a flywheel student watching an
            arm page turn into one, on every page of the chain. A `try` because
            `localStorage` throws outright in some privacy modes, and a lesson
            that fails to render is a worse outcome than a lesson that forgets
            the answer. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js");try{var m=localStorage.getItem("workshop:mechanism");if(m==="arm"||m==="flywheel")document.documentElement.dataset.mechanism=m}catch(e){}`,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
