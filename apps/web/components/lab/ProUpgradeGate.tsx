"use client";

import { toExplore, toRoom } from "@razzle/hallway";
import { PositionPill } from "@razzle/ui";
import Link from "next/link";
import type { Route } from "next";
import {
  proUpgradePerkLines,
  teaserRowsForPanel,
  teaserRowsToOgSnapshot,
  upgradePitchForPanel,
} from "@/lib/panel-upgrade-teaser";
import {
  DEFAULT_LAB_OG_PLAYER_ID,
  DEFAULT_LAB_OG_PLAYER_NAME,
  LabOgExportLink,
} from "./LabOgExportLink";
import { PanelAgentHeader, PanelAgentLoading, panelAgent } from "./PanelAgentHeader";

const PLAYER_SCOPED_OG_SLUGS = new Set(["gamelog", "dynasty-comps", "percentiles"]);

interface Props {
  panelSlug: string;
  panelTitle: string;
  required?: string;
  current?: string;
  message?: string;
}

export function ProUpgradeGate({
  panelSlug,
  panelTitle,
  required = "pro",
  current = "free",
  message,
}: Props) {
  const agent = panelAgent(panelSlug);
  const pitch = upgradePitchForPanel(panelSlug, agent.name);
  const rows = teaserRowsForPanel(panelSlug);
  const perks = proUpgradePerkLines();
  const ogSnapshot = teaserRowsToOgSnapshot(panelSlug);
  const playerScopedOg = PLAYER_SCOPED_OG_SLUGS.has(panelSlug);
  const ogPlayerId = playerScopedOg ? DEFAULT_LAB_OG_PLAYER_ID : undefined;
  const ogPlayerName = playerScopedOg ? DEFAULT_LAB_OG_PLAYER_NAME : undefined;
  const roomQuestion = `What should I know about ${panelTitle.toLowerCase()} for my dynasty roster?`;

  return (
    <div className="pro-upgrade-gate">
      <PanelAgentHeader agent={agent} slug={panelSlug} />
      <PanelAgentLoading agent={agent} />

      <div className="pro-upgrade-preview-wrap chunky bg-bg-card">
        <div className="pro-upgrade-preview" aria-hidden>
          {rows.map((row) => (
            <div key={`${row.name}-${row.detail}`} className="pro-upgrade-preview-row">
              <span className="font-bold">{row.name}</span>
              <PositionPill position={row.position} />
              <span className="text-ink-medium text-xs">{row.detail}</span>
            </div>
          ))}
        </div>
        <p className="pro-upgrade-preview-label">Pro preview — data blurred on free tier</p>
      </div>

      <div className="pro-upgrade-body chunky bg-bg-card p-6 text-center">
        <span className="pro-upgrade-badge" aria-hidden>
          {required.toUpperCase()}
        </span>
        <h2 className="mt-4 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          {panelTitle}
        </h2>
        <p className="mt-3 text-ink-medium" style={{ fontFamily: "var(--font-hand)" }}>
          {pitch}
        </p>
        {message && current !== required && (
          <p className="mt-2 text-sm text-ink-light">
            {message}
          </p>
        )}
        <div className="pro-upgrade-actions mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/pricing" className="chunky chunky-hover bg-orange px-6 py-3 text-white">
            See Pro plans
          </Link>
          <Link
            href={toRoom({ agentId: agent.id, question: roomQuestion, panelSlug }) as Route}
            className="chunky chunky-hover bg-bg-card px-4 py-3 text-sm"
          >
            ask {agent.name} →
          </Link>
          <Link
            href={toExplore({}) as Route}
            className="chunky chunky-hover bg-bg-card px-4 py-3 text-sm"
          >
            free screener →
          </Link>
        </div>
        <p className="mt-3 text-xs text-ink-light">dev? flip plan in the toolbar ↑</p>
        <p className="mt-4">
          <LabOgExportLink
            slug={panelSlug}
            downloadName={`razzle-${panelSlug}-sample.png`}
            label="export sample card →"
            playerId={ogPlayerId}
            playerName={ogPlayerName}
            snapshotRows={ogSnapshot}
          />
        </p>
        <ul className="pro-upgrade-perks mt-6 text-left text-sm text-ink-medium">
          {perks.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
