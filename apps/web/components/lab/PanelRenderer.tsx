"use client";

import type { PanelDefinition } from "@razzle/panels";
import { LoadingState } from "@razzle/ui";
import { useQuery } from "@tanstack/react-query";
import { fetchPanelData } from "@/lib/panel-api";
import { CardsRenderer } from "./renderers/CardsRenderer";
import { ChartRenderer } from "./renderers/ChartRenderer";
import { DashboardRenderer } from "./renderers/DashboardRenderer";
import { DonutRenderer } from "./renderers/DonutRenderer";
import { GridRenderer } from "./renderers/GridRenderer";
import { HeatmapRenderer } from "./renderers/HeatmapRenderer";
import { NetworkRenderer } from "./renderers/NetworkRenderer";
import { ScatterRenderer } from "./renderers/ScatterRenderer";
import { ScreenerRedirect } from "./renderers/ScreenerRedirect";
import { TableRenderer } from "./renderers/TableRenderer";
import { TierRenderer } from "./renderers/TierRenderer";

interface Props {
  panel: PanelDefinition;
}

export function PanelRenderer({ panel }: Props) {
  if (panel.renderType === "screener") {
    return <ScreenerRedirect panel={panel} />;
  }

  const q = useQuery({
    queryKey: ["panel", panel.slug, panel.api],
    queryFn: () => fetchPanelData(panel),
  });

  if (q.isPending) return <LoadingState className="p-8" />;
  if (q.isError) return <p className="p-6 text-red">something fumbled: {(q.error as Error).message}</p>;

  const data = q.data;

  switch (panel.renderType) {
    case "table":
      return <TableRenderer data={data} />;
    case "heatmap":
      return <HeatmapRenderer data={data} />;
    case "grid":
      return <GridRenderer data={data} />;
    case "tier":
      return <TierRenderer data={data} />;
    case "cards":
      return <CardsRenderer data={data} />;
    case "bar-chart":
    case "line-chart":
    case "timeline":
      return <ChartRenderer data={data} type={panel.renderType} />;
    case "scatter":
      return <ScatterRenderer data={data} />;
    case "donut":
      return <DonutRenderer data={data} />;
    case "dashboard":
      return <DashboardRenderer data={data} />;
    case "network":
      return <NetworkRenderer data={data} />;
    case "compare":
    case "odds":
      return <DashboardRenderer data={data} />;
    default:
      return <TableRenderer data={data} />;
  }
}
