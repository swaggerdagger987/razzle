"use client";

import Link from "next/link";
import type { Route } from "next";
import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import type { PlayerRow } from "@/lib/api";

const CLEAR_STATUSES = new Set(["", "active", "healthy", "n/a", "na", "none"]);

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function isInjuryFlagged(row: PlayerRow): boolean {
  if (injuryStatusLabel(row)) return true;
  const missed = Number(row.games_missed ?? 0);
  return Number.isFinite(missed) && missed >= 1;
}

export function injuryStatusLabel(row: PlayerRow): string | null {
  const raw = row.injury_status ?? row.injury_designation ?? row.status;
  if (raw == null || raw === "") return null;

  const normalized = String(raw).trim();
  if (!normalized || CLEAR_STATUSES.has(normalized.toLowerCase())) return null;

  const upper = normalized.toUpperCase();
  if (upper.length <= 4) return upper;
  if (upper.includes("QUESTION")) return "Q";
  if (upper.includes("DOUBT")) return "D";
  if (upper.includes("OUT")) return "OUT";
  if (upper.includes("INJURED")) return "IR";
  return upper.slice(0, 6);
}

interface Props {
  row: PlayerRow;
}

/** Compact Dolphin chip when the screener row carries an injury flag. */
export function ExploreInjuryChip({ row }: Props) {
  if (!isInjuryFlagged(row)) return null;

  const agent = AGENT_BY_ID.dolphin;
  const label = injuryStatusLabel(row) ?? "FLAG";
  const missed = Number(row.games_missed ?? 0);
  const detail =
    missed >= 1 ? `${label} · ${missed} missed` : `${label} on the wire`;

  const href = toRoom({
    agentId: "dolphin",
    question: `${row.full_name}: what's the injury timeline?`,
    player: {
      playerId: row.player_id,
      slug: slugify(row.full_name),
      name: row.full_name,
      position: row.position,
      team: row.team,
    },
  });

  return (
    <Link
      href={href as Route}
      className="explore-injury-chip"
      onClick={(e) => e.stopPropagation()}
      title={`${agent.name} — ${detail}`}
    >
      <img src={`/agents/${agent.avatar}.svg`} alt="" width={12} height={12} />
      <span>{label}</span>
    </Link>
  );
}
