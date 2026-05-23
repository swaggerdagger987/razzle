// Razzle design system — tokens, CSS layers, and React primitives.

export const POSITION_COLOR = {
  QB: "var(--pos-qb)",
  RB: "var(--pos-rb)",
  WR: "var(--pos-wr)",
  TE: "var(--pos-te)",
} as const;

export type Position = keyof typeof POSITION_COLOR;

/** Dynasty tier badge colors (rankings panels). */
export const TIER_COLOR = {
  1: "var(--orange)",
  2: "var(--blue)",
  3: "var(--green)",
  4: "var(--purple)",
  5: "var(--bg-warm)",
  6: "var(--bg-warm)",
  7: "var(--bg-warm)",
  8: "var(--bg-warm)",
} as const;

export type Tier = keyof typeof TIER_COLOR;

/** Semantic value bands used in tables and panels. */
export const VALUE_COLOR = {
  elite: "var(--semantic-green)",
  solid: "var(--semantic-yellow)",
  low: "var(--semantic-orange)",
  rep: "var(--semantic-red)",
} as const;

export const FONT_FAMILY = {
  display: "var(--font-display)",
  mono: "var(--font-mono)",
  hand: "var(--font-hand)",
} as const;

export const RADIUS = {
  sm: "var(--radius-sm)",
  md: "var(--radius)",
  lg: "var(--radius-lg)",
} as const;

export const SHADOW = {
  chunky: "var(--shadow-chunky)",
} as const;

/** Default loading copy — matches legacy RAZZLE_LOADING voice. */
export const LOADING_MESSAGES = [
  "pulling film...",
  "checking the tape...",
  "running the numbers...",
  "consulting the analytics department...",
  "cross-referencing the scouting reports...",
  "Razzle's reviewing game tape...",
  "scanning the waiver wire...",
  "breaking down the all-22...",
  "crunching the combine data...",
  "studying the matchup charts...",
  "reviewing snap counts...",
  "calculating trade values...",
  "processing the depth chart...",
  "scouting the next breakout...",
  "analyzing target shares...",
] as const;

export const DEFAULT_LOADING_MESSAGE = LOADING_MESSAGES[0];

export function pickLoadingMessage(): string {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]!;
}

export * from "./components";
