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
};
