"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadFormulas, type SavedFormula } from "@/lib/formulas";

interface Props {
  selected: SavedFormula | null;
  onSelect: (formula: SavedFormula | null) => void;
  panelSlug: string;
}

export function FormulaPanelBar({ selected, onSelect, panelSlug }: Props) {
  const [formulas, setFormulas] = useState<SavedFormula[]>([]);

  useEffect(() => {
    setFormulas(loadFormulas());
  }, []);

  if (!formulas.length) {
    return (
      <p className="text-ink-medium mb-4 text-sm" style={{ fontFamily: "var(--font-hand)" }}>
        Build a composite in the{" "}
        <Link href="/explore" className="text-orange underline">
          screener
        </Link>{" "}
        or import from the formula store — then sort this panel by your weights.
      </p>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <label
        htmlFor={`formula-sort-${panelSlug}`}
        className="text-ink-medium text-xs uppercase tracking-wide"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Sort by composite
      </label>
      <select
        id={`formula-sort-${panelSlug}`}
        className="input-chunky text-sm"
        value={selected?.name ?? ""}
        onChange={(e) => {
          const name = e.target.value;
          onSelect(formulas.find((f) => f.name === name) ?? null);
        }}
      >
        <option value="">Panel default</option>
        {formulas.map((f) => (
          <option key={f.name} value={f.name}>
            {f.name}
          </option>
        ))}
      </select>
      <Link href="/explore" className="text-xs text-orange underline">
        edit in screener →
      </Link>
    </div>
  );
}
