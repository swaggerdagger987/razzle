"""Explore OG — college demo rows carry staff margin notes (Explore L5 atom 4/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"
MARGIN_NOTES = ROOT / "apps/web/lib/margin-notes.ts"


def test_college_demo_rows_include_margin_stat_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "DEMO_COLLEGE_ROWS" in source
    assert "passing_yards: 4312" in source
    assert "receptions: 92" in source
    assert "rushing_yards: 1924" in source


def test_margin_notes_has_college_rules():
    source = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "marginNoteForCollegeRow" in source
    assert "target hog on campus" in source
