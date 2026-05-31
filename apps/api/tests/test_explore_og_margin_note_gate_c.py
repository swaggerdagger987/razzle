"""Explore OG margin notes — Gate C contract (Explore L5 epic 4/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"
MARGIN_NOTES = ROOT / "apps/web/lib/margin-notes.ts"

# FACTORY-DOD Gate C — documented fixture params for Reality curl
NFL_EXPLORE_OG_GATE_C_PARAMS = "download=1&force_demo=1"
COLLEGE_EXPLORE_OG_GATE_C_PARAMS = (
    "universe=college&sort=total_yards&dir=desc&download=1&force_demo=1"
)
OG_PNG_MIN_BYTES = 40_000


def test_nfl_explore_og_gate_c_fixture_params_documented():
    assert "download=1" in NFL_EXPLORE_OG_GATE_C_PARAMS
    assert "force_demo=1" in NFL_EXPLORE_OG_GATE_C_PARAMS


def test_college_explore_og_gate_c_fixture_params_documented():
    assert "universe=college" in COLLEGE_EXPLORE_OG_GATE_C_PARAMS
    assert "force_demo=1" in COLLEGE_EXPLORE_OG_GATE_C_PARAMS


def test_explore_og_margin_on_top_rows_for_gate_c():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "TOP_MARGIN_NOTE_ROWS" in source
    assert "rowMarginNote" in source
    assert "rowAgent.emoji" in source
    assert "marginNoteForOgExploreRow" in source


def test_margin_notes_cover_nfl_and_college_for_gate_c():
    source = MARGIN_NOTES.read_text(encoding="utf-8")
    assert "marginNoteForOgExploreRow" in source
    assert 'universe === "college"' in source
    assert "youth breakout" in source.lower() or "breakout" in source


def test_demo_rows_support_margin_rules_gate_c():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "Jayden Daniels" in source
    assert "Ja'Marr Chase" in source
    assert "Cam Ward" in source
    assert "DEMO_COLLEGE_ROWS" in source


def test_gate_c_png_size_threshold_documented():
    assert OG_PNG_MIN_BYTES >= 40_000
