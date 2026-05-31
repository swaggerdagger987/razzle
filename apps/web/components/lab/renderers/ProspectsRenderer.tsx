"use client";

import type { PanelDefinition } from "@razzle/panels";
import { PositionPill } from "@razzle/ui";
import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";

const POSITIONS = ["", "QB", "RB", "WR", "TE"] as const;

/** Sample RPS board while prospects load or board is empty — matches OG demo rows (Gate C). */
const PROSPECTS_SAMPLE_OG_ROWS: OgSnapshotRow[] = [
  { name: "Travis Hunter", position: "WR", team: "JAX", stat: 94, statLabel: "RPS" },
  { name: "Cam Ward", position: "QB", team: "TEN", stat: 91, statLabel: "RPS" },
  { name: "Ashton Jeanty", position: "RB", team: "LV", stat: 89, statLabel: "RPS" },
  { name: "Tyler Warren", position: "TE", team: "IND", stat: 86, statLabel: "RPS" },
  { name: "Tre Harris", position: "WR", team: "LAC", stat: 83, statLabel: "RPS" },
  { name: "Emeka Egbuka", position: "WR", team: "TB", stat: 80, statLabel: "RPS" },
];

interface Prospect {
  player_name: string;
  position: string;
  school: string;
  draft_year?: number;
  rps?: number;
  athletic_avg?: number;
  forty?: number | null;
  vertical?: number | null;
  height_display?: string;
  rank?: number;
}

interface ProspectsData {
  prospects?: Prospect[];
  draft_year?: number;
  position?: string;
}

interface Props {
  panel: PanelDefinition;
}

export function ProspectsRenderer({ panel }: Props) {
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>("");
  const agent = panelAgent(panel.slug);

  const q = useQuery({
    queryKey: ["panel", panel.slug, position],
    queryFn: async () => {
      const qs = position ? `?position=${position}` : "";
      const res = await fetch(`/api/panels/${panel.slug}${qs}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.json() as Promise<ProspectsData>;
    },
  });

  const prospects = q.data?.prospects ?? [];
  const top = prospects[0] ?? null;

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    return [...prospects]
      .sort((a, b) => (b.rps ?? 0) - (a.rps ?? 0))
      .slice(0, 6)
      .map((p) => ({
        name: p.player_name,
        position: p.position,
        team: p.school,
        stat: p.rps ?? 0,
        statLabel: "RPS",
      }));
  }, [prospects]);

  if (q.isPending) {
    return (
      <div className="prospects-panel">
        <PanelAgentHeader agent={agent} slug={panel.slug} />
        <PanelAgentLoading agent={agent} />
        <footer className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <LabOgExportLink
            slug="prospects"
            downloadName="razzle-prospects.png"
            position={position || undefined}
            snapshotRows={PROSPECTS_SAMPLE_OG_ROWS}
            label="export sample card"
          />
        </footer>
      </div>
    );
  }

  if (q.isError) {
    return <p className="p-6 text-red">something fumbled: {(q.error as Error).message}</p>;
  }

  return (
    <div className="prospects-panel">
      <PanelAgentHeader agent={agent} slug={panel.slug} />

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter by position">
        {POSITIONS.map((pos) => (
          <button
            key={pos || "ALL"}
            type="button"
            role="tab"
            aria-selected={position === pos}
            className={`btn-chunky text-sm${position === pos ? " bg-orange text-white" : ""}`}
            onClick={() => setPosition(pos)}
          >
            {pos || "All"}
          </button>
        ))}
      </div>

      {q.data?.draft_year && (
        <p className="text-ink-medium mb-4 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {prospects.length} prospects · {q.data.draft_year} class · RPS = Razzle prospect score
        </p>
      )}

      {!prospects.length ? (
        <div className="p-6">
          <p className="text-ink-medium">{agent.emptyCopy}</p>
          <footer className="mt-4 flex flex-wrap items-center gap-4">
            <LabOgExportLink
              slug="prospects"
              downloadName="razzle-prospects.png"
              position={position || undefined}
              snapshotRows={PROSPECTS_SAMPLE_OG_ROWS}
              label="export sample card"
            />
          </footer>
        </div>
      ) : (
        <div className="tier-stack">
          {prospects.slice(0, 50).map((p) => (
            <article key={`${p.player_name}-${p.rank}`} className="tier-block chunky bg-bg-card mb-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-ink-medium text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                  #{p.rank ?? "—"}
                </span>
                <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {p.player_name}
                </h3>
                <PositionPill position={p.position as "QB" | "RB" | "WR" | "TE"} />
                <span className="text-ink-medium text-sm">{p.school}</span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-ink-medium text-xs">RPS</dt>
                  <dd className="text-orange font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                    {p.rps != null ? p.rps.toFixed(1) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-medium text-xs">Athletic</dt>
                  <dd style={{ fontFamily: "var(--font-mono)" }}>
                    {p.athletic_avg != null ? `${p.athletic_avg.toFixed(1)}%` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-medium text-xs">40</dt>
                  <dd style={{ fontFamily: "var(--font-mono)" }}>{p.forty != null ? p.forty.toFixed(2) : "—"}</dd>
                </div>
                <div>
                  <dt className="text-ink-medium text-xs">Size</dt>
                  <dd style={{ fontFamily: "var(--font-mono)" }}>{p.height_display ?? "—"}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}

      {top && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <Link
            href={
              toRoom({
                agentId: "hawkeye",
                panelSlug: "prospects",
                question: `Scout ${top.player_name} (${top.position}, ${top.school}) — dynasty outlook for ${q.data?.draft_year}?`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Hawkeye about {top.player_name} →
          </Link>
          <Link href="/explore?universe=college" className="text-sm text-ink-medium underline">
            college screener →
          </Link>
          <LabOgExportLink
            slug="prospects"
            downloadName="razzle-prospects.png"
            position={position || undefined}
            snapshotRows={ogSnapshotRows}
          />
        </footer>
      )}
    </div>
  );
}
