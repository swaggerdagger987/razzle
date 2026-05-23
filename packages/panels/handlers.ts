import { PANELS } from "./catalog";
import type { PanelApiConfig } from "./types";

/** Slug → API handler config. Derived from the panel catalog. */
export const HANDLERS: Record<string, PanelApiConfig> = Object.fromEntries(
  PANELS.map((panel) => [panel.slug, panel.api]),
);

export function getHandler(slug: string): PanelApiConfig | undefined {
  return HANDLERS[slug];
}
