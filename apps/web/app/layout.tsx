import type { Metadata } from "next";
import "@razzle/ui/index.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "Razzle — Free Fantasy Football Research Lab",
  description:
    "The Screener is forever free. 100+ stat columns, custom formulas, dynasty intelligence. The tool your leaguemates don't know about yet.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://razzle.lol"),
  openGraph: {
    title: "Razzle — Free Fantasy Football Research Lab",
    description: "The Screener is forever free. The intelligence is what you pay for.",
    siteName: "razzle.lol",
    type: "website",
  },
  twitter: { card: "summary_large_image", site: "@razzle_lol" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Space+Mono:wght@400;700&family=Caveat:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
