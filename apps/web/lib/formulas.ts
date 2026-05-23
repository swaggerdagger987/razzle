/** Custom screener formulas — localStorage MVP (Explore L3). */

export type FormulaComponent = { stat: string; weight: number };

export type SavedFormula = {
  name: string;
  components: FormulaComponent[];
};

const STORAGE_KEY = "razzle_formulas";
export const MAX_FORMULAS = 3;

export const FORMULA_STAT_OPTIONS: { key: string; label: string }[] = [
  { key: "fantasy_points_ppr", label: "FPTS (PPR)" },
  { key: "fantasy_points_half_ppr", label: "FPTS (Half)" },
  { key: "targets", label: "Targets" },
  { key: "receptions", label: "Receptions" },
  { key: "receiving_yards", label: "Rec Yards" },
  { key: "receiving_tds", label: "Rec TDs" },
  { key: "rushing_yards", label: "Rush Yards" },
  { key: "rushing_tds", label: "Rush TDs" },
  { key: "carries", label: "Carries" },
  { key: "touchdowns", label: "Total TDs" },
  { key: "games", label: "Games Played" },
];

export function formulaColumnKey(name: string): string {
  return `formula_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
}

export function loadFormulas(): SavedFormula[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedFormula[];
    return raw.filter((f) => f?.name && Array.isArray(f.components) && f.components.length > 0);
  } catch {
    return [];
  }
}

export function saveFormulas(formulas: SavedFormula[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formulas));
}

export function computeFormulaScore(
  row: Record<string, unknown>,
  components: FormulaComponent[],
): number {
  let score = 0;
  let totalWeight = 0;
  for (const { stat, weight } of components) {
    const val = Number(row[stat] ?? 0);
    if (Number.isFinite(val)) {
      score += val * weight;
      totalWeight += Math.abs(weight);
    }
  }
  return totalWeight > 0 ? score / totalWeight : 0;
}

export function enrichRowsWithFormulas<T extends Record<string, unknown>>(
  rows: T[],
  formulas: SavedFormula[],
): T[] {
  if (!formulas.length) return rows;
  return rows.map((row) => {
    const extra: Record<string, number> = {};
    for (const formula of formulas) {
      extra[formulaColumnKey(formula.name)] = computeFormulaScore(row, formula.components);
    }
    return { ...row, ...extra };
  });
}
