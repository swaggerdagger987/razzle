"use client";

import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import type { SavedViewState } from "@/lib/saved-views";
import {
  MAX_SAVED_VIEWS,
  createSavedView,
  loadSavedViews,
  saveSavedViews,
  savedViewSummary,
  type SavedView,
} from "@/lib/saved-views";

interface Props {
  current: SavedViewState;
  onLoad: (state: SavedViewState) => void;
}

export function SavedViewsManager({ current, onLoad }: Props) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setViews(loadSavedViews());
  }, []);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("name this view first");
      return;
    }
    if (views.length >= MAX_SAVED_VIEWS) {
      setError(`free tier: ${MAX_SAVED_VIEWS} views max — delete one first`);
      return;
    }
    const next = [createSavedView(trimmed, current), ...views];
    saveSavedViews(next);
    setViews(next);
    setName("");
    setError("");
  }

  function handleDelete(id: string) {
    const next = views.filter((v) => v.id !== id);
    saveSavedViews(next);
    setViews(next);
  }

  function handleSelect(id: string) {
    if (!id) return;
    const view = views.find((v) => v.id === id);
    if (!view) return;
    onLoad({
      q: view.q,
      pos: view.pos,
      sort: view.sort,
      dir: view.dir,
      season: view.season,
      team: view.team,
      limit: view.limit,
      universe: view.universe,
    });
  }

  const latest = views[0];

  return (
    <>
      <select
        className="input-chunky text-sm"
        style={{ maxWidth: 140 }}
        value=""
        onChange={(e) => handleSelect(e.target.value)}
        aria-label="Load saved view"
      >
        <option value="">saved views…</option>
        {views.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
      <button type="button" className="btn-chunky text-sm" onClick={() => setOpen(true)}>
        save view
      </button>

      {open && (
        <div
          className="filter-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="saved-views-title"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="filter-modal" style={{ width: 440 }} onClick={(e) => e.stopPropagation()}>
            <h3 id="saved-views-title">Saved Views</h3>
            <p className="text-ink-light mb-3 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
              snapshot your filters and sort — reload one click for Reddit screenshots
            </p>
            <div className="filter-modal-row mb-2">
              <input
                type="text"
                className="input-chunky flex-1"
                placeholder="view name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="View name"
              />
            </div>
            {error && <p className="text-red mb-2 text-sm">{error}</p>}
            <div className="filter-modal-actions">
              <button type="button" className="btn-chunky" onClick={() => setOpen(false)}>
                Never Mind
              </button>
              <button type="button" className="btn-primary" onClick={handleSave}>
                Save View
              </button>
            </div>
            {views.length > 0 && (
              <div className="mt-4 border-t-2 border-dashed border-ink-faint pt-3">
                <p
                  className="text-ink-light mb-2 text-xs uppercase"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  saved ({views.length}/{MAX_SAVED_VIEWS})
                </p>
                {views.map((v) => (
                  <div key={v.id} className="mb-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className="text-left text-sm font-bold hover:text-orange"
                      onClick={() => {
                        handleSelect(v.id);
                        setOpen(false);
                      }}
                    >
                      {v.name}
                      <span className="text-ink-light ml-1 text-xs font-normal">
                        {savedViewSummary(v)}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="btn-chunky text-xs"
                      onClick={() => handleDelete(v.id)}
                    >
                      delete
                    </button>
                  </div>
                ))}
                {latest && (
                  <Link
                    href={
                      toRoom({
                        agentId: "razzle",
                        question: `I saved screener view "${latest.name}" (${savedViewSummary(latest)}) — who should I target?`,
                      }) as Route
                    }
                    className="btn-chunky mt-2 inline-block text-sm"
                  >
                    ask Razzle in film room →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
