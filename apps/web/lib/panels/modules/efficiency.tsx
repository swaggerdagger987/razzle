"use client";
import { GenericTablePanel } from "./generic-table";
import type { PanelDef } from "../registry";

export default function Efficiency({ panel }: { panel: PanelDef }) {
  return (
    <GenericTablePanel
      panel={panel}
      endpoint="/api/efficiency-rankings"
      columns={[
        { key: "full_name", label: "Player" },
        { key: "position", label: "Pos" },
        { key: "team", label: "Tm" },
        { key: "ypo", label: "Y/Opp", format: (v) => Number(v ?? 0).toFixed(2) },
        { key: "td_rate", label: "TD%", format: (v) => `${(Number(v ?? 0) * 100).toFixed(1)}%` },
        { key: "efficiency_score", label: "Score", format: (v) => Number(v ?? 0).toFixed(2) },
      ]}
    />
  );
}
