"use client";

import { LoadingState } from "@razzle/ui";
import { loadingCopyForAgent } from "@razzle/agents";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { runScreener } from "@/lib/api";
import {
  defaultSortForUniverse,
  exploreParsers,
  type ExploreUniverse,
} from "@/lib/explore-params";
import { ExploreFeed } from "./ExploreFeed";
import { ExploreShareButton } from "./ExploreShareButton";
import { ExploreTable } from "./ExploreTable";

const POSITIONS = ["QB", "RB", "WR", "TE"] as const;

export function ExplorePageClient() {
  const [params, setParams] = useQueryStates(exploreParsers);
  const universe = params.universe as ExploreUniverse;
  const sortKey =
    universe === "college" && params.sort === "fantasy_points_ppr"
      ? "total_yards"
      : params.sort;

  useEffect(() => {
    document.body.classList.toggle("college-mode", universe === "college");
    return () => document.body.classList.remove("college-mode");
  }, [universe]);

  const query = useQuery({
    queryKey: ["screener", params, sortKey],
    queryFn: () =>
      runScreener({
        search: params.q,
        positions: params.pos.filter((p): p is "QB" | "RB" | "WR" | "TE" =>
          POSITIONS.includes(p as (typeof POSITIONS)[number]),
        ),
        teams: params.team,
        season: params.season || 0,
        sort_key: sortKey,
        sort_direction: params.dir,
        limit: params.limit,
        offset: 0,
        week: 0,
        filters: [],
        relevance: "fantasy",
        min_gp: 0,
        universe,
      }),
  });

  function togglePosition(pos: string) {
    const next = params.pos.includes(pos) ? params.pos.filter((p) => p !== pos) : [...params.pos, pos];
    void setParams({ pos: next });
  }

  function setUniverse(next: ExploreUniverse) {
    if (next === universe) return;
    void setParams({
      universe: next,
      sort: defaultSortForUniverse(next),
      dir: "desc",
    });
  }

  function onSort(key: string) {
    void setParams({
      sort: key,
      dir: params.sort === key && params.dir === "desc" ? "asc" : "desc",
    });
  }

  const statLabel = universe === "college" ? "college players" : "players";

  return (
    <div className="lab-container">
      <div className="universe-bar">
        <div className="universe-bar-inner">
          <button
            type="button"
            className={`btn-chunky universe-toggle${universe === "nfl" ? " active" : ""}`}
            onClick={() => setUniverse("nfl")}
          >
            NFL
          </button>
          <button
            type="button"
            className={`btn-chunky universe-toggle${universe === "college" ? " active" : ""}`}
            onClick={() => setUniverse("college")}
          >
            College
          </button>
        </div>
        <span className="universe-bar-label">
          {universe === "college" ? (
            <>
              college stats — the screener is forever free
              {" · "}
              <Link href="/lab/prospects" className="underline hover:text-orange">
                big board →
              </Link>
            </>
          ) : (
            <>
              NFL universe
              {" · "}
              <Link href="/lab/prospects" className="underline hover:text-orange">
                prospects →
              </Link>
            </>
          )}
        </span>
      </div>

      <div className="toolbar">
        <div className="toolbar-section">
          <input
            value={params.q}
            onChange={(e) => void setParams({ q: e.target.value })}
            placeholder={universe === "college" ? "search college players..." : "search players..."}
            className="chunky bg-bg px-3 py-2 text-sm"
            aria-label="Search players"
          />
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-section">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              className={`pos-chip pos-${pos.toLowerCase()}${params.pos.includes(pos) ? " active" : ""}`}
              onClick={() => togglePosition(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
        <span className="result-count">
          {query.isSuccess ? (
            <>
              <strong>{query.data.count}</strong> {statLabel}
            </>
          ) : (
            universe === "college" ? loadingCopyForAgent("hawkeye") : "pulling film..."
          )}
        </span>
        <ExploreShareButton universe={universe} sort={sortKey} q={params.q} pos={params.pos} />
      </div>

      {query.isPending && <LoadingState className="p-8" />}
      {query.isError && (
        <p className="p-6 text-red">something fumbled: {(query.error as Error).message}</p>
      )}
      {query.isSuccess && (
        <>
          <ExploreTable
            rows={query.data.items}
            sortKey={sortKey}
            sortDir={params.dir}
            onSort={onSort}
            universe={universe}
          />
          <ExploreFeed rows={query.data.items} universe={universe} />
        </>
      )}
    </div>
  );
}
