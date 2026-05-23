"use client";

import Link from "next/link";
import type { Route } from "next";
import { AGENT_BY_ID } from "@razzle/agents";
import { toRoom } from "@razzle/hallway";
import type { PlayerRow } from "@/lib/api";
import type { ExploreUniverse } from "@/lib/explore-params";
import { marginNoteForRow } from "@/lib/margin-notes";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Props {
  row: PlayerRow;
  universe: ExploreUniverse;
}

export function ExploreMarginNote({ row, universe }: Props) {
  const note = marginNoteForRow(row, universe);
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
