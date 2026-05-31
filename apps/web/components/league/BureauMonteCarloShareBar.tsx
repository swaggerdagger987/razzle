"use client";

import { useCallback, useState } from "react";
import {
  encodeBureauMonteCarloOgSnapshot,
  type BureauMonteCarloOgRow,
} from "@/lib/bureau-monte-carlo-og-snapshot";

interface Props {
  leagueId: string;
  userId: string;
  scenarioQuery?: string;
  /** Top odds visible in Bureau — OG card matches this board without live API. */
  odds?: BureauMonteCarloOgRow[];
}

/** Copyable Monte Carlo URL + OG export — mirrors BureauH2HShareBar. */
export function BureauMonteCarloShareBar({ leagueId, userId, scenarioQuery, odds }: Props) {
  const [copied, setCopied] = useState(false);

  const simPath = `/league/${leagueId}/monte-carlo${scenarioQuery ? `?${scenarioQuery}` : ""}`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    user: userId,
    download: "1",
  });
  const ranked = odds?.length
    ? [...odds].sort((a, b) => b.championship_pct - a.championship_pct).slice(0, 3)
    : undefined;
  const snap =
    ranked?.length
      ? encodeBureauMonteCarloOgSnapshot({ rows: ranked })
      : undefined;
  if (snap) ogParams.set("snapshot", snap);

  const copyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${simPath}` : simPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [simPath]);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy sim link"}
      </button>
      <a
        href={`/og/monte-carlo?${ogParams.toString()}`}
        download="razzle-monte-carlo.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
