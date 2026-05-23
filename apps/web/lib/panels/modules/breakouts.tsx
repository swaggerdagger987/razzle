"use client";
import { GenericTablePanel } from "./generic-table";
import type { PanelDef } from "../registry";

export default function Breakouts({ panel }: { panel: PanelDef }) {
  return (
    <GenericTablePanel
      panel={panel}
      endpoint="/api/breakout-candidates"
      columns={[
        { key: "full_name", label: "Player" },
        { key: "position", label: "Pos" },
        { key: "team", label: "Tm" },
        { key: "breakout_score", label: "Score", format: (v) => Number(v ?? 0).toFixed(2) },
        { key: "reason", label: "Signal" },
      ]}
    />
  );
}
