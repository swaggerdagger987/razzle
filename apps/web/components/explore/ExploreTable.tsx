"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PositionPill } from "@razzle/ui";
import type { PlayerRow } from "@/lib/api";
import { usePlayerSheet } from "@/lib/player-sheet-context";

const columnHelper = createColumnHelper<PlayerRow>();

const BASE_COLUMNS = [
  columnHelper.accessor("full_name", {
    header: "Player",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("position", {
    header: "Pos",
    cell: (info) => <PositionPill position={info.getValue()} />,
  }),
  columnHelper.accessor("team", { header: "Team" }),
  columnHelper.accessor("age", {
    header: "Age",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("games", { header: "GP" }),
  columnHelper.accessor("fantasy_points_ppr", {
    header: "FPTS",
    cell: (info) => Number(info.getValue()).toFixed(1),
  }),
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Props {
  rows: PlayerRow[];
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
}

export function ExploreTable({ rows, sortKey, sortDir, onSort }: Props) {
  const { openPlayer } = usePlayerSheet();

  const extraKeys = rows.length
    ? Object.keys(rows[0]!).filter(
        (k) => !["player_id", "full_name", "position", "team", "age", "games", "fantasy_points_ppr"].includes(k),
      ).slice(0, 4)
    : [];

  const columns = [
    ...BASE_COLUMNS,
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
  ];

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-wrap chunky bg-bg-card hidden md:block">
      <table className="screener-table">
        <thead className="thead-shadow">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const key = header.column.id;
                const sortable = ["full_name", "fantasy_points_ppr", ...extraKeys].includes(key);
                return (
                  <th
                    key={header.id}
                    onClick={() => sortable && onSort(key === "full_name" ? "full_name" : key)}
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
