/** Ja'Marr Chase gsis_id — matches DEFAULT_OG_PLAYER_ID in /og/[panel]/route.tsx */
export const DEFAULT_LAB_OG_PLAYER_ID = "00-0036900";

/** Lab panels whose OG cards require player_id on the export URL. */
export const PLAYER_SCOPED_LAB_OG_SLUGS = new Set([
  "dynasty-comps",
  "gamelog",
  "percentiles",
  "career",
  "career-compare",
  "strengths",
  "breakdown",
  "fptsbreakdown",
  "archetypes",
]);

/** Resolve player_id for Lab OG export — never omit on player-scoped panels. */
export function resolveLabOgPlayerId(slug: string, playerId?: string): string | undefined {
  const trimmed = playerId?.trim();
  if (trimmed) return trimmed;
  if (PLAYER_SCOPED_LAB_OG_SLUGS.has(slug)) return DEFAULT_LAB_OG_PLAYER_ID;
  return undefined;
}

export type LabOgExportInput = {
  slug: string;
  download?: boolean;
  playerId?: string;
  position?: string;
  snapshot?: string;
};

export function buildLabOgExportParams(input: LabOgExportInput): URLSearchParams {
  const params = new URLSearchParams();
  if (input.download) params.set("download", "1");
  const effectivePlayerId = resolveLabOgPlayerId(input.slug, input.playerId);
  if (effectivePlayerId) params.set("player_id", effectivePlayerId);
  if (input.position) params.set("position", input.position);
  if (input.snapshot) params.set("snapshot", input.snapshot);
  return params;
}
