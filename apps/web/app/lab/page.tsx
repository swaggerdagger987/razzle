import { LabPanelGrid } from "@/components/lab/LabSidebar";
import { AgentNudgeBar } from "@/components/shell/AgentNudgeBar";

export const metadata = {
  title: "The Lab — 10 Deep Panels",
  description: "Dynasty rankings, breakouts, aging curves, and more — each with staff-owned analysis.",
};

export default function LabIndexPage() {
  return (
    <section className="lab-index mx-auto max-w-6xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>
          The Lab
        </h1>
        <p className="text-ink-medium">
          10 deep panels with staff-owned headers. Pick one — or start with Explore for the full screener.
        </p>
      </header>
      <AgentNudgeBar source="lab" />
      <LabPanelGrid />
    </section>
  );
}
