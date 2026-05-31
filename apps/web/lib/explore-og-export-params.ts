import type { ExploreUniverse } from "./explore-params";
import { defaultSortForUniverse } from "./explore-params";

export type ExploreOgExportInput = {
  universe: ExploreUniverse;
  /** UI sort key from nuqs (may differ from screener API sort). */
  sort: string;
  dir: string;
  q: string;
  pos: string[];
  download?: boolean;
};

/** Sort key written to `/og/explore` — mirrors route.tsx fetchTopPlayers mapping. */
export function ogSortKeyForExport(universe: ExploreUniverse, sort: string): string {
  if (universe === "college" && sort === "fantasy_points_ppr") {
    return "total_yards";
  }
  if (sort.startsWith("formula_")) {
    return defaultSortForUniverse(universe);
  }
  return sort;
}

/** Build query string for Explore OG preview + export links (always includes universe). */
export function buildExploreOgExportParams(input: ExploreOgExportInput): URLSearchParams {
  const params = new URLSearchParams({
    universe: input.universe,
    sort: ogSortKeyForExport(input.universe, input.sort),
    dir: input.dir,
  });
  if (input.q) params.set("q", input.q);
  if (input.pos.length) params.set("pos", input.pos.join(","));
  if (input.download) params.set("download", "1");
  return params;
}
