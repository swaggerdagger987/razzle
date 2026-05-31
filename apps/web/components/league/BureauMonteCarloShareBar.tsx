"use client";

import { useCallback, useState } from "react";

interface Props {
  leagueId: string;
  userId: string;
  scenarioQuery?: string;
}

/** Copyable Monte Carlo URL + OG export — mirrors BureauH2HShareBar. */
export function BureauMonteCarloShareBar({ leagueId, userId, scenarioQuery }: Props) {
  const [copied, setCopied] = useState(false);

  const simPath = `/league/${leagueId}/monte-carlo${scenarioQuery ? `?${scenarioQuery}` : ""}`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    user: userId,
    download: "1",
  });

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
