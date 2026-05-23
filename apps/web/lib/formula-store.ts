/** Curated community composites — Explore L4 (static catalog, localStorage install). */

import {
  FORMULA_STAT_OPTIONS,
  type FormulaComponent,
  type SavedFormula,
  loadFormulas,
  saveFormulas,
} from "./formulas";

export type StoreFormula = {
  id: string;
  name: string;
  description: string;
  positions: string[];
  components: FormulaComponent[];
  creator: string;
};

const VALID_STATS = new Set(FORMULA_STAT_OPTIONS.map((o) => o.key));

const INSTALLED_KEY = "razzle_store_installed";

/** Razzle Labs composites — stats limited to screener columns we compute today. */
export const STORE_FORMULAS: StoreFormula[] = [
  {
    id: "ppr-workhorse",
    name: "PPR Workhorse",
    description: "High-volume PPR assets — receptions and targets weighted with rushing floor.",
    positions: ["RB", "WR"],
    components: [
      { stat: "receptions", weight: 30 },
      { stat: "targets", weight: 25 },
      { stat: "rushing_yards", weight: 20 },
      { stat: "receiving_yards", weight: 15 },
      { stat: "rushing_tds", weight: 10 },
    ],
    creator: "Razzle Labs",
  },
  {
    id: "alpha-wr",
    name: "Alpha WR Score",
    description: "True WR1 alphas — target volume plus touchdown upside.",
    positions: ["WR"],
    components: [
      { stat: "targets", weight: 25 },
      { stat: "receiving_yards", weight: 25 },
      { stat: "receiving_tds", weight: 20 },
      { stat: "receptions", weight: 15 },
      { stat: "fantasy_points_ppr", weight: 15 },
    ],
    creator: "Razzle Labs",
  },
  {
    id: "bellcow",
    name: "Bellcow Index",
    description: "Pure rushing workload — three-down backs with volume and TD upside.",
    positions: ["RB"],
    components: [
      { stat: "rushing_yards", weight: 30 },
      { stat: "carries", weight: 25 },
      { stat: "rushing_tds", weight: 20 },
      { stat: "touchdowns", weight: 15 },
      { stat: "fantasy_points_ppr", weight: 10 },
    ],
    creator: "Razzle Labs",
  },
  {
    id: "target-hog",
    name: "Target Hog",
    description: "Volume is king in PPR — players commanding the highest target share.",
    positions: ["WR", "TE", "RB"],
    components: [
      { stat: "targets", weight: 35 },
      { stat: "receptions", weight: 30 },
      { stat: "receiving_yards", weight: 20 },
      { stat: "receiving_tds", weight: 15 },
    ],
    creator: "Razzle Labs",
  },
  {
    id: "dynasty-value",
    name: "Dynasty Value Score",
    description: "Long-term asset evaluation — production weighted for dynasty holds.",
    positions: ["QB", "RB", "WR", "TE"],
    components: [
      { stat: "fantasy_points_ppr", weight: 35 },
      { stat: "receiving_yards", weight: 20 },
      { stat: "rushing_yards", weight: 15 },
      { stat: "receptions", weight: 15 },
      { stat: "touchdowns", weight: 15 },
    ],
    creator: "Razzle Labs",
  },
  {
    id: "td-machine",
    name: "TD Machine",
    description: "Pure touchdown upside across all scoring methods — boom-or-bust by design.",
    positions: ["QB", "RB", "WR", "TE"],
    components: [
      { stat: "touchdowns", weight: 35 },
      { stat: "rushing_tds", weight: 35 },
      { stat: "receiving_tds", weight: 30 },
    ],
    creator: "Razzle Labs",
  },
];

export function loadInstalledStoreIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(INSTALLED_KEY) ?? "[]") as string[];
    return raw.filter((id) => STORE_FORMULAS.some((f) => f.id === id));
  } catch {
    return [];
  }
}

function saveInstalledStoreIds(ids: string[]): void {
  localStorage.setItem(INSTALLED_KEY, JSON.stringify(ids));
}

export function isStoreFormulaInstalled(id: string): boolean {
  return loadInstalledStoreIds().includes(id);
}

/** Install a store formula into user formulas; returns updated list or null if at cap / duplicate name. */
export function installStoreFormula(
  store: StoreFormula,
  maxFormulas: number,
): SavedFormula[] | null {
  const existing = loadFormulas();
  if (existing.some((f) => f.name === store.name)) {
    return existing;
  }
  if (existing.length >= maxFormulas) {
    return null;
  }
  const components = store.components.filter((c) => VALID_STATS.has(c.stat));
  if (!components.length) return null;

  const next = [...existing, { name: store.name, components }];
  saveFormulas(next);

  const installed = loadInstalledStoreIds();
  if (!installed.includes(store.id)) {
    saveInstalledStoreIds([...installed, store.id]);
  }
  return next;
}

export function filterStoreFormulas(position: string): StoreFormula[] {
  if (!position || position === "ALL") return STORE_FORMULAS;
  return STORE_FORMULAS.filter((f) => f.positions.includes(position));
}
