"use client";

import { LoadingState, PositionPill } from "@razzle/ui";
import { useQuery } from "@tanstack/react-query";
import { PlayerIntelCard } from "./PlayerIntelCard";

interface PlayerProfile {
  player: {
    player_id?: string;
    full_name?: string;
    position?: string;
    team?: string;
    age?: number;
    college?: string;
    headshot_url?: string;
  };
  seasons: Array<Record<string, unknown>>;
  career?: Record<string, unknown>;
  combine?: Record<string, unknown> | null;
}

export function PlayerStatsTab({ playerId }: { playerId: string }) {
  const q = useQuery({
    queryKey: ["player-profile", playerId],
    queryFn: async (): Promise<PlayerProfile> => {
      const res = await fetch(`/api/players/${encodeURIComponent(playerId)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? "player not found");
      }
      return res.json();
    },
  });

  if (q.isPending) return <LoadingState message="pulling film..." className="p-4" />;
  if (q.isError) {
    return (
      <div className="player-sheet-section">
        <p className="text-red text-sm">{(q.error as Error).message}</p>
        <p className="text-ink-medium mt-2 text-xs">
          Run <code className="text-xs">python scripts/sync_data.py --quick</code> to populate player data.
        </p>
      </div>
    );
  }

  const { player, seasons, career, combine } = q.data;
  const latest = seasons.length ? seasons[seasons.length - 1] : null;

  return (
    <div className="player-sheet-section flex flex-col gap-4">
      {player.headshot_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.headshot_url} alt="" className="h-20 w-20 rounded object-cover" />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {player.position && <PositionPill position={player.position as "QB" | "RB" | "WR" | "TE"} />}
        {player.team && <span className="text-sm">{player.team}</span>}
        {player.age != null && <span className="text-ink-medium text-sm">Age {player.age}</span>}
        {player.college && <span className="text-ink-medium text-sm">{player.college}</span>}
      </div>

      {latest && (
        <div className="chunky bg-bg p-4">
          <h3 className="text-sm font-bold uppercase text-ink-light">Latest season ({String(latest.season)})</h3>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <Stat label="Games" value={latest.games} />
            <Stat label="PPR pts" value={latest.fantasy_points_ppr} />
            <Stat label="Rec" value={latest.receptions} />
            <Stat label="Rush yds" value={latest.rushing_yards} />
          </dl>
        </div>
      )}

      {career && (
        <div className="chunky bg-bg p-4">
          <h3 className="text-sm font-bold uppercase text-ink-light">Career</h3>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <Stat label="Seasons" value={career.seasons} />
            <Stat label="PPR pts" value={career.fantasy_points_ppr} />
          </dl>
        </div>
      )}

      {combine && (
        <div className="chunky bg-bg p-4 text-sm">
          <h3 className="font-bold uppercase text-ink-light">Draft / Combine</h3>
          <p className="mt-1">
            {String(combine.draft_year ?? "—")} · Rd {String(combine.draft_round ?? "—")} · Pick{" "}
            {String(combine.draft_pick ?? "—")}
            {combine.forty != null && ` · 40: ${String(combine.forty)}s`}
          </p>
        </div>
      )}

      {seasons.length > 1 && (
        <div className="table-wrap">
          <table className="screener-table text-xs">
            <thead>
              <tr>
                <th>Season</th>
                <th>GP</th>
                <th>PPR</th>
              </tr>
            </thead>
            <tbody>
              {[...seasons].reverse().slice(0, 5).map((s) => (
                <tr key={String(s.season)} className="screener-row">
                  <td>{String(s.season)}</td>
                  <td>{String(s.games ?? "")}</td>
                  <td>{Number(s.fantasy_points_ppr ?? 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PlayerIntelCard
        playerId={playerId}
        playerName={player.full_name}
        position={player.position}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: unknown }) {
  return (
    <>
      <dt className="text-ink-light">{label}</dt>
      <dd className="font-bold">{value != null ? String(value) : "—"}</dd>
    </>
  );
}
