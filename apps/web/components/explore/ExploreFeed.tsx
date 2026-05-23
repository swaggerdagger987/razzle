"use client";

import { PositionPill } from "@razzle/ui";
import type { PlayerRow } from "@/lib/api";
import { usePlayerSheet } from "@/lib/player-sheet-context";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Props {
  rows: PlayerRow[];
}

export function ExploreFeed({ rows }: Props) {
  const { openPlayer } = usePlayerSheet();

  return (
    <div className="explore-feed md:hidden">
      {rows.map((row) => (
        <button
          key={row.player_id}
          type="button"
          className="explore-feed-card chunky bg-bg-card"
          onClick={() =>
            openPlayer({
              playerId: row.player_id,
              slug: slugify(row.full_name),
              name: row.full_name,
              position: row.position,
              team: row.team,
            })
          }
        >
          <div className="explore-feed-top">
            <span className="explore-feed-name">{row.full_name}</span>
            <PositionPill position={row.position} />
          </div>
          <div className="explore-feed-stats">
            <span>{row.team}</span>
            <span>{row.games} GP</span>
            <span className="explore-feed-fpts">{Number(row.fantasy_points_ppr).toFixed(1)} FPTS</span>
          </div>
        </button>
      ))}
    </div>
  );
}
