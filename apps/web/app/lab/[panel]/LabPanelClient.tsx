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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="lab-mobile-panels-btn btn-chunky"
        onClick={() => setMobileOpen(true)}
        aria-label="Open panel list"
      >
        Panels
      </button>
      {mobileOpen && (
        <button
          type="button"
          className="lab-mobile-backdrop"
          aria-label="Close panel list"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <LabSidebar
        activeSlug={panel.slug}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className={`lab-main px-6 py-8${collapsed ? " sidebar-collapsed" : ""}`}>
        <PanelCanvas panel={panel} />
      </div>
    </>
  );
}
