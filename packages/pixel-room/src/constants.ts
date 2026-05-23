export const TILE = 32;
export const COLS = 24;
export const ROWS = 14;

export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;

export const SPRITE_DRAW_W = 32;
export const SPRITE_DRAW_H = 48;
export const SPRITE_GRID = 2;
export const WALK_FRAMES = [0, 1, 2, 3] as const;
export const ANIM_MS = 150;

export type AgentId = "razzle" | "octo" | "bones";
export type AgentAnim = "idle" | "walk";
export type AgentStateKind = "idle" | "walk" | "work";

export const AGENT_SPRITE_PREFIX: Record<AgentId, string> = {
  razzle: "razzle",
  octo: "quant",
  bones: "historian",
};

export const AGENT_LABELS: Record<AgentId, string> = {
  razzle: "Razzle",
  octo: "Octo",
  bones: "Bones",
};

export const PALETTE = {
  wallDark: "#121a2e",
  wallMid: "#1b2845",
  floorWood1: "#8b6d3c",
  floorWood2: "#9c7a42",
  turf1: "#1e5c28",
  turf2: "#267832",
  turfLine: "#c4b5a5",
  bannerBg: "#d97757",
  bannerText: "#2d1f14",
  nameTag: "rgba(26,17,10,0.75)",
  nameText: "#f7efe5",
} as const;

/** War table blocks tiles (center of room) */
export const TABLE_RECT = { x: 9, y: 5, w: 6, h: 4 };

/** Desk tiles agents walk to when working */
export const WORK_TILES: Record<AgentId, { x: number; y: number }> = {
  razzle: { x: 8, y: 10 },
  octo: { x: 14, y: 6 },
  bones: { x: 11, y: 12 },
};
