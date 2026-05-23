"use client";

import { POSITION_COLOR } from "@razzle/ui";
import type { Position } from "@razzle/types";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { useRef } from "react";
import { runScreener, type PlayerRow } from "@/lib/api";
import type { PanelDef } from "../registry";

const POSITIONS = ["QB", "RB", "WR", "TE"] as const;

const helper = createColumnHelper<PlayerRow>();
const columns = [
  helper.accessor("full_name", { header: "Player", size: 220 }),
  helper.accessor("position", {
    header: "Pos",
    size: 60,
    cell: (info) => (
      <span
        className="rounded px-2 py-0.5 text-xs font-bold text-white"
        style={{ background: POSITION_COLOR[info.getValue() as Position] }}
      >
        {info.getValue()}
      </span>
    ),
  }),
  helper.accessor("team", { header: "Tm", size: 60 }),
  helper.accessor("age", { header: "Age", size: 60 }),
  helper.accessor("games", { header: "GP", size: 50 }),
  helper.accessor("fantasy_points_ppr", {
    header: "FP (PPR)",
    size: 100,
    cell: (info) => info.getValue().toFixed(1),
  }),
];

export default function ScreenerPanel({ panel }: { panel: PanelDef }) {
  const [state, setState] = useQueryStates({
    q: parseAsString.withDefault(""),
    pos: parseAsArrayOf(parseAsStringEnum([...POSITIONS])).withDefault([]),
    season: parseAsInteger.withDefault(0),
    sort: parseAsString.withDefault("fantasy_points_ppr"),
    dir: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
  });

  const query = useQuery({
    queryKey: ["screener", state],
    queryFn: () =>
      runScreener({
        search: state.q,
        positions: state.pos as Position[],
        teams: [],
        season: state.season,
        week: 0,
        sort_key: state.sort,
        sort_direction: state.dir,
        limit: 250,
        offset: 0,
        filters: [],
        relevance: "fantasy",
        min_gp: 0,
      }),
  });

  const rows = query.data?.items ?? [];
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 12,
  });

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            {panel.title}
          </h1>
          <p className="text-sm text-ink-medium">{panel.blurb}</p>
        </div>
        <div className="flex items-center gap-2">
          {POSITIONS.map((p) => {
            const active = state.pos.includes(p);
            return (
              <button
                key={p}
                onClick={() =>
                  setState({ pos: active ? state.pos.filter((x) => x !== p) : [...state.pos, p] })
                }
                className={`chunky chunky-hover px-3 py-1 text-sm ${active ? "text-white" : ""}`}
                style={{
                  background: active ? POSITION_COLOR[p] : "var(--bg-card)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </header>

      <input
        type="search"
        placeholder="Search players..."
        value={state.q}
        onChange={(e) => setState({ q: e.target.value })}
        className="chunky w-full bg-bg-card px-4 py-2 text-sm"
      />

      <div ref={parentRef} className="chunky h-[640px] overflow-auto bg-bg-card">
        {query.isPending && <div className="p-6 text-center text-ink-medium">pulling film...</div>}
        {query.isError && (
          <div className="p-6 text-center text-red">
            something fumbled: {(query.error as Error).message}
          </div>
        )}
        {query.isSuccess && (
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-bg-card">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b-[3px] border-ink">
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="px-3 py-2 text-left font-bold"
                        style={{ width: h.getSize() }}
                        onClick={() => {
                          const nextDir = state.sort === h.id && state.dir === "desc" ? "asc" : "desc";
                          setState({ sort: h.id, dir: nextDir });
                        }}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
            </table>
            {virtualizer.getVirtualItems().map((v) => {
              const row = table.getRowModel().rows[v.index];
              if (!row) return null;
              return (
                <div
                  key={row.id}
                  style={{
                    position: "absolute",
                    top: v.start,
                    height: v.size,
                    width: "100%",
                  }}
                  className="border-b border-ink-faint hover:bg-orange-light"
                >
                  <div className="grid h-full grid-cols-[220px_60px_60px_60px_50px_100px] items-center px-3">
                    {row.getVisibleCells().map((c) => (
                      <div key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between text-xs text-ink-medium">
        <span>{rows.length} players shown</span>
        <a href={`/og/${panel.slug}?q=${state.q}`} className="underline">
          Share this view →
        </a>
      </footer>
    </div>
  );
}
