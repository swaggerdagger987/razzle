export const BUREAU_FEATURES = [
  { slug: "self-scout", label: "Self-Scout", default: true },
  { slug: "roster-depth", label: "Roster Depth" },
  { slug: "build-profiles", label: "Build Profiles" },
  { slug: "power-rankings", label: "Power Rankings" },
  { slug: "trade-network", label: "Trade Network" },
  { slug: "waiver-tendencies", label: "Waiver Tendencies" },
  { slug: "head-to-head", label: "Head-to-Head" },
  { slug: "strength-of-schedule", label: "Schedule" },
  { slug: "monte-carlo", label: "Monte Carlo" },
] as const;

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
  "waiver-tendencies": { path: "/api/bureau/waiver-tendencies", needsUser: false, title: "Waiver Tendencies" },
  "strength-of-schedule": {
    path: "/api/bureau/strength-of-schedule",
    needsUser: true,
    title: "Strength of Schedule",
  },
  "monte-carlo": { path: "/api/bureau/monte-carlo", needsUser: false, title: "Monte Carlo" },
};
