"""Explore OG — college universe margin notes on export (Explore L5 atom 4/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_college_demo_margin_sticker_guard():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "hasCollegeDemoMarginNotes" in source
    assert 'universe === "college"' in source
    assert "SAMPLE · campus margin notes" in source


def test_explore_og_college_demo_rows_trigger_campus_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "passing_yards: 4312" in source
    assert "total_yards: 1420" in source
    assert "rushing_yards: 1924" in source


def test_explore_og_college_margin_uses_universe_in_map():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow(p, universe)" in source
