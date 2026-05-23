import { LeagueDashboard, type BureauFeatureSlug } from "@/components/league/LeagueDashboard";
import { BUREAU_FEATURES } from "@/lib/bureau-features";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ id: string; feature: string }>;
}

export default async function LeagueFeaturePage({ params }: PageProps) {
  const { id, feature } = await params;
  const valid = BUREAU_FEATURES.some((f) => f.slug === feature);
  if (!valid) notFound();
  return (
    <Suspense fallback={<p className="p-8 text-ink-medium">pulling film...</p>}>
      <LeagueDashboard leagueId={id} feature={feature as BureauFeatureSlug} />
    </Suspense>
  );
}
