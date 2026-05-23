"use client";

import { LoadingState } from "@razzle/ui";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { runScreener } from "@/lib/api";
import { exploreParsers } from "@/lib/explore-params";
import { ExploreFeed } from "./ExploreFeed";
import { ExploreTable } from "./ExploreTable";

const POSITIONS = ["QB", "RB", "WR", "TE"] as const;

export function ExplorePageClient() {
  const [params, setParams] = useQueryStates(exploreParsers);

  const query = useQuery({
    queryKey: ["screener", params],
    queryFn: () =>
      runScreener({
        search: params.q,
        positions: params.pos.filter((p): p is "QB" | "RB" | "WR" | "TE" =>
          POSITIONS.includes(p as (typeof POSITIONS)[number]),
        ),
        teams: params.team,
        season: params.season || 0,
        sort_key: params.sort,
        sort_direction: params.dir,
        limit: params.limit,
        offset: 0,
        week: 0,
        filters: [],
        relevance: "fantasy",
        min_gp: 0,
      }),
  });

  function togglePosition(pos: string) {
    const next = params.pos.includes(pos) ? params.pos.filter((p) => p !== pos) : [...params.pos, pos];
    void setParams({ pos: next });
  }

  function onSort(key: string) {
    void setParams({
      sort: key,
      dir: params.sort === key && params.dir === "desc" ? "asc" : "desc",
    });
  }

  return (
    <div className="lab-container">
      <div className="toolbar">
        <div className="toolbar-section">
          <input
            value={params.q}
            onChange={(e) => void setParams({ q: e.target.value })}
            placeholder="search players..."
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
              <strong>{query.data.count}</strong> players
            </>
          ) : (
            "pulling film..."
          )}
        </span>
      </div>

      {query.isPending && <LoadingState className="p-8" />}
      {query.isError && (
        <p className="p-6 text-red">something fumbled: {(query.error as Error).message}</p>
      )}
      {query.isSuccess && (
        <>
          <ExploreTable
            rows={query.data.items}
            sortKey={params.sort}
            sortDir={params.dir}
            onSort={onSort}
          />
          <ExploreFeed rows={query.data.items} />
        </>
      )}
    </div>
  );
}
