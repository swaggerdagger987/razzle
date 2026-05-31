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

/** Sort key for /og/explore and share URLs — mirrors apps/web/app/og/explore/route.tsx. */
export function ogSortForUniverse(universe: ExploreUniverse | string, sort: string): string {
  if (universe === "college" && (sort === "fantasy_points_ppr" || sort.startsWith("formula_"))) {
    return "total_yards";
  }
  return sort;
}

export function buildExploreShareQuery(params: {
  universe: ExploreUniverse | string;
  sort: string;
  dir: string;
  q?: string;
  pos?: string[];
  download?: boolean;
}): URLSearchParams {
  const qs = new URLSearchParams({
    universe: params.universe,
    sort: ogSortForUniverse(params.universe, params.sort),
    dir: params.dir,
  });
  if (params.q) qs.set("q", params.q);
  if (params.pos?.length) qs.set("pos", params.pos.join(","));
  if (params.download) qs.set("download", "1");
  return qs;
}
