/** Lab L3 — feed Explore screener formulas into panel row sort. */

import { computeFormulaScore, type SavedFormula } from "./formulas";

export type WithFormulaScore = { formula_score?: number };

export async function fetchPlayerStatsForFormula(
  playerIds: string[],
  season = 0,
): Promise<Map<string, Record<string, unknown>>> {
  if (!playerIds.length) return new Map();
  const qs = new URLSearchParams({
    player_ids: playerIds.join(","),
    season: String(season),
  });
  const res = await fetch(`/api/players/compare?${qs}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = (await res.json()) as { players?: Record<string, unknown>[] };
  const map = new Map<string, Record<string, unknown>>();
  for (const p of data.players ?? []) {
    const id = String(p.player_id ?? "");
    if (id) map.set(id, p);
  }
  return map;
}

export function sortPlayersByFormula<T extends { player_id: string }>(
  players: T[],
  stats: Map<string, Record<string, unknown>>,
  formula: SavedFormula,
): (T & WithFormulaScore)[] {
  return [...players]
    .map((p) => ({
      ...p,
      formula_score: computeFormulaScore(stats.get(p.player_id) ?? {}, formula.components),
    }))
    .sort((a, b) => (b.formula_score ?? 0) - (a.formula_score ?? 0));
}
