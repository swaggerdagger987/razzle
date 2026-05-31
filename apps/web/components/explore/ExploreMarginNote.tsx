"use client";

import Link from "next/link";
import type { Route } from "next";
import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import type { PlayerRow } from "@/lib/api";
import type { ExploreUniverse } from "@/lib/explore-params";
import { marginNoteForOgExploreRow } from "@/lib/margin-notes";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Props {
  row: PlayerRow;
  universe: ExploreUniverse;
}

export function ExploreMarginNote({ row, universe }: Props) {
  const note = marginNoteForOgExploreRow(
    {
      full_name: row.full_name,
      position: row.position,
      team: row.team,
      player_id: row.player_id,
      age: row.age,
      fantasy_points_ppr: Number(row.fantasy_points_ppr ?? 0),
      targets: Number(row.targets ?? row.receiving_targets ?? 0),
      receiving_targets:
        row.receiving_targets != null ? Number(row.receiving_targets) : undefined,
      total_yards: row.total_yards != null ? Number(row.total_yards) : undefined,
      receptions: row.receptions != null ? Number(row.receptions) : undefined,
      passing_yards: row.passing_yards != null ? Number(row.passing_yards) : undefined,
      rushing_yards: row.rushing_yards != null ? Number(row.rushing_yards) : undefined,
    },
    universe,
  );
  if (!note) return <span className="text-ink-light">—</span>;

  const agent = AGENT_BY_ID[note.agentId];
  const href = toRoom({
    agentId: note.agentId,
    question: `${row.full_name}: ${note.text}?`,
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
      className="explore-margin-note"
      onClick={(e) => e.stopPropagation()}
      title={`Ask ${agent.name}`}
    >
      <img src={`/agents/${agent.avatar}.svg`} alt="" width={14} height={14} />
      <span style={{ fontFamily: "var(--font-hand)" }}>{note.text}</span>
    </Link>
  );
}
