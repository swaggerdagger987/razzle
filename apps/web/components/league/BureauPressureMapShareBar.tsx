"use client";

import { useCallback, useState } from "react";

interface Props {
  leagueId: string;
}

/** Copyable Pressure Map URL + OG export — mirrors BureauH2HShareBar. */
export function BureauPressureMapShareBar({ leagueId }: Props) {
  const [copied, setCopied] = useState(false);

  const pressurePath = `/league/${leagueId}/pressure-map`;

  const ogParams = new URLSearchParams({
    league: leagueId,
    download: "1",
  });

  const copyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${pressurePath}`
        : pressurePath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [pressurePath]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn-chunky text-xs" onClick={() => void copyLink()}>
        {copied ? "copied!" : "copy pressure link"}
      </button>
      <a
        href={`/og/pressure-map?${ogParams.toString()}`}
        download="razzle-pressure-map.png"
        className="btn-chunky active text-xs"
        style={{ background: "var(--orange)", color: "var(--text-on-accent)" }}
      >
        export card
      </a>
    </div>
  );
}
