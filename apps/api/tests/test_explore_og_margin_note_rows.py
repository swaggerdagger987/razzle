"""Explore OG — staff margin notes on top-3 screener rows (Explore L5 atom 2/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_top_three_margin_notes_constant():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "TOP_MARGIN_NOTE_ROWS = 3" in source
    assert "i < TOP_MARGIN_NOTE_ROWS" in source


def test_explore_og_per_row_margin_note_in_map():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "rowMarginNote" in source
    assert "marginNoteForOgExploreRow(p, universe)" in source
    assert "rowAgent.emoji" in source
    assert "leadMarginNote" not in source


def test_explore_og_demo_top_three_have_margin_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "Jayden Daniels" in source
    assert "Ja'Marr Chase" in source
    assert "targets: 128" in source
    assert "Bijan Robinson" in source
    assert "age: 21" in source


def test_explore_og_demo_college_top_rows_have_stats():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "passing_yards: 4312" in source
    assert "rushing_yards: 1924" in source
