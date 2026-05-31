"use client";

import type { BureauFeatureSlug } from "@/lib/bureau-features";
import { BureauSelfScout } from "./BureauSelfScout";
import { BureauMonteCarlo } from "./BureauMonteCarlo";
import { BureauManagerProfiles } from "./BureauManagerProfiles";
import { BureauPressureMap } from "./BureauPressureMap";
import { BureauTradeNetwork } from "./BureauTradeNetwork";
import { BureauTradeFinder } from "./BureauTradeFinder";
import { BureauHeadToHead } from "./BureauHeadToHead";
import { BureauRosterDepth } from "./BureauRosterDepth";
import { BureauBuildProfiles } from "./BureauBuildProfiles";
import { BureauPowerRankings } from "./BureauPowerRankings";
import { BureauWaiverTendencies } from "./BureauWaiverTendencies";

interface Props {
  feature: BureauFeatureSlug;
  data: Record<string, unknown>;
  leagueId: string;
}

export function BureauFeatureBody({ feature, data, leagueId }: Props) {
  if (feature === "self-scout") return <BureauSelfScout data={data} />;
  if (feature === "monte-carlo") return <BureauMonteCarlo data={data} leagueId={leagueId} />;
  if (feature === "manager-profiles") return <BureauManagerProfiles data={data} leagueId={leagueId} />;
  if (feature === "pressure-map") return <BureauPressureMap data={data} leagueId={leagueId} />;
  if (feature === "trade-network") return <BureauTradeNetwork data={data} leagueId={leagueId} />;
  if (feature === "trade-finder") return <BureauTradeFinder data={data} leagueId={leagueId} />;
  if (feature === "head-to-head") return <BureauHeadToHead data={data} leagueId={leagueId} />;
  if (feature === "roster-depth") return <BureauRosterDepth data={data} leagueId={leagueId} />;
  if (feature === "build-profiles") return <BureauBuildProfiles data={data} leagueId={leagueId} />;
  if (feature === "waiver-tendencies") return <BureauWaiverTendencies data={data} leagueId={leagueId} />;
  if (feature === "power-rankings") return <BureauPowerRankings data={data} leagueId={leagueId} />;

  return null;
}
