export type {
  HttpMethod,
  PanelApiConfig,
  PanelCategory,
  PanelDefinition,
  PanelRenderType,
  PanelTier,
} from "./types";

export { PANELS } from "./catalog";
export { HANDLERS, getHandler } from "./handlers";

import { PANELS } from "./catalog";
import type { PanelCategory, PanelDefinition } from "./types";

export function getPanel(slug: string): PanelDefinition | undefined {
  return PANELS.find((panel) => panel.slug === slug);
}

export function panelsByCategory(category?: PanelCategory): PanelDefinition[] {
  if (!category) return [...PANELS];
  return PANELS.filter((panel) => panel.category === category);
}

export function searchPanels(query: string): PanelDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...PANELS];

  return PANELS.filter((panel) => {
    return (
      panel.slug.includes(q) ||
      panel.legacyId.includes(q) ||
      panel.title.toLowerCase().includes(q) ||
      panel.blurb.toLowerCase().includes(q) ||
      panel.category.includes(q)
    );
  });
}
