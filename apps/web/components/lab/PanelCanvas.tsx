"use client";

import type { PanelDefinition } from "@razzle/panels";
import { LabShareButton } from "./LabShareButton";
import { PanelRenderer } from "./PanelRenderer";

interface Props {
  panel: PanelDefinition;
}

export function PanelCanvas({ panel }: Props) {
  return (
    <div className="lab-panel-canvas">
      <header className="lab-panel-header flex items-start justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)" }}>{panel.title}</h1>
          <p className="text-ink-medium">{panel.blurb}</p>
        </div>
        <LabShareButton slug={panel.slug} />
      </header>
      <PanelRenderer panel={panel} />
    </div>
  );
}
