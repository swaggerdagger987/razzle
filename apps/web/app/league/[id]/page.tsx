import { LeagueDashboard } from "@/components/league/LeagueDashboard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeagueHubPage({ params }: PageProps) {
  const { id } = await params;
  return <LeagueDashboard leagueId={id} feature="self-scout" />;
}
