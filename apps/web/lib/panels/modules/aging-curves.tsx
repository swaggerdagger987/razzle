"use client";
import { GenericTablePanel } from "./generic-table";
import type { PanelDef } from "../registry";

export default function AgingCurves({ panel }: { panel: PanelDef }) {
  return (
    <GenericTablePanel
      panel={panel}
      endpoint="/api/aging-curves"
      columns={[
        { key: "position", label: "Pos" },
        { key: "age", label: "Age" },
        { key: "expected_share", label: "Expected production %", format: (v) => `${(Number(v ?? 0) * 100).toFixed(0)}%` },
        { key: "sample_size", label: "n" },
      ]}
    />
  );
}
