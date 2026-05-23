"use client";

import type { PanelDefinition } from "@razzle/panels";
import { useState } from "react";
import { LabSidebar } from "@/components/lab/LabSidebar";
import { PanelCanvas } from "@/components/lab/PanelCanvas";

interface Props {
  panel: PanelDefinition;
}

export function LabPanelClient({ panel }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <LabSidebar
        activeSlug={panel.slug}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className={`lab-main px-6 py-8${collapsed ? " sidebar-collapsed" : ""}`}>
        <PanelCanvas panel={panel} />
      </div>
    </>
  );
}
