"use client";

import type { PanelDefinition } from "@razzle/panels";
import { PanelRenderer } from "./PanelRenderer";

interface Props {
  panel: PanelDefinition;
}

export function PanelCanvas({ panel }: Props) {
  return (
    <div className="lab-panel-canvas">
      <header className="lab-panel-header">
        <h1 style={{ fontFamily: "var(--font-display)" }}>{panel.title}</h1>
        <p className="text-ink-medium">{panel.blurb}</p>
      </header>
      <PanelRenderer panel={panel} />
    </div>
  );
}
