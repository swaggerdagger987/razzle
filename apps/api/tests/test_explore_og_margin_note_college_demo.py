"""Explore OG — college demo rows trigger campus margin notes on lead row (Explore L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"
MARGIN_NOTES = ROOT / "apps/web/lib/margin-notes.ts"


def test_college_demo_lead_row_has_passing_volume_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "DEMO_COLLEGE_ROWS" in source
    assert "Cam Ward" in source
    assert "passing_yards: 4312" in source


def test_explore_og_passes_universe_into_margin_helper():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow(p, universe)" in source
    assert "TOP_MARGIN_NOTE_ROWS" in source


def test_margin_notes_define_college_campus_copy():
    source = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "marginNoteForCollegeRow" in source
    assert "target hog on campus" in source
    assert "volume passer — draft radar" in source


def test_college_demo_subtitle_uses_campus_preview_copy():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert 'universe === "college" ? "campus stats preview"' in source


def test_college_demo_rows_include_receptions_for_target_hog_path():
    """Second demo row (Tre Harris) carries receptions for college margin heuristics."""
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "Tre Harris" in source
    assert "receptions: 88" in source
