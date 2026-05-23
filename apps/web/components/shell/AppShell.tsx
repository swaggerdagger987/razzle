"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ContextBar } from "./ContextBar";
import { DevToolbar } from "./DevToolbar";
import { MobileNav } from "./MobileNav";
import { PlayerSheet } from "./PlayerSheet";
import { PrimaryNav } from "./PrimaryNav";
import { PlayerSheetProvider } from "@/lib/player-sheet-context";

function ShellInner({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PrimaryNav />
      <DevToolbar />
      <ContextBar />
      <div className="app-shell-main">{children}</div>
      <MobileNav />
      <PlayerSheet />
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PlayerSheetProvider>
        <ShellInner>{children}</ShellInner>
      </PlayerSheetProvider>
    </Suspense>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="primary-nav">
        <Link href="/" className="primary-nav-brand" style={{ fontFamily: "var(--font-display)" }}>
          <span aria-hidden>🐯</span>
          <span>
            Razzle<span className="text-orange">.lol</span>
          </span>
        </Link>
        <Link
          href="/explore"
          className="chunky chunky-hover bg-orange px-4 py-2 text-sm text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Open Explore
        </Link>
      </header>
      {children}
    </>
  );
}
