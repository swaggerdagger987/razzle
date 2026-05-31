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

/** Copyable OG preview URL + PNG export — mirrors BureauH2HShareBar. */
export function BureauMonteCarloShareBar({ leagueId, userId, scenarioQuery, odds }: Props) {
  const [copied, setCopied] = useState(false);

  const simPath = `/league/${leagueId}/monte-carlo${scenarioQuery ? `?${scenarioQuery}` : ""}`;

  const previewParams = new URLSearchParams({
    league: leagueId,
    user: userId,
  });
  const ranked = odds?.length
    ? [...odds].sort((a, b) => b.championship_pct - a.championship_pct).slice(0, 3)
    : undefined;
  const snap =
    ranked?.length ? encodeBureauMonteCarloOgSnapshot({ rows: ranked }) : undefined;
  if (snap) previewParams.set("snapshot", snap);

  const previewPath = `/og/monte-carlo?${previewParams.toString()}`;

  const exportParams = new URLSearchParams(previewParams);
  exportParams.set("download", "1");

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
        href={previewPath}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-chunky text-xs"
      >
        preview card
      </a>
      <a
        href={`/og/monte-carlo?${exportParams.toString()}`}
        download="razzle-monte-carlo.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
