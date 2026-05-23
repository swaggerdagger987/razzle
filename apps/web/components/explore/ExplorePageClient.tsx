"use client";

import { LoadingState } from "@razzle/ui";
import { loadingCopyForAgent } from "@razzle/agents";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { runScreener } from "@/lib/api";
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
import { SavedViewsManager } from "./SavedViewsManager";

const POSITIONS = ["QB", "RB", "WR", "TE"] as const;

export function ExplorePageClient() {
  const [params, setParams] = useQueryStates(exploreParsers);
  const [formulas, setFormulas] = useState<SavedFormula[]>([]);
  const [formulaOpen, setFormulaOpen] = useState(false);
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

  function onFormulaSaved(next: SavedFormula[]) {
    setFormulas(next);
    if (next.length > 0) {
      void setParams({ sort: formulaColumnKey(next[next.length - 1]!.name), dir: "desc" });
    }
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
        <button
          type="button"
          className="btn-chunky text-sm"
          onClick={() => setFormulaOpen(true)}
        >
          + formula
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
        <ExploreShareButton universe={universe} sort={sortKey} q={params.q} pos={params.pos} />
      </div>

      <FormulaBuilder
        open={formulaOpen}
        onClose={() => setFormulaOpen(false)}
        onSaved={onFormulaSaved}
      />

      {query.isPending && <LoadingState className="p-8" />}
      {query.isError && (
        <p className="p-6 text-red">something fumbled: {(query.error as Error).message}</p>
      )}
      {query.isSuccess && (
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
