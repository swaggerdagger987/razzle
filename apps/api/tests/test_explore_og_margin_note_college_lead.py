"""Explore OG — college lead-row campus margin note (Explore L5 atom 3/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"
MARGIN_NOTES = ROOT / "apps/web/lib/margin-notes.ts"


def test_explore_og_college_demo_lead_has_volume_passer_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "DEMO_COLLEGE_ROWS" in source
    assert "Cam Ward" in source
    assert "passing_yards: 4312" in source


def test_margin_notes_college_volume_passer_rule():
    source = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "volume passer — draft radar" in source
    assert "marginNoteForCollegeRow" in source


def test_explore_og_renders_margin_on_college_lead_via_row_helper():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow" in source
    assert "i < 2" in source
    assert "universe === \"college\"" in source


def test_college_campus_subtitle_on_demo():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "campus stats preview" in source
