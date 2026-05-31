import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

export const exploreParsers = {
  q: parseAsString.withDefault(""),
  pos: parseAsArrayOf(parseAsString).withDefault([]),
  sort: parseAsString.withDefault("fantasy_points_ppr"),
  dir: parseAsStringLiteral(["asc", "desc"] as const).withDefault("desc"),
  season: parseAsInteger.withDefault(0),
  team: parseAsArrayOf(parseAsString).withDefault([]),
  limit: parseAsInteger.withDefault(50),
  universe: parseAsStringLiteral(["nfl", "college"] as const).withDefault("nfl"),
};

export type ExploreUniverse = "nfl" | "college";

export function defaultSortForUniverse(universe: ExploreUniverse): string {
  return universe === "college" ? "total_yards" : "fantasy_points_ppr";
}

/** Sort key for `/og/explore` — mirrors route.tsx college + formula fallbacks. */
export function ogSortForUniverse(universe: ExploreUniverse, sort: string): string {
  if (universe === "college" && (sort === "fantasy_points_ppr" || sort.startsWith("formula_"))) {
    return "total_yards";
  }
  if (sort.startsWith("formula_")) {
    return defaultSortForUniverse(universe);
  }
  return sort;
}

/** Canonical query string for Explore OG preview + export (always includes universe). */
export function buildExploreOgSearchParams(opts: {
  universe: ExploreUniverse;
  sort: string;
  dir: string;
  q?: string;
  pos?: string[];
}): URLSearchParams {
  const params = new URLSearchParams({
    universe: opts.universe,
    sort: ogSortForUniverse(opts.universe, opts.sort),
    dir: opts.dir,
  });
  if (opts.q) params.set("q", opts.q);
  if (opts.pos?.length) params.set("pos", opts.pos.join(","));
  return params;
}
