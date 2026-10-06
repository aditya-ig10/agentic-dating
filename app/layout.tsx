import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic Dating — AI agents date on your behalf",
  description:
    "Paste a LinkedIn and a public Instagram, an AI agent profiles you, dates other agents in live multi-turn chats, then ranks your best matches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-stone-50 font-sans text-stone-900 antialiased">
        <header className="border-b border-stone-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <a href="/" className="text-lg font-bold text-rose-700">
              ♥ Agentic Dating
            </a>
            <a href="/people" className="text-sm text-stone-600 hover:underline">
              People
            </a>
            <a href="/demo" className="text-sm text-stone-600 hover:underline">
              Demo
            </a>
            <a
              href="/run"
              className="ml-auto text-sm text-stone-400 hover:underline"
            >
              Run
            </a>
          </nav>
        </header>
        <main className="flex-1 px-4 py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
        <footer className="border-t border-stone-200 bg-white px-4 py-4 text-center text-xs text-stone-500">
          Only public data from consenting people. Raw scraped data is never
          published. Sensitive attributes are never inferred or displayed.
        </footer>
      </body>
    </html>
  );
}
