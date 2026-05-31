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

/** Effective screener sort for API + OG export (college remaps NFL default). */
export function effectiveExploreSortKey(
  universe: ExploreUniverse,
  sort: string,
): string {
  if (universe === "college" && sort === "fantasy_points_ppr") return "total_yards";
  if (sort.startsWith("formula_")) return defaultSortForUniverse(universe);
  return sort || defaultSortForUniverse(universe);
}

export interface ExploreOgParamsInput {
  universe: ExploreUniverse;
  sort: string;
  dir: string;
  q?: string;
  pos?: string[];
  download?: boolean;
}

/** Shared query string for `/og/explore` preview + export links. */
export function buildExploreOgSearchParams(input: ExploreOgParamsInput): URLSearchParams {
  const sort = effectiveExploreSortKey(input.universe, input.sort);
  const params = new URLSearchParams({
    universe: input.universe,
    sort,
    dir: input.dir,
  });
  if (input.q?.trim()) params.set("q", input.q.trim());
  if (input.pos?.length) params.set("pos", input.pos.join(","));
  if (input.download) params.set("download", "1");
  return params;
}
