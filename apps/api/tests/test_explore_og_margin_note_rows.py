"""Explore OG — staff margin notes on top-3 screener rows (Explore L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_top_three_rows_use_margin_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow" in source
    assert "rowMarginNote" in source
    assert "rowAgent.emoji" in source
    assert "i < 3" in source


def test_explore_og_demo_row_two_has_target_volume_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "targets: 128" in source
    assert "Ja'Marr Chase" in source
