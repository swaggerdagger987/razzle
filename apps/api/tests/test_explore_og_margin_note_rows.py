"""Explore OG — staff margin notes on top-3 screener rows (Explore L5 atom 2/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_margin_notes_top_three_rows():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "MARGIN_NOTE_ROW_LIMIT = 3" in source
    assert "marginNotesByIndex" in source
    assert "marginNoteForOgExploreRow(row, universe)" in source


def test_explore_og_demo_rows_support_top_three_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "targets: 128" in source
    assert "Ja'Marr Chase" in source
    assert "Bijan Robinson" in source
    assert "age: 22" in source


def test_explore_og_renders_margin_note_per_row_not_lead_only():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "i < MARGIN_NOTE_ROW_LIMIT ? marginNotesByIndex[i]" in source
    assert "leadMarginNote" not in source
