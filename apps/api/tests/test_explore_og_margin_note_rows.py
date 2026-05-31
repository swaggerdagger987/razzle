"""Explore OG — staff margin notes on top-3 screener rows (Explore L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_top_three_rows_use_margin_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "OG_MARGIN_NOTE_ROW_CAP = 3" in source
    assert "i < OG_MARGIN_NOTE_ROW_CAP" in source
    assert "rowMarginNote" in source
    assert "rowAgent.emoji" in source
    assert "marginNoteForOgExploreRow" in source


def test_explore_og_demo_rows_support_multi_row_margin_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "targets: 128" in source
    assert "age: 29" in source
