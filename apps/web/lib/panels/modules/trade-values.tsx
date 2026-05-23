"use client";
import { GenericTablePanel } from "./generic-table";
import type { PanelDef } from "../registry";

export default function TradeValues({ panel }: { panel: PanelDef }) {
  return (
    <GenericTablePanel
      panel={panel}
      endpoint="/api/trade-value-chart"
      columns={[
        { key: "tier", label: "Tier" },
        { key: "full_name", label: "Player" },
        { key: "position", label: "Pos" },
        { key: "value", label: "1QB Value", format: (v) => Number(v ?? 0).toFixed(0) },
        { key: "sf_value", label: "SF Value", format: (v) => Number(v ?? 0).toFixed(0) },
      ]}
    />
  );
}
