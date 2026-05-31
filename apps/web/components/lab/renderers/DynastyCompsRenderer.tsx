"use client";

import type { PanelDefinition } from "@razzle/panels";
import { PositionPill } from "@razzle/ui";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DEFAULT_LAB_OG_PLAYER_ID, type OgSnapshotRow } from "../LabOgExportLink";
import { LabPanelShareBar } from "../LabPanelShareBar";
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";
import { ProGateFromPanelError } from "../ProGateFromPanelError";

interface CompRow {
  player_id: string;
  full_name: string;
  position: string;
  team: string;
  similarity: number;
  ppg?: number;
}

interface CompsData {
  player?: { player_id: string; full_name: string; position: string; team: string };
  comps?: CompRow[];
  error?: string;
}

interface SearchHit {
  player_id: string;
  full_name: string;
  position: string;
  team: string;
}

interface Props {
  panel: PanelDefinition;
}

export function DynastyCompsRenderer({ panel }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agent = panelAgent(panel.slug);

  const playerId = searchParams.get("id") ?? DEFAULT_LAB_OG_PLAYER_ID;
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);

  const q = useQuery({
    queryKey: ["panel", panel.slug, playerId],
    queryFn: async () => {
      const qs = new URLSearchParams({ player_id: playerId });
      const res = await fetch(`/api/panels/${panel.slug}?${qs.toString()}`);
      if (res.status === 402) {
        const body = await res.json().catch(() => ({}));
        const detail = (body as { detail?: Record<string, string> }).detail ?? {};
        throw Object.assign(new Error(detail.message ?? "Pro plan required"), { upgrade: detail });
      }
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.json() as Promise<CompsData>;
    },
  });

  async function onSearchInput(val: string) {
    setQuery(val);
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(`/api/players/quick-search?q=${encodeURIComponent(val)}`);
    if (!res.ok) return;
    const hits = (await res.json()) as SearchHit[];
    setSuggestions(hits.slice(0, 8));
  }

  function selectPlayer(hit: SearchHit) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("id", hit.player_id);
    next.set("name", hit.full_name);
    router.replace(`/lab/${panel.slug}?${next.toString()}` as Route);
    setQuery("");
    setSuggestions([]);
  }

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    const comps = q.data?.comps ?? [];
    return comps.slice(0, 6).map((c) => ({
      name: c.full_name,
      position: c.position,
      team: c.team,
      stat: Math.round(c.similarity * 100),
      statLabel: "Match %",
    }));
  }, [q.data?.comps]);

  if (q.isPending) return <PanelAgentLoading agent={agent} />;

  if (q.isError) {
    const gate = ProGateFromPanelError({ panel, error: q.error });
    if (gate) return gate;
    const err = q.error as Error;
    return <p className="p-6 text-red">something fumbled: {err.message}</p>;
  }

  const target = q.data?.player;
  const comps = q.data?.comps ?? [];
  const exportPlayerId = target?.player_id ?? playerId;

  return (
    <div className="dynasty-comps-panel">
      <PanelAgentHeader agent={agent} slug={panel.slug} />

      <div className="mb-4">
        <input
          type="search"
          className="chunky w-full max-w-md bg-bg-card px-3 py-2 text-sm"
          placeholder="search player for comps…"
          value={query}
          onChange={(e) => onSearchInput(e.target.value)}
          aria-label="Search player"
        />
        {suggestions.length > 0 && (
          <ul className="chunky mt-2 max-w-md bg-bg-card p-2">
            {suggestions.map((hit) => (
              <li key={hit.player_id}>
                <button type="button" className="w-full px-2 py-1 text-left text-sm hover:bg-bg-warm" onClick={() => selectPlayer(hit)}>
                  {hit.full_name}{" "}
                  <PositionPill position={hit.position as "QB" | "RB" | "WR" | "TE"} /> {hit.team}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {target && (
        <p className="text-ink-medium mb-4 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          Comps for {target.full_name} ({target.position}, {target.team})
        </p>
      )}

      {q.data?.error && !comps.length ? (
        <p className="text-ink-medium p-6">{q.data.error}</p>
      ) : comps.length === 0 ? (
        <p className="text-ink-medium p-6">{agent.emptyCopy}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {comps.map((c) => (
            <li key={c.player_id} className="chunky flex flex-wrap items-center gap-2 bg-bg-card px-3 py-2 text-sm">
              <span className="font-bold">{c.full_name}</span>
              <PositionPill position={c.position as "QB" | "RB" | "WR" | "TE"} />
              <span className="text-ink-light">{c.team}</span>
              <span className="text-orange font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                {Math.round(c.similarity * 100)}% match
              </span>
            </li>
          ))}
        </ul>
      )}

      {(target || comps.length > 0) && (
        <footer className="mt-6 border-t border-ink pt-4">
          <LabPanelShareBar
            slug="dynasty-comps"
            downloadName="razzle-dynasty-comps.png"
            playerId={exportPlayerId}
            snapshotRows={ogSnapshotRows}
            copyLabel="copy dynasty comps link"
          />
        </footer>
      )}
    </div>
  );
}
