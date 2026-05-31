/** Scaffolded tabs hidden until bespoke renderers ship (board cycle 43). */
export const HIDDEN_BUREAU_SLUGS = new Set([
  "roster-depth",
  "power-rankings",
  "waiver-tendencies",
  "strength-of-schedule",
]);

export const BUREAU_FEATURES = [
  { slug: "self-scout", label: "Self-Scout", default: true },
  { slug: "roster-depth", label: "Roster Depth" },
  { slug: "build-profiles", label: "Build Profiles" },
  { slug: "power-rankings", label: "Power Rankings" },
  { slug: "trade-network", label: "Trade Network" },
  { slug: "manager-profiles", label: "Manager Profiles" },
  { slug: "pressure-map", label: "Pressure Map" },
  { slug: "trade-finder", label: "Trade Finder" },
  { slug: "waiver-tendencies", label: "Waiver Tendencies" },
  { slug: "head-to-head", label: "Head-to-Head" },
  { slug: "strength-of-schedule", label: "Schedule" },
  { slug: "monte-carlo", label: "Monte Carlo" },
] as const;

export const VISIBLE_BUREAU_FEATURES = BUREAU_FEATURES.filter((f) => !HIDDEN_BUREAU_SLUGS.has(f.slug));

export type BureauFeatureSlug = (typeof BUREAU_FEATURES)[number]["slug"];

export const BUREAU_ENDPOINTS: Record<
  string,
  { path: string; needsUser: boolean; title: string }
> = {
  "self-scout": { path: "/api/bureau/self-scout", needsUser: true, title: "Self-Scout" },
  "roster-depth": { path: "/api/bureau/roster-depth", needsUser: true, title: "Roster Depth" },
  "build-profiles": { path: "/api/bureau/build-profiles", needsUser: false, title: "Build Profiles" },
  "power-rankings": { path: "/api/bureau/power-rankings", needsUser: false, title: "Power Rankings" },
  "trade-network": { path: "/api/bureau/trade-network", needsUser: false, title: "Trade Network" },
  "manager-profiles": {
    path: "/api/bureau/manager-profiles",
    needsUser: false,
    title: "Manager Profiles",
  },
  "pressure-map": {
    path: "/api/bureau/pressure-map",
    needsUser: false,
    title: "Pressure Map",
  },
  "trade-finder": {
    path: "/api/bureau/trade-finder",
    needsUser: true,
    title: "Trade Finder",
  },
  "waiver-tendencies": { path: "/api/bureau/waiver-tendencies", needsUser: false, title: "Waiver Tendencies" },
  "head-to-head": { path: "/api/bureau/head-to-head", needsUser: true, title: "Head-to-Head" },
  "strength-of-schedule": {
    path: "/api/bureau/strength-of-schedule",
    needsUser: true,
    title: "Strength of Schedule",
  },
  "monte-carlo": { path: "/api/bureau/monte-carlo", needsUser: false, title: "Monte Carlo" },
};
