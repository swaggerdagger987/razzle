"use client";

import { PositionPill } from "@razzle/ui";
import type { PlayerRow } from "@/lib/api";
import { usePlayerSheet } from "@/lib/player-sheet-context";
import { ExploreMarginNote } from "./ExploreMarginNote";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

import type { ExploreUniverse } from "@/lib/explore-params";

interface Props {
  rows: PlayerRow[];
  universe?: ExploreUniverse;
}

export function ExploreFeed({ rows, universe = "nfl" }: Props) {
  const { openPlayer } = usePlayerSheet();
  const primaryStatKey = universe === "college" ? "total_yards" : "fantasy_points_ppr";
  const primaryLabel = universe === "college" ? "YDS" : "FPTS";

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
            <span className="explore-feed-fpts">
              {Number(row[primaryStatKey] ?? row.fantasy_points_ppr ?? 0).toLocaleString()} {primaryLabel}
            </span>
          </div>
          {universe === "nfl" || universe === "college" ? (
            <div className="explore-feed-margin">
              <ExploreMarginNote row={row} universe={universe} />
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
}
