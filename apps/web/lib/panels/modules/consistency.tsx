"use client";
import { GenericTablePanel } from "./generic-table";
import type { PanelDef } from "../registry";

export default function Consistency({ panel }: { panel: PanelDef }) {
  return (
    <GenericTablePanel
      panel={panel}
      endpoint="/api/consistency-rankings"
      columns={[
        { key: "full_name", label: "Player" },
        { key: "position", label: "Pos" },
        { key: "team", label: "Tm" },
        { key: "consistency_score", label: "Consistency", format: (v) => Number(v ?? 0).toFixed(2) },
        { key: "floor", label: "Floor", format: (v) => Number(v ?? 0).toFixed(1) },
        { key: "ceiling", label: "Ceiling", format: (v) => Number(v ?? 0).toFixed(1) },
      ]}
    />
  );
}
