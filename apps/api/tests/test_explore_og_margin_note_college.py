"""Explore OG — Hawkeye margin notes on college universe rows (Explore L5 atom 4/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"
MARGIN_NOTES = ROOT / "apps/web/lib/margin-notes.ts"


def test_explore_og_college_margin_notes_use_universe():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow(p, universe)" in source
    assert "TOP_MARGIN_NOTE_ROWS" in source
    assert "DEMO_COLLEGE_ROWS" in source


def test_explore_og_college_demo_rows_carry_campus_heuristics():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "passing_yards: 4312" in source
    assert "total_yards: 1420" in source
    assert "rushing_yards: 1924" in source


def test_margin_notes_college_helper_exists():
    source = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "marginNoteForCollegeRow" in source
    assert 'universe === "college"' in source
    assert "target hog on campus" in source


def test_explore_og_college_title_and_school_column():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert 'universe === "college" ? "College Screener"' in source
    assert 'universe === "college" ? "School" : "Team"' in source
