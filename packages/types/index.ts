// Razzle V2 shared types.
//
// Long-term these are generated from the FastAPI OpenAPI schema
// (`apps/api/openapi.json` -> `pnpm types:generate`). For now they're
// hand-written and mirror apps/api/models/.

import { z } from "zod";

export const PositionSchema = z.enum(["QB", "RB", "WR", "TE"]);
export type Position = z.infer<typeof PositionSchema>;

export const FilterOpSchema = z.enum(["gte", "lte", "eq", "ne", "gt", "lt"]);
export type FilterOp = z.infer<typeof FilterOpSchema>;

export const ScreenerFilterSchema = z.object({
  key: z.string(),
  op: FilterOpSchema,
  value: z.number(),
});
export type ScreenerFilter = z.infer<typeof ScreenerFilterSchema>;

export const ScreenerQuerySchema = z.object({
  search: z.string().default(""),
  positions: z.array(PositionSchema).default([]),
  teams: z.array(z.string()).default([]),
  season: z.union([z.number().int(), z.literal("career")]).default(0),
  week: z.number().int().default(0),
  sort_key: z.string().default("fantasy_points_ppr"),
  sort_direction: z.enum(["asc", "desc"]).default("desc"),
  limit: z.number().int().min(1).max(1000).default(50),
  offset: z.number().int().min(0).default(0),
  filters: z.array(ScreenerFilterSchema).default([]),
  relevance: z.enum(["all", "fantasy"]).default("fantasy"),
  min_gp: z.number().int().min(0).max(17).default(0),
});
export type ScreenerQuery = z.infer<typeof ScreenerQuerySchema>;

export const PlayerRowSchema = z
  .object({
    player_id: z.string(),
    full_name: z.string(),
    position: PositionSchema,
    team: z.string(),
    age: z.number().int().nullable().optional(),
    games: z.number().int().default(0),
    fantasy_points_ppr: z.number().default(0),
  })
  .passthrough(); // stat columns vary by query

export type PlayerRow = z.infer<typeof PlayerRowSchema>;

export const ScreenerResponseSchema = z.object({
  items: z.array(PlayerRowSchema),
  count: z.number().int(),
  season: z.union([z.number().int(), z.literal("career")]),
  universe: z.enum(["nfl", "college", "prospects"]).default("nfl"),
});
export type ScreenerResponse = z.infer<typeof ScreenerResponseSchema>;

// Agent IDs — the six personas. UI uses these for icon paths and routing.
export const AGENT_IDS = ["razzle", "octo", "bones", "dolphin", "hawkeye", "atlas"] as const;
export type AgentId = (typeof AGENT_IDS)[number];

export const UrgencyTier = ["URGENT", "MONITOR", "OPPORTUNITY", "ROUTINE"] as const;
export type Urgency = (typeof UrgencyTier)[number];
