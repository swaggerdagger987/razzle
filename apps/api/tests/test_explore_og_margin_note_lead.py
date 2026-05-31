"""Explore OG — staff margin notes on screener export rows (Explore L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"
MARGIN_NOTES = ROOT / "apps/web/lib/margin-notes.ts"


def test_explore_og_imports_margin_note_helper():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow" in source
    assert "topMarginNotes" in source
    assert "TOP_MARGIN_NOTE_ROWS" in source
    assert "rowAgent.emoji" in source


def test_margin_notes_exports_og_explore_helper():
    source = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow" in source
    assert "OgExploreMarginRow" in source


def test_explore_og_demo_nfl_top_rows_have_margin_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "Jayden Daniels" in source
    assert "age: 22" in source
    assert "fantasy_points_ppr: 312.4" in source
    assert "targets: 128" in source
    assert "Bijan Robinson" in source
    assert "age: 21" in source


def test_explore_og_fetch_passes_margin_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "player_id:" in source
    assert "targets:" in source
    assert "passing_yards:" in source


def test_explore_og_margin_notes_limited_to_top_three():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "TOP_MARGIN_NOTE_ROWS" in source
    assert ".slice(0, TOP_MARGIN_NOTE_ROWS)" in source
    assert "i < TOP_MARGIN_NOTE_ROWS ? topMarginNotes[i]" in source


def test_explore_og_live_staff_sticker_when_margins_on_live_rows():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "hasStaffMarginNotes" in source
    assert "showLiveStaffSticker" in source
    assert "!isDemo && hasStaffMarginNotes" in source
    assert "LIVE · staff margins" in source
