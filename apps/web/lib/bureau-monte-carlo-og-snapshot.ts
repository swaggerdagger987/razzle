/** Compact Monte Carlo odds payload for OG export — mirrors Bureau Monte Carlo panel. */

export type BureauMonteCarloOgRow = {
  roster_id: number;
  manager: string;
  championship_pct: number;
  playoff_pct: number;
  roster_power: number;
};

/** What-if trade delta — mirrors BureauMonteCarlo scenario panel for OG export. */
export type BureauMonteCarloScenarioOg = {
  giveName: string;
  getName: string;
  partnerTeam: string;
  deltaChamp: number;
  deltaPlayoff: number;
  baselineChamp: number;
  scenarioChamp: number;
};

export type BureauMonteCarloOgSnapshot = {
  rows: BureauMonteCarloOgRow[];
  scenario?: BureauMonteCarloScenarioOg;
};

type CompactRow = {
  id: number;
  m: string;
  cp: number;
  pp: number;
  rp: number;
};

type CompactScenario = {
  g: string;
  n: string;
  p: string;
  dc: number;
  dp: number;
  bc: number;
  sc: number;
};

type CompactMonte = { r: CompactRow[]; s?: CompactScenario };

function hasSnapshotData(snap: BureauMonteCarloOgSnapshot): boolean {
  return snap.rows?.length > 0 && Boolean(snap.rows[0]?.manager);
}

function scenarioFromCompact(s?: CompactScenario): BureauMonteCarloScenarioOg | undefined {
  if (!s?.g || !s?.n) return undefined;
  return {
    giveName: s.g,
    getName: s.n,
    partnerTeam: s.p ?? "",
    deltaChamp: s.dc,
    deltaPlayoff: s.dp,
    baselineChamp: s.bc,
    scenarioChamp: s.sc,
  };
}

function scenarioToCompact(scenario: BureauMonteCarloScenarioOg): CompactScenario {
  return {
    g: scenario.giveName,
    n: scenario.getName,
    p: scenario.partnerTeam,
    dc: scenario.deltaChamp,
    dp: scenario.deltaPlayoff,
    bc: scenario.baselineChamp,
    sc: scenario.scenarioChamp,
  };
}

function fromCompact(c: CompactMonte): BureauMonteCarloOgSnapshot | null {
  const rows = (c.r ?? [])
    .map((row) => ({
      roster_id: row.id,
      manager: row.m,
      championship_pct: row.cp,
      playoff_pct: row.pp,
      roster_power: row.rp,
    }))
    .filter((row) => row.manager);
  if (!rows.length) return null;
  const scenario = scenarioFromCompact(c.s);
  return scenario ? { rows, scenario } : { rows };
}

function toCompact(snap: BureauMonteCarloOgSnapshot): CompactMonte {
  const compact: CompactMonte = {
    r: snap.rows.slice(0, 3).map((row) => ({
      id: row.roster_id,
      m: row.manager,
      cp: row.championship_pct,
      pp: row.playoff_pct,
      rp: row.roster_power,
    })),
  };
  if (snap.scenario) compact.s = scenarioToCompact(snap.scenario);
  return compact;
}

export function encodeBureauMonteCarloOgSnapshot(
  snap: BureauMonteCarloOgSnapshot,
): string | undefined {
  if (!hasSnapshotData(snap)) return undefined;
  const json = JSON.stringify(toCompact(snap));
  if (typeof btoa === "function") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return undefined;
}

export function decodeBureauMonteCarloOgSnapshot(
  param: string,
): BureauMonteCarloOgSnapshot | null {
  try {
    const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return fromCompact(JSON.parse(json) as CompactMonte);
  } catch {
    return null;
  }
}
