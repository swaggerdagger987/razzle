"use client";

import type { ReactNode } from "react";
import type { PanelDefinition } from "@razzle/panels";
import { isUpgradeRequiredError } from "@/lib/panel-api";
import { ProUpgradeGate } from "./ProUpgradeGate";

type UpgradeDetail = {
  required?: string;
  current?: string;
  message?: string;
};

/** Maps TanStack query errors (402 upgrade payload or UpgradeRequiredError) to ProUpgradeGate. */
export function ProGateFromPanelError({
  panel,
  error,
}: {
  panel: Pick<PanelDefinition, "slug" | "title">;
  error: unknown;
}): ReactNode | null {
  const err = error as Error & { upgrade?: UpgradeDetail };
  if (err.upgrade) {
    return (
      <ProUpgradeGate
        panelSlug={panel.slug}
        panelTitle={panel.title}
        required={err.upgrade.required ?? "pro"}
        current={err.upgrade.current ?? "free"}
        message={err.upgrade.message}
      />
    );
  }
  if (isUpgradeRequiredError(err)) {
    return (
      <ProUpgradeGate
        panelSlug={panel.slug}
        panelTitle={panel.title}
        required={err.required}
        current={err.current}
        message={err.message}
      />
    );
  }
  return null;
}
