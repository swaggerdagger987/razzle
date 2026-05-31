"""Explore OG — lead-row staff margin note on screener export (Explore L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"
MARGIN_NOTES = ROOT / "apps/web/lib/margin-notes.ts"


def test_explore_og_imports_margin_note_helper():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow" in source
    assert "topMarginNotes" in source
    assert "noteAgent.emoji" in source


def test_margin_notes_exports_og_explore_helper():
    source = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow" in source
    assert "OgExploreMarginRow" in source


def test_explore_og_demo_nfl_lead_row_has_youth_breakout_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "Jayden Daniels" in source
    assert "age: 22" in source
    assert "fantasy_points_ppr: 312.4" in source


def test_explore_og_fetch_passes_margin_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "player_id:" in source
    assert "targets:" in source
    assert "passing_yards:" in source
