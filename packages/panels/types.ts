export type PanelTier = "free" | "pro";

export type PanelCategory =
  | "rankings"
  | "discovery"
  | "performance"
  | "matchup"
  | "trends"
  | "prospects"
  | "profile"
  | "tools"
  | "team"
  | "records"
  | "college";

export type PanelRenderType =
  | "table"
  | "heatmap"
  | "grid"
  | "tier"
  | "compare"
  | "cards"
  | "bar-chart"
  | "line-chart"
  | "donut"
  | "timeline"
  | "scatter"
  | "screener"
  | "dashboard"
  | "network"
  | "odds";

export type HttpMethod = "GET" | "POST";

export interface PanelApiConfig {
  handler: string;
  method: HttpMethod;
  path: string;
  params?: Record<string, unknown>;
}

export interface PanelDefinition {
  slug: string;
  legacyId: string;
  title: string;
  blurb: string;
  icon: string;
  tier: PanelTier;
  category: PanelCategory;
  renderType: PanelRenderType;
  api: PanelApiConfig;
}
