"""Explore L5 — in-product Staff column uses same margin path as OG lead row."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_MARGIN_NOTE = ROOT / "apps/web/components/explore/ExploreMarginNote.tsx"
EXPLORE_TABLE = ROOT / "apps/web/components/explore/ExploreTable.tsx"
MARGIN_NOTES = ROOT / "apps/web/lib/margin-notes.ts"
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_margin_note_uses_og_shared_helper():
    source = EXPLORE_MARGIN_NOTE.read_text(encoding="utf-8")
    assert 'import { marginNoteForOgExploreRow } from "@/lib/margin-notes"' in source
    assert "marginNoteForOgExploreRow(" in source


def test_og_lead_row_uses_same_helper():
    og = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow(p, universe)" in og
    assert "TOP_MARGIN_NOTE_ROWS" in og


def test_margin_notes_og_helper_delegates_to_row_heuristics():
    source = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "return marginNoteForRow(asRow, universe)" in source


def test_explore_table_staff_column_wires_margin_note():
    source = EXPLORE_TABLE.read_text(encoding="utf-8")
    assert 'id: "staff_note"' in source
    assert "ExploreMarginNote" in source


def test_nfl_and_college_margin_copy_defined_once():
    source = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "youth breakout tape" in source
    assert "volume passer — draft radar" in source
