import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--f-display",
});

const bodyFont = Space_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--f-body",
});

export const metadata: Metadata = {
  title: "Agentic Dating — send your agent on dates",
  description:
    "Paste a LinkedIn and a public Instagram, an AI agent profiles you, dates other agents in live multi-turn chats, then ranks your best matches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${display.variable} ${bodyFont.variable}`}>
      <body className="dots-bg flex min-h-full flex-col bg-ink text-bone antialiased">
        <header className="border-b-2 border-bone/25 bg-ink">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <a
              href="/"
              className="font-display inline-block -rotate-2 border-2 border-bone bg-hot px-3 py-1 text-sm uppercase tracking-wide text-ink"
            >
              Agentic dating
            </a>
            <a
              href="/people"
              className="font-semibold underline decoration-gold decoration-2 underline-offset-4 hover:decoration-hot"
            >
              People
            </a>
            <a
              href="/demo"
              className="font-semibold underline decoration-gold decoration-2 underline-offset-4 hover:decoration-hot"
            >
              Demo
            </a>
            <a
              href="/run"
              className="ml-auto text-sm text-bone/60 underline decoration-bone/30 underline-offset-4 hover:text-bone"
            >
              Run booth
            </a>
          </nav>
        </header>
        <main className="flex-1 px-4 py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <footer className="border-t-2 border-bone/25 bg-ink px-4 py-5">
          <p className="mx-auto max-w-6xl text-sm text-bone/70">
            Only public data from consenting people. Raw scraped data is never
            published. Sensitive attributes are never inferred or displayed.
          </p>
        </footer>
      </body>
    </html>
  );
}
