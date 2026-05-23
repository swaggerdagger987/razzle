/** Explore saved views — localStorage MVP (Explore L3). */

import type { ExploreUniverse } from "./explore-params";

export type SavedViewState = {
  q: string;
  pos: string[];
  sort: string;
  dir: "asc" | "desc";
  season: number;
  team: string[];
  limit: number;
  universe: ExploreUniverse;
};

export type SavedView = SavedViewState & {
  id: string;
  name: string;
  createdAt: string;
};

const STORAGE_KEY = "razzle_explore_saved_views";
export const MAX_SAVED_VIEWS = 5;

export function loadSavedViews(): SavedView[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedView[];
    return raw.filter((v) => v?.id && v?.name);
  } catch {
    return [];
  }
}

export function saveSavedViews(views: SavedView[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
}

export function createSavedView(name: string, state: SavedViewState): SavedView {
  return {
    id: Date.now().toString(36),
    name: name.trim().slice(0, 40),
    createdAt: new Date().toISOString(),
    ...state,
  };
}

export function savedViewSummary(view: SavedView): string {
  const parts: string[] = [view.universe.toUpperCase()];
  if (view.pos.length) parts.push(view.pos.join("/"));
  if (view.q) parts.push(`"${view.q}"`);
  return parts.join(" · ");
}
