"use client";

import { toRoom } from "@razzle/hallway";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import {
  FORMULA_STAT_OPTIONS,
  MAX_FORMULAS,
  type FormulaComponent,
  type SavedFormula,
  loadFormulas,
  saveFormulas,
} from "@/lib/formulas";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (formulas: SavedFormula[]) => void;
}

export function FormulaBuilder({ open, onClose, onSaved }: Props) {
  const [saved, setSaved] = useState<SavedFormula[]>([]);
  const [name, setName] = useState("");
  const [components, setComponents] = useState<FormulaComponent[]>([
    { stat: "fantasy_points_ppr", weight: 1 },
  ]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setSaved(loadFormulas());
  }, [open]);

  if (!open) return null;

  function addRow() {
    setComponents((prev) => [...prev, { stat: "targets", weight: 0.5 }]);
  }

  function removeRow(index: number) {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("name your composite first");
      return;
    }
    if (components.length === 0) {
      setError("add at least one stat");
      return;
    }
    const isEdit = saved.some((f) => f.name === trimmed);
    if (!isEdit && saved.length >= MAX_FORMULAS) {
      setError(`free tier: ${MAX_FORMULAS} formulas max — delete one first`);
      return;
    }
    const next = saved.filter((f) => f.name !== trimmed);
    next.push({ name: trimmed, components: [...components] });
    saveFormulas(next);
    setSaved(next);
    onSaved(next);
    setName("");
    setComponents([{ stat: "fantasy_points_ppr", weight: 1 }]);
    setError("");
  }

  function handleDelete(formulaName: string) {
    const next = saved.filter((f) => f.name !== formulaName);
    saveFormulas(next);
    setSaved(next);
    onSaved(next);
  }

  const latest = saved[saved.length - 1];

  return (
    <div
      className="filter-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="formula-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="filter-modal" style={{ width: 440 }} onClick={(e) => e.stopPropagation()}>
        <h3 id="formula-title">Custom Formula</h3>
        <p className="text-ink-light mb-3 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
          blend stats into a weighted composite — the screener is forever free
        </p>
        <div className="filter-modal-row mb-2">
          <input
            type="text"
            className="input-chunky flex-1"
            placeholder="formula name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Formula name"
          />
        </div>
        {components.map((row, i) => (
          <div key={i} className="filter-modal-row mb-2 gap-2">
            <select
              className="input-chunky flex-1"
              value={row.stat}
              onChange={(e) =>
                setComponents((prev) =>
                  prev.map((c, j) => (j === i ? { ...c, stat: e.target.value } : c)),
                )
              }
              aria-label={`Stat ${i + 1}`}
            >
              {FORMULA_STAT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.1"
              className="input-chunky w-20"
              value={row.weight}
              onChange={(e) =>
                setComponents((prev) =>
                  prev.map((c, j) =>
                    j === i ? { ...c, weight: parseFloat(e.target.value) || 0 } : c,
                  ),
                )
              }
              aria-label={`Weight ${i + 1}`}
            />
            {components.length > 1 && (
              <button type="button" className="btn-chunky text-xs" onClick={() => removeRow(i)}>
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-filter-btn mb-3" onClick={addRow}>
          + add stat
        </button>
        {error && <p className="text-red mb-2 text-sm">{error}</p>}
        <div className="filter-modal-actions">
          <button type="button" className="btn-chunky" onClick={onClose}>
            Never Mind
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save Formula
          </button>
        </div>
        {saved.length > 0 && (
          <div className="mt-4 border-t-2 border-dashed border-ink-faint pt-3">
            <p className="text-ink-light mb-2 text-xs uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              saved ({saved.length}/{MAX_FORMULAS})
            </p>
            {saved.map((f) => (
              <div key={f.name} className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-bold">{f.name}</span>
                <button
                  type="button"
                  className="btn-chunky text-xs"
                  onClick={() => handleDelete(f.name)}
                >
                  delete
                </button>
              </div>
            ))}
            {latest && (
              <Link
                href={
                  toRoom({
                    agentId: "octo",
                    question: `Explain my "${latest.name}" composite — who tops it and why?`,
                  }) as Route
                }
                className="btn-chunky mt-2 inline-block text-sm"
              >
                ask Octo in film room →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
