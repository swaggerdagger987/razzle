import { notFound } from "next/navigation";
import { PANELS, getPanel } from "@razzle/panels";
import {
  DEFAULT_LAB_OG_PLAYER_ID,
  PLAYER_SCOPED_OG_SLUGS,
} from "@/components/lab/LabOgExportLink";
import { LabPanelClient } from "./LabPanelClient";

function labPanelOgImagePath(slug: string): string {
  if (!PLAYER_SCOPED_OG_SLUGS.has(slug)) return `/og/${slug}`;
  const qs = new URLSearchParams({ player_id: DEFAULT_LAB_OG_PLAYER_ID });
  return `/og/${slug}?${qs.toString()}`;
}

interface PageProps {
  params: Promise<{ panel: string }>;
}

export async function generateStaticParams() {
  return PANELS.map((p) => ({ panel: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { panel: slug } = await params;
  const panel = getPanel(slug);
  if (!panel) return {};
  return {
    title: `${panel.title} — Razzle Lab`,
    description: panel.blurb,
    openGraph: {
      title: `${panel.title} — Razzle`,
      description: panel.blurb,
      images: [labPanelOgImagePath(panel.slug)],
    },
  };
}

export default async function PanelPage({ params }: PageProps) {
  const { panel: slug } = await params;
  const panel = getPanel(slug);
  if (!panel) notFound();

  return <LabPanelClient panel={panel} />;
}
