import { LabPanelGrid } from "@/components/lab/LabSidebar";
import { AgentNudgeBar } from "@/components/shell/AgentNudgeBar";

export const metadata = {
  title: "The Lab — 10 Launch Panels",
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
          Staff desks — each agent owns their launch panels. Pick a desk, or start with Explore for the full screener.
        </p>
      </header>
      <AgentNudgeBar source="lab" />
      <LabPanelGrid />
    </section>
  );
}
