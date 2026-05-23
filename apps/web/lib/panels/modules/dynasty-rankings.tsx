"use client";
import { GenericTablePanel } from "./generic-table";
import type { PanelDef } from "../registry";

export default function DynastyRankings({ panel }: { panel: PanelDef }) {
  return (
    <GenericTablePanel
      panel={panel}
      endpoint="/api/dynasty-rankings?limit=200"
      columns={[
        { key: "rank", label: "Rank" },
        { key: "full_name", label: "Player" },
        { key: "position", label: "Pos" },
        { key: "team", label: "Tm" },
        { key: "age", label: "Age" },
        { key: "dynasty_value", label: "Value", format: (v) => Number(v ?? 0).toFixed(1) },
      ]}
    />
  );
}
