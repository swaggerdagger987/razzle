"use client";

interface Props {
  panelTitle: string;
  required?: string;
  current?: string;
  message?: string;
}

export function ProUpgradeGate({ panelTitle, required = "pro", current = "free", message }: Props) {
  return (
    <div className="pro-upgrade-gate chunky bg-bg-card p-8 text-center">
      <span className="pro-upgrade-badge" aria-hidden>
        PRO
      </span>
      <h2 className="mt-4 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
        {panelTitle}
      </h2>
      <p className="mt-3 text-ink-medium">
        {message ?? `This panel needs ${required.toUpperCase()}. You're on ${current.toUpperCase()}.`}
      </p>
      <p className="mt-2 text-sm text-ink-light" style={{ fontFamily: "var(--font-hand)" }}>
        dynasty tools that know your league — not generic rankings
      </p>
      <div className="pro-upgrade-actions mt-6 flex flex-wrap items-center justify-center gap-3">
        <a href="/pricing" className="chunky chunky-hover bg-orange px-6 py-3 text-white">
          See Pro plans
        </a>
        <span className="text-xs text-ink-light">
          dev? flip plan in the toolbar ↑
        </span>
      </div>
      <ul className="pro-upgrade-perks mt-6 text-left text-sm text-ink-medium">
        <li>100 Lab panels — trade values, breakouts, aging curves</li>
        <li>Bureau deep cuts — waiver tendencies, monte carlo</li>
        <li>Situation Room — your league, already in context</li>
      </ul>
    </div>
  );
}
