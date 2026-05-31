"""Explore OG — top-3 staff margin notes on screener export (Explore L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_top_three_margin_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "TOP_MARGIN_NOTE_ROWS = 3" in source
    assert "topMarginNotes" in source
    assert "i < TOP_MARGIN_NOTE_ROWS && topMarginNotes[i]" in source


def test_explore_og_demo_rows_two_and_three_have_margin_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "targets: 128" in source
    assert "fantasy_points_ppr: 298.1" in source
    assert "age: 30" in source


def test_explore_og_still_uses_margin_helper():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow" in source
    assert "AGENT_BY_ID[topMarginNotes[i]!.agentId].emoji" in source
