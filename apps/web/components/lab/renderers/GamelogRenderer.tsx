"use client";

import type { PanelDefinition } from "@razzle/panels";
import { PositionPill } from "@razzle/ui";
import { toExplore, toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { isUpgradeRequiredError } from "@/lib/panel-api";
import { usePlayerSheet } from "@/lib/player-sheet-context";
import { LabOgExportLink, type OgSnapshotRow } from "../LabOgExportLink";
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "../PanelAgentHeader";
import { ProUpgradeGate } from "../ProUpgradeGate";

interface WeekRow {
  week: number;
  fpts: number;
  pass_yd?: number;
  pass_td?: number;
  ints?: number;
  pass_att?: number;
  cmp?: number;
  rush_yd?: number;
  rush_td?: number;
  car?: number;
  rec_yd?: number;
  rec_td?: number;
  rec?: number;
  tgt?: number;
}

interface GamelogData {
  player_id?: string;
  name?: string;
  position?: string;
  team?: string;
  season?: number;
  available_seasons?: number[];
  games?: number;
  ppg?: number;
  weeks?: WeekRow[];
  totals?: Record<string, number>;
  error?: string;
}

interface SearchHit {
  player_id: string;
  full_name: string;
  position: string;
  team: string;
}

type Col = { key: keyof WeekRow | "fpts"; label: string };

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fptsClass(fpts: number): string {
  if (fpts >= 30) return "text-teal font-bold";
  if (fpts >= 20) return "text-blue font-bold";
  if (fpts >= 10) return "";
  return "text-red";
}

function columnsForPosition(position: string): Col[] {
  const base: Col[] = [
    { key: "week", label: "Wk" },
    { key: "fpts", label: "PPR" },
  ];
  if (position === "QB") {
    return [
      ...base,
      { key: "cmp", label: "Cmp" },
      { key: "pass_att", label: "Att" },
      { key: "pass_yd", label: "Pass Yd" },
      { key: "pass_td", label: "Pass TD" },
      { key: "ints", label: "INT" },
      { key: "car", label: "Car" },
      { key: "rush_yd", label: "Rush Yd" },
      { key: "rush_td", label: "Rush TD" },
    ];
  }
  if (position === "RB") {
    return [
      ...base,
      { key: "car", label: "Car" },
      { key: "rush_yd", label: "Rush Yd" },
      { key: "rush_td", label: "Rush TD" },
      { key: "tgt", label: "Tgt" },
      { key: "rec", label: "Rec" },
      { key: "rec_yd", label: "Rec Yd" },
      { key: "rec_td", label: "Rec TD" },
    ];
  }
  return [
    ...base,
    { key: "tgt", label: "Tgt" },
    { key: "rec", label: "Rec" },
    { key: "rec_yd", label: "Rec Yd" },
    { key: "rec_td", label: "Rec TD" },
    { key: "car", label: "Car" },
    { key: "rush_yd", label: "Rush Yd" },
    { key: "rush_td", label: "Rush TD" },
  ];
}

function formatCell(val: unknown): string {
  if (val == null) return "0";
  if (typeof val === "number") return Number.isInteger(val) ? String(val) : val.toFixed(1);
  return String(val);
}

interface Props {
  panel: PanelDefinition;
}

export function GamelogRenderer({ panel }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openPlayer } = usePlayerSheet();
  const agent = panelAgent(panel.slug);

  const playerId = searchParams.get("id") ?? "";
  const playerName = searchParams.get("name") ?? "";
  const playerPos = searchParams.get("pos") ?? "";
  const seasonParam = searchParams.get("season");

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);

  const season = seasonParam ? Number(seasonParam) : undefined;

  const q = useQuery({
    queryKey: ["panel", panel.slug, playerId, season],
    enabled: Boolean(playerId),
    queryFn: async () => {
      const qs = new URLSearchParams({ player_id: playerId });
      if (season) qs.set("season", String(season));
      const res = await fetch(`/api/panels/${panel.slug}?${qs.toString()}`);
      if (res.status === 402) {
        const body = await res.json().catch(() => ({}));
        const detail = (body as { detail?: Record<string, string> }).detail ?? {};
        throw Object.assign(new Error(detail.message ?? "Pro plan required"), {
          upgrade: detail,
        });
      }
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.json() as Promise<GamelogData>;
    },
  });

  const cols = useMemo(
    () => columnsForPosition(q.data?.position ?? playerPos ?? "WR"),
    [q.data?.position, playerPos],
  );

  const peakWeek = useMemo(() => {
    const weeks = q.data?.weeks ?? [];
    let best: WeekRow | null = null;
    for (const w of weeks) {
      if (!best || w.fpts > best.fpts) best = w;
    }
    return best;
  }, [q.data?.weeks]);

  const ogSnapshotRows = useMemo((): OgSnapshotRow[] => {
    const weekRows = q.data?.weeks ?? [];
    const pos = q.data?.position ?? playerPos ?? "WR";
    const team = q.data?.team ?? "";
    return [...weekRows]
      .sort((a, b) => b.fpts - a.fpts)
      .slice(0, 6)
      .map((w) => ({
        name: `Wk ${w.week}`,
        position: pos,
        team,
        stat: w.fpts,
        statLabel: "PPR",
      }));
  }, [q.data?.weeks, q.data?.position, q.data?.team, playerPos]);

  function selectPlayer(hit: SearchHit) {
    const q = new URLSearchParams(searchParams.toString());
    q.set("id", hit.player_id);
    q.set("player", slugify(hit.full_name));
    q.set("name", hit.full_name);
    q.set("pos", hit.position);
    q.set("team", hit.team);
    q.delete("season");
    router.replace(`/lab/gamelog?${q.toString()}` as Route);
    setQuery("");
    setSuggestions([]);
  }

  function onSeasonChange(next: string) {
    const q = new URLSearchParams(searchParams.toString());
    if (next) q.set("season", next);
    else q.delete("season");
    router.replace(`/lab/gamelog?${q.toString()}` as Route);
  }

  async function onSearchInput(text: string) {
    setQuery(text);
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/players/quick-search?q=${encodeURIComponent(text)}&limit=8`);
      if (!res.ok) return;
      const hits = (await res.json()) as SearchHit[];
      setSuggestions(hits);
    } catch {
      setSuggestions([]);
    }
  }

  if (!playerId) {
    return (
      <div className="gamelog-panel">
        <PanelAgentHeader agent={agent} slug={panel.slug} />
        <p className="text-ink-medium mb-4 text-sm" style={{ fontFamily: "var(--font-hand)", fontSize: "1.1rem" }}>
          search a player — or open from Explore / Player Sheet
        </p>
        <div className="relative max-w-md">
          <input
            type="search"
            className="input-chunky w-full"
            placeholder="search for a player..."
            value={query}
            onChange={(e) => onSearchInput(e.target.value)}
            aria-label="Player search"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto border-3 border-ink bg-bg-card shadow-chunky">
              {suggestions.map((hit) => (
                <li key={hit.player_id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-bg-warm"
                    onClick={() => selectPlayer(hit)}
                  >
                    <span>{hit.full_name}</span>
                    <span className="text-ink-medium text-xs">
                      {hit.position} · {hit.team}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <footer className="mt-6 flex flex-wrap items-center gap-4">
          <Link href="/explore" className="text-sm text-orange underline">
            pick a player in Explore →
          </Link>
          <LabOgExportLink
            slug="gamelog"
            downloadName="razzle-gamelog.png"
            playerId={DEFAULT_LAB_OG_PLAYER_ID}
            label="export sample card"
          />
        </footer>
      </div>
    );
  }

  if (q.isPending) {
    return <PanelAgentLoading agent={agent} />;
  }

  if (q.isError) {
    const err = q.error as Error & { upgrade?: { required?: string; current?: string; message?: string } };
    if (err.upgrade) {
      return (
        <ProUpgradeGate
          panelSlug={panel.slug}
          panelTitle={panel.title}
          required={err.upgrade.required ?? "pro"}
          current={err.upgrade.current ?? "free"}
          message={err.upgrade.message}
        />
      );
    }
    if (isUpgradeRequiredError(err)) {
      return (
        <ProUpgradeGate
          panelSlug={panel.slug}
          panelTitle={panel.title}
          required={err.required}
          current={err.current}
          message={err.message}
        />
      );
    }
    return <p className="p-6 text-red">something fumbled: {err.message}</p>;
  }

  const data = q.data;
  if (data?.error) {
    return <p className="text-ink-medium p-6">{data.error}</p>;
  }

  const weeks = data?.weeks ?? [];
  const displayName = data?.name ?? playerName;
  const displayPos = data?.position ?? playerPos;

  return (
    <div className="gamelog-panel">
      <PanelAgentHeader agent={agent} slug={panel.slug} />

      <div className="bg-bg-card chunky mb-4 flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="text-left text-xl font-bold underline-offset-2 hover:underline"
            style={{ fontFamily: "var(--font-display)" }}
            onClick={() =>
              openPlayer({
                playerId: data?.player_id ?? playerId,
                slug: slugify(displayName),
                name: displayName,
                position: displayPos,
                team: data?.team,
              })
            }
          >
            {displayName}
          </button>
          {displayPos && <PositionPill position={displayPos as "QB" | "RB" | "WR" | "TE"} />}
          {data?.team && <span className="text-ink-medium text-sm">{data.team}</span>}
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="text-center">
            <p className="font-bold" style={{ fontFamily: "var(--font-mono)" }}>
              {data?.games ?? weeks.length}
            </p>
            <p className="text-ink-medium text-xs uppercase">Games</p>
          </div>
          <div className="text-center">
            <p className="font-bold" style={{ fontFamily: "var(--font-mono)" }}>
              {data?.totals?.fpts ?? "—"}
            </p>
            <p className="text-ink-medium text-xs uppercase">Total Pts</p>
          </div>
          <div className="text-center">
            <p className="font-bold" style={{ fontFamily: "var(--font-mono)" }}>
              {data?.ppg ?? "—"}
            </p>
            <p className="text-ink-medium text-xs uppercase">PPG</p>
          </div>
        </div>
      </div>

      {(data?.available_seasons?.length ?? 0) > 0 && (
        <label className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-ink-medium">Season</span>
          <select
            className="input-chunky"
            value={data?.season ?? ""}
            onChange={(e) => onSeasonChange(e.target.value)}
          >
            {(data?.available_seasons ?? []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}

      {!weeks.length ? (
        <p className="text-ink-medium p-6">{agent.emptyCopy}</p>
      ) : (
        <div className="table-wrap chunky bg-bg-card overflow-x-auto">
          <table className="screener-table">
            <thead className="thead-shadow">
              <tr>
                {cols.map((c) => (
                  <th key={c.key} className={c.key === "week" ? "text-center" : "text-right"}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.week} className="screener-row">
                  {cols.map((c) => {
                    const val = w[c.key as keyof WeekRow];
                    const cls = c.key === "fpts" ? fptsClass(w.fpts) : "";
                    return (
                      <td key={c.key} className={`${cls}${c.key === "week" ? " text-center font-bold" : " text-right"}`}>
                        {formatCell(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="screener-row font-bold" style={{ borderTop: "3px solid var(--ink)" }}>
                {cols.map((c) => {
                  if (c.key === "week") return <td key={c.key} className="text-center">TOT</td>;
                  const tval = data?.totals?.[c.key === "fpts" ? "fpts" : c.key] ?? 0;
                  return (
                    <td key={c.key} className="text-right">
                      {formatCell(tval)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {peakWeek && displayName && (
        <footer className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink pt-4">
          <Link
            href={
              toRoom({
                agentId: "atlas",
                panelSlug: "gamelog",
                question: `${displayName} peaked at ${peakWeek.fpts} PPR in week ${peakWeek.week} — is the rest of the season consistent or volatile?`,
              }) as Route
            }
            className="text-sm text-orange underline"
          >
            Ask Atlas about {displayName}&apos;s tape →
          </Link>
          <Link
            href={
              toExplore({
                player: {
                  playerId: data?.player_id ?? playerId,
                  slug: slugify(displayName),
                  name: displayName,
                  position: displayPos,
                  team: data?.team,
                },
              }) as Route
            }
            className="text-sm text-ink-medium underline"
          >
            open in Explore
          </Link>
          <LabOgExportLink
            slug="gamelog"
            downloadName="razzle-gamelog.png"
            playerId={(data?.player_id ?? playerId) || undefined}
            position={displayPos || undefined}
            snapshotRows={ogSnapshotRows}
          />
        </footer>
      )}
    </div>
  );
}
