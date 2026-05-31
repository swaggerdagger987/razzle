"""Explore OG — college universe margin notes on top-3 rows (Explore L5 atom 4/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"
MARGIN_NOTES = ROOT / "apps/web/lib/margin-notes.ts"


def test_explore_og_college_demo_rows_carry_margin_stats():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "DEMO_COLLEGE_ROWS" in source
    assert "Cam Ward" in source
    assert "passing_yards: 4312" in source
    assert "total_yards: 1420" in source
    assert "rushing_yards: 1924" in source


def test_explore_og_college_margin_notes_use_universe():
    og = EXPLORE_OG.read_text(encoding="utf-8")
    assert 'universe === "college" ? "College Screener"' in og
    assert "marginNoteForOgExploreRow(p, universe)" in og
    margin = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "marginNoteForCollegeRow" in margin
    assert 'universe === "college"' in margin


def test_explore_og_college_campus_preview_copy():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "campus stats preview" in source
    assert 'universe === "college" ? DEMO_COLLEGE_ROWS' in source
