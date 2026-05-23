"use client";
import { GenericTablePanel } from "./generic-table";
import type { PanelDef } from "../registry";

export default function StatLeaders({ panel }: { panel: PanelDef }) {
  return (
    <GenericTablePanel
      panel={panel}
      endpoint="/api/stat-leaders?limit=100"
      columns={[
        { key: "rank", label: "#" },
        { key: "full_name", label: "Player" },
        { key: "position", label: "Pos" },
        { key: "team", label: "Tm" },
        { key: "fantasy_points_ppr", label: "FP", format: (v) => Number(v ?? 0).toFixed(1) },
      ]}
    />
  );
}
