"""Explore OG — row-2 staff margin note on screener export (Explore L5 atom 2/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_renders_margin_on_first_two_rows():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "i < 2" in source
    assert "marginNoteForOgRow" in source
    assert "rowMarginNote" in source
    assert "rowAgent.emoji" in source


def test_demo_row2_chase_has_target_volume_fields():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "Ja'Marr Chase" in source
    assert "targets: 128" in source


def test_margin_note_helper_still_on_route():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow" in source


def test_lead_demo_row_youth_breakout_unchanged():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "Jayden Daniels" in source
    assert "age: 22" in source
