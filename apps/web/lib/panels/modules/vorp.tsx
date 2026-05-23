"use client";
import { GenericTablePanel } from "./generic-table";
import type { PanelDef } from "../registry";

export default function Vorp({ panel }: { panel: PanelDef }) {
  return (
    <GenericTablePanel
      panel={panel}
      endpoint="/api/vorp"
      columns={[
        { key: "full_name", label: "Player" },
        { key: "position", label: "Pos" },
        { key: "team", label: "Tm" },
        { key: "vorp", label: "VORP", format: (v) => Number(v ?? 0).toFixed(1) },
        { key: "fantasy_points_ppr", label: "FP", format: (v) => Number(v ?? 0).toFixed(1) },
      ]}
    />
  );
}
