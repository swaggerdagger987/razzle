"use client";

import type { PanelDefinition } from "@razzle/panels";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DEFAULT_LAB_OG_PLAYER_ID, LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";
import { ProGateFromPanelError } from "../ProGateFromPanelError";
import { ChartRenderer } from "./ChartRenderer";

interface PercentileRow {
  label?: string;
  key?: string;
  percentile?: number;
  value?: string | number;
}

interface PercentilesData {
  player?: { player_id?: string; full_name?: string; name?: string; position?: string; team?: string };
  percentiles?: PercentileRow[];
  error?: string;
}

interface Props {
  panel: PanelDefinition;
}

export function PercentilesRenderer({ panel }: Props) {
  const searchParams = useSearchParams();
  const agent = panelAgent(panel.slug);

  const playerId = searchParams.get("id") ?? DEFAULT_LAB_OG_PLAYER_ID;
  const playerName = searchParams.get("name") ?? "";

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
      return res.json() as Promise<PercentilesData>;
    },
  });

  const displayName =
    q.data?.player?.full_name ??
    q.data?.player?.name ??
    (playerName || "Ja'Marr Chase");
  const position = q.data?.player?.position ?? "WR";
  const team = q.data?.player?.team ?? "CIN";

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    const rows = q.data?.percentiles ?? [];
    return rows
      .map((p) => ({
        name: String(p.label ?? p.key ?? ""),
        position,
        team,
        stat: Number(p.percentile ?? 0),
        statLabel: p.value != null ? String(p.value) : "Pct",
      }))
      .filter((r) => r.name.trim().length > 0 && r.stat > 0)
      .sort((a, b) => b.stat - a.stat)
      .slice(0, 6);
  }, [q.data?.percentiles, position, team]);

  if (q.isPending) return <PanelAgentLoading agent={agent} />;
  if (q.isError) {
    const gate = ProGateFromPanelError({ panel, error: q.error });
    if (gate) return gate;
    return <p className="p-6 text-red">something fumbled: {(q.error as Error).message}</p>;
  }

  const chartPayload = {
    percentiles: q.data?.percentiles ?? [],
    player: q.data?.player,
  };

  return (
    <div className="percentiles-panel">
      <PanelAgentHeader agent={agent} slug={panel.slug} />
      {q.data?.error && !ogSnapshotRows.length ? (
        <p className="text-ink-medium p-6">{q.data.error}</p>
      ) : (
        <ChartRenderer data={chartPayload} type="bar-chart" />
      )}
      <footer className="mt-6 border-t border-ink pt-4">
        <LabOgExportLink
          slug="percentiles"
          downloadName="razzle-percentiles.png"
          playerId={playerId}
          playerName={displayName}
          position={position}
          snapshotRows={ogSnapshotRows.length ? ogSnapshotRows : undefined}
        />
      </footer>
    </div>
  );
}
