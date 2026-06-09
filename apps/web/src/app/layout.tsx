import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Razzle — the fantasy football research lab",
  description: "The Screener is forever free. The intelligence is what you pay for.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Root layout in the App Router applies to every page; family names must
            match --font-display/--font-mono/--font-hand in packages/ui/tokens.css. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Space+Mono:wght@400;700&family=Caveat:wght@500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
