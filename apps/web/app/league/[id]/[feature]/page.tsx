import { LeagueDashboard, type BureauFeatureSlug } from "@/components/league/LeagueDashboard";
import { notFound } from "next/navigation";
import { BUREAU_FEATURES } from "@/components/league/LeagueDashboard";

interface PageProps {
  params: Promise<{ id: string; feature: string }>;
}

export default async function LeagueFeaturePage({ params }: PageProps) {
  const { id, feature } = await params;
  const valid = BUREAU_FEATURES.some((f) => f.slug === feature);
  if (!valid) notFound();
  return <LeagueDashboard leagueId={id} feature={feature as BureauFeatureSlug} />;
}
