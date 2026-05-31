"""Explore OG — college universe Hawkeye margin notes on export (Explore L5 atom 4/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"
MARGIN_NOTES = ROOT / "apps/web/lib/margin-notes.ts"


def test_margin_notes_exports_college_row_helper():
    source = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "marginNoteForCollegeRow" in source
    assert "target hog on campus" in source
    assert "volume passer — draft radar" in source
    assert "workhorse back" in source


def test_explore_og_college_margin_uses_universe_param():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow(p, universe)" in source
    assert "DEMO_COLLEGE_ROWS" in source


def test_explore_og_college_demo_top_three_trigger_hawkeye_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "passing_yards: 4312" in source
    assert "total_yards: 1420" in source
    assert "rushing_yards: 1924" in source


def test_explore_og_college_demo_subtitle_mentions_campus_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "Hawkeye campus notes" in source
    assert 'universe === "college"' in source
