"use client";

import { LoadingState } from "@razzle/ui";
import type { PanelDefinition } from "@razzle/panels";
import { useQuery } from "@tanstack/react-query";
import { fetchPanelData, isUpgradeRequiredError } from "@/lib/panel-api";
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
import { DynastyRankingsRenderer } from "./renderers/DynastyRankingsRenderer";
import { TradeValuesRenderer } from "./renderers/TradeValuesRenderer";
import { BreakoutsRenderer } from "./renderers/BreakoutsRenderer";
import { WeeklyHeatmapRenderer } from "./renderers/WeeklyHeatmapRenderer";
import { ProspectsRenderer } from "./renderers/ProspectsRenderer";
import { GamelogRenderer } from "./renderers/GamelogRenderer";
import { EfficiencyRenderer } from "./renderers/EfficiencyRenderer";
import { AgingCurvesRenderer } from "./renderers/AgingCurvesRenderer";
import { BuySellRenderer } from "./renderers/BuySellRenderer";
import { DynastyDashboardRenderer } from "./renderers/DynastyDashboardRenderer";
import { TierRenderer } from "./renderers/TierRenderer";
import { ProUpgradeGate } from "./ProUpgradeGate";

interface Props {
  panel: PanelDefinition;
}

export function PanelRenderer({ panel }: Props) {
  if (panel.renderType === "screener") {
    return <ScreenerRedirect panel={panel} />;
  }

  if (panel.slug === "rankings") {
    return <DynastyRankingsRenderer panel={panel} />;
  }

  if (panel.slug === "tradevalues") {
    return <TradeValuesRenderer panel={panel} />;
  }

  if (panel.slug === "breakouts") {
    return <BreakoutsRenderer panel={panel} />;
  }

  if (panel.slug === "weekly") {
    return <WeeklyHeatmapRenderer panel={panel} />;
  }

  if (panel.slug === "prospects") {
    return <ProspectsRenderer panel={panel} />;
  }

  if (panel.slug === "gamelog") {
    return <GamelogRenderer panel={panel} />;
  }

  if (panel.slug === "efficiency") {
    return <EfficiencyRenderer panel={panel} />;
  }

  if (panel.slug === "aging") {
    return <AgingCurvesRenderer panel={panel} />;
  }

  if (panel.slug === "buysell") {
    return <BuySellRenderer panel={panel} />;
  }

  if (panel.slug === "dashboard") {
    return <DynastyDashboardRenderer panel={panel} />;
  }

  const q = useQuery({
    queryKey: ["panel", panel.slug, panel.api],
    queryFn: () => fetchPanelData(panel),
  });

  if (q.isPending) return <LoadingState message="pulling film..." className="p-8" />;
  if (q.isError) {
    const err = q.error;
    if (isUpgradeRequiredError(err)) {
      return (
        <ProUpgradeGate
          panelTitle={panel.title}
          required={err.required}
          current={err.current}
          message={err.message}
        />
      );
    }
    return <p className="p-6 text-red">something fumbled: {(err as Error).message}</p>;
  }

  const record = q.data as Record<string, unknown>;
  const hasRows = Array.isArray(record.rows) && record.rows.length > 0;
  const hasItems = Array.isArray(record.items) && record.items.length > 0;
  const empty = Boolean(record.error) && !hasRows && !hasItems;

  if (empty) {
    return (
      <p className="p-6 text-ink-medium text-sm">
        no data for this panel yet — sync terminal.db or try another season.
      </p>
    );
  }

  switch (panel.renderType) {
    case "table":
      return <TableRenderer data={record} />;
    case "heatmap":
      return <HeatmapRenderer data={record} />;
    case "grid":
      return <GridRenderer data={record} />;
    case "tier":
      return <TierRenderer data={record} />;
    case "cards":
      return <CardsRenderer data={record} />;
    case "bar-chart":
    case "line-chart":
    case "timeline":
      return <ChartRenderer data={record} type={panel.renderType} />;
    case "scatter":
      return <ScatterRenderer data={record} />;
    case "donut":
      return <DonutRenderer data={record} />;
    case "dashboard":
      return <DashboardRenderer data={record} />;
    case "network":
      return <NetworkRenderer data={record} />;
    case "compare":
    case "odds":
      return <DashboardRenderer data={record} />;
    default:
      return <TableRenderer data={record} />;
  }
}
