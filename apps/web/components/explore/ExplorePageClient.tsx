"use client";

import { LoadingState } from "@razzle/ui";
import { loadingCopyForAgent } from "@razzle/agents";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { ApiError, runScreener } from "@/lib/api";
import {
  defaultSortForUniverse,
  exploreParsers,
  type ExploreUniverse,
} from "@/lib/explore-params";
import {
  enrichRowsWithFormulas,
  formulaColumnKey,
  loadFormulas,
  type SavedFormula,
} from "@/lib/formulas";
import { ExploreFeed } from "./ExploreFeed";
import { ExploreShareButton } from "./ExploreShareButton";
import { ExploreTable } from "./ExploreTable";
import { FormulaBuilder } from "./FormulaBuilder";
import { FormulaStore } from "./FormulaStore";
import { SavedViewsManager } from "./SavedViewsManager";

const POSITIONS = ["QB", "RB", "WR", "TE"] as const;

function exploreErrorCopy(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return "The API fumbled the handoff. If this is local, the database may be empty or mid-sync.";
    }
    if (error.status === 404) {
      return "The screener endpoint is missing. Check the API route before trusting this board.";
    }
    return `The API called this one back: ${error.message}`;
  }

  return error instanceof Error ? error.message : "The screener did not answer. Try the snap again.";
}

export function ExplorePageClient() {
  const [params, setParams] = useQueryStates(exploreParsers);
  const [formulas, setFormulas] = useState<SavedFormula[]>([]);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const universe = params.universe as ExploreUniverse;
  const apiSortKey =
    universe === "college" && params.sort === "fantasy_points_ppr"
      ? "total_yards"
      : params.sort.startsWith("formula_")
        ? defaultSortForUniverse(universe)
        : params.sort;
  const sortKey = params.sort;

  useEffect(() => {
    document.body.classList.toggle("college-mode", universe === "college");
    return () => document.body.classList.remove("college-mode");
  }, [universe]);

  useEffect(() => {
    setFormulas(loadFormulas());
  }, []);

  const query = useQuery({
    queryKey: ["screener", params, apiSortKey],
    queryFn: () =>
      runScreener({
        search: params.q,
        positions: params.pos.filter((p): p is "QB" | "RB" | "WR" | "TE" =>
          POSITIONS.includes(p as (typeof POSITIONS)[number]),
        ),
        teams: params.team,
        season: params.season || 0,
        sort_key: apiSortKey,
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

  const displayRows = useMemo(() => {
    if (!query.data?.items) return [];
    let rows = enrichRowsWithFormulas(query.data.items, formulas);
    if (sortKey.startsWith("formula_")) {
      const dir = params.dir === "asc" ? 1 : -1;
      rows = [...rows].sort(
        (a, b) => dir * (Number(a[sortKey] ?? 0) - Number(b[sortKey] ?? 0)),
      );
    }
    return rows;
  }, [query.data?.items, formulas, sortKey, params.dir]);

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

  function onFormulaSaved(next: SavedFormula[], sortKey?: string) {
    setFormulas(next);
    const key = sortKey ?? (next.length > 0 ? formulaColumnKey(next[next.length - 1]!.name) : null);
    if (key) void setParams({ sort: key, dir: "desc" });
  }

  const statLabel = universe === "college" ? "college players" : "players";
  const hasActiveFilters = Boolean(params.q || params.pos.length || params.team.length);
  const emptyTitle = hasActiveFilters ? "No players match this board." : "No film in the database yet.";
  const emptyBody = hasActiveFilters
    ? "Widen the filters or clear the search. The good stuff is probably one click away."
    : "Run the data sync, then come back when the film room has tape.";

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
        <button
          type="button"
          className="btn-chunky text-sm"
          onClick={() => setFormulaOpen(true)}
        >
          + formula
        </button>
        <button
          type="button"
          className="btn-chunky text-sm"
          onClick={() => setStoreOpen(true)}
        >
          formula store
        </button>
        <SavedViewsManager
          current={{
            q: params.q,
            pos: params.pos,
            sort: sortKey,
            dir: params.dir,
            season: params.season,
            team: params.team,
            limit: params.limit,
            universe,
          }}
          onLoad={(state) => void setParams(state)}
        />
        <ExploreShareButton
          universe={universe}
          sort={sortKey}
          dir={params.dir}
          q={params.q}
          pos={params.pos}
        />
      </div>

      <FormulaBuilder
        open={formulaOpen}
        onClose={() => setFormulaOpen(false)}
        onSaved={(next) => onFormulaSaved(next)}
      />

      <FormulaStore
        open={storeOpen}
        onClose={() => setStoreOpen(false)}
        onInstalled={onFormulaSaved}
      />

      {query.isPending && <LoadingState className="p-8" />}
      {query.isError && (
        <div className="explore-state-card chunky bg-bg-card" role="alert">
          <span className="explore-state-kicker">Screener status</span>
          <h2>Something fumbled.</h2>
          <p>{exploreErrorCopy(query.error)}</p>
          <button type="button" className="btn-chunky text-sm" onClick={() => void query.refetch()}>
            retry snap
          </button>
        </div>
      )}
      {query.isSuccess && displayRows.length === 0 && (
        <div className="explore-state-card chunky bg-bg-card">
          <span className="explore-state-kicker">{universe === "college" ? "College board" : "NFL board"}</span>
          <h2>{emptyTitle}</h2>
          <p>{emptyBody}</p>
          {hasActiveFilters ? (
            <button
              type="button"
              className="btn-chunky text-sm"
              onClick={() => void setParams({ q: "", pos: [], team: [] })}
            >
              clear filters
            </button>
          ) : null}
        </div>
      )}
      {query.isSuccess && displayRows.length > 0 && (
        <>
          <ExploreTable
            rows={displayRows}
            sortKey={sortKey}
            sortDir={params.dir}
            onSort={onSort}
            universe={universe}
            formulas={formulas}
          />
          <ExploreFeed rows={displayRows} universe={universe} />
        </>
      )}
    </div>
  );
}
