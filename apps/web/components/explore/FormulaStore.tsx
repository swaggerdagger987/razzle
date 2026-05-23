"use client";

import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import {
  MAX_FORMULAS,
  formulaColumnKey,
  loadFormulas,
  type SavedFormula,
} from "@/lib/formulas";
import {
  STORE_FORMULAS,
  filterStoreFormulas,
  installStoreFormula,
  isStoreFormulaInstalled,
  loadInstalledStoreIds,
  type StoreFormula,
} from "@/lib/formula-store";

const POSITIONS = ["ALL", "QB", "RB", "WR", "TE"] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onInstalled: (formulas: SavedFormula[], sortKey?: string) => void;
}

export function FormulaStore({ open, onClose, onInstalled }: Props) {
  const [posFilter, setPosFilter] = useState<(typeof POSITIONS)[number]>("ALL");
  const [installed, setInstalled] = useState<string[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [error, setError] = useState("");
  const [lastInstalled, setLastInstalled] = useState<StoreFormula | null>(null);

  useEffect(() => {
    if (!open) return;
    setInstalled(loadInstalledStoreIds());
    setSavedCount(loadFormulas().length);
    setError("");
    setLastInstalled(null);
  }, [open]);

  const catalog = useMemo(() => filterStoreFormulas(posFilter), [posFilter]);

  if (!open) return null;

  function handleInstall(formula: StoreFormula) {
    setError("");
    const next = installStoreFormula(formula, MAX_FORMULAS);
    if (!next) {
      setError(`free tier: ${MAX_FORMULAS} formulas max — delete one in + formula first`);
      return;
    }
    setInstalled(loadInstalledStoreIds());
    setSavedCount(next.length);
    setLastInstalled(formula);
    onInstalled(next, formulaColumnKey(formula.name));
  }

  return (
    <div
      className="filter-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="filter-modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
        <h3 id="store-title">Formula Store</h3>
        <p className="text-ink-light mb-3 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          community composites from Razzle Labs — one-click import to your screener
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              className={`pos-chip${posFilter === pos ? " active" : ""}${pos !== "ALL" ? ` pos-${pos.toLowerCase()}` : ""}`}
              onClick={() => setPosFilter(pos)}
            >
              {pos}
            </button>
          ))}
        </div>

        <p className="text-ink-light mb-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
          your formulas: {savedCount}/{MAX_FORMULAS}
        </p>

        <div className="mb-3 max-h-64 overflow-y-auto">
          {catalog.map((f) => {
            const done = installed.includes(f.id) || loadFormulas().some((s) => s.name === f.name);
            return (
              <div
                key={f.id}
                className="mb-2 rounded border-2 border-ink bg-bg-card p-3"
                style={{ boxShadow: "2px 2px 0 var(--ink)" }}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <span className="font-bold">{f.name}</span>
                  <span className="text-ink-light text-xs">{f.positions.join(" · ")}</span>
                </div>
                <p className="text-ink-medium mb-2 text-sm">{f.description}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-light text-xs">by {f.creator}</span>
                  <button
                    type="button"
                    className="btn-chunky text-xs"
                    disabled={done}
                    onClick={() => handleInstall(f)}
                  >
                    {done ? "installed" : "import"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="text-red mb-2 text-sm">{error}</p>}

        <div className="filter-modal-actions">
          <button type="button" className="btn-chunky" onClick={onClose}>
            Never Mind
          </button>
        </div>

        {lastInstalled && (
          <Link
            href={
              toRoom({
                agentId: "octo",
                question: `Explain the "${lastInstalled.name}" composite — who tops it on my board?`,
              }) as Route
            }
            className="btn-chunky mt-3 inline-block text-sm"
          >
            ask Octo in film room →
          </Link>
        )}
      </div>
    </div>
  );
}
