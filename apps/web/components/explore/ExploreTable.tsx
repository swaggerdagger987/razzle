"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PositionPill } from "@razzle/ui";
import type { PlayerRow } from "@/lib/api";
import type { ExploreUniverse } from "@/lib/explore-params";
import { formulaColumnKey, type SavedFormula } from "@/lib/formulas";
import { usePlayerSheet } from "@/lib/player-sheet-context";
import { ExploreMarginNote } from "./ExploreMarginNote";

const columnHelper = createColumnHelper<PlayerRow>();

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Props {
  rows: PlayerRow[];
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
  universe?: ExploreUniverse;
  formulas?: SavedFormula[];
}

export function ExploreTable({
  rows,
  sortKey,
  sortDir,
  onSort,
  universe = "nfl",
  formulas = [],
}: Props) {
  const { openPlayer } = usePlayerSheet();
  const primaryKey = universe === "college" ? "total_yards" : "fantasy_points_ppr";
  const primaryHeader = universe === "college" ? "Yards" : "FPTS";

  const hiddenKeys = new Set([
    "player_id",
    "full_name",
    "position",
    "team",
    "age",
    "games",
    "fantasy_points_ppr",
    "total_yards",
  ]);

  const extraKeys = rows.length
    ? Object.keys(rows[0]!).filter((k) => !hiddenKeys.has(k)).slice(0, 4)
    : [];

  const columns = [
    columnHelper.accessor("full_name", {
      header: "Player",
      cell: (info) => info.getValue(),
    }),
    ...(universe === "nfl"
      ? [
          columnHelper.display({
            id: "staff_note",
            header: "Staff",
            cell: ({ row }) => <ExploreMarginNote row={row.original} universe={universe} />,
          }),
        ]
      : []),
    columnHelper.accessor("position", {
      header: "Pos",
      cell: (info) => <PositionPill position={info.getValue()} />,
    }),
    columnHelper.accessor("team", { header: universe === "college" ? "School" : "Team" }),
    ...(universe === "nfl"
      ? [
          columnHelper.accessor("age", {
            header: "Age",
            cell: (info) => info.getValue() ?? "—",
          }),
        ]
      : []),
    columnHelper.accessor("games", { header: "GP" }),
    columnHelper.accessor(primaryKey as "fantasy_points_ppr", {
      id: primaryKey,
      header: primaryHeader,
      cell: (info) => {
        const val = info.getValue();
        if (universe === "college") return Number(val ?? 0).toLocaleString();
        return Number(val ?? 0).toFixed(1);
      },
    }),
    ...extraKeys.map((key) =>
      columnHelper.display({
        id: key,
        header: key.replace(/_/g, " "),
        cell: ({ row }) => {
          const val = row.original[key];
          if (typeof val === "number") return val.toFixed(1);
          return String(val ?? "—");
        },
      }),
    ),
    ...formulas.map((formula) => {
      const colKey = formulaColumnKey(formula.name);
      return columnHelper.display({
        id: colKey,
        header: formula.name,
        cell: ({ row }) => {
          const val = row.original[colKey];
          return typeof val === "number" ? val.toFixed(1) : "—";
        },
      });
    }),
  ];

  const sortableKeys = [
    "full_name",
    primaryKey,
    ...extraKeys,
    ...formulas.map((f) => formulaColumnKey(f.name)),
  ];

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-wrap explore-table-desktop chunky bg-bg-card hidden md:block">
      <table className="screener-table">
        <thead className="thead-shadow">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const key = header.column.id;
                const sortable = sortableKeys.includes(key);
                return (
                  <th
                    key={header.id}
                    onClick={() => sortable && onSort(key)}
                    className={sortable ? "sortable" : undefined}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {sortKey === key && (sortDir === "asc" ? " ↑" : " ↓")}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="screener-row"
              onClick={() =>
                openPlayer({
                  playerId: row.original.player_id,
                  slug: slugify(row.original.full_name),
                  name: row.original.full_name,
                  position: row.original.position,
                  team: row.original.team,
                })
              }
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
