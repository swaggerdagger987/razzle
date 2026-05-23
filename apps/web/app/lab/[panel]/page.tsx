import { notFound } from "next/navigation";
import { PANELS, getPanel } from "@razzle/panels";
import { LabPanelClient } from "./LabPanelClient";

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
      images: [`/og/${panel.slug}`],
    },
  };
}

export default async function PanelPage({ params }: PageProps) {
  const { panel: slug } = await params;
  const panel = getPanel(slug);
  if (!panel) notFound();

  return <LabPanelClient panel={panel} />;
}
