"""Explore OG — margin notes on top-3 screener rows (Explore L5 atom 2/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_top_three_margin_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "topMarginNotes" in source
    assert ".slice(0, 3)" in source
    assert "i < 3 ? topMarginNotes[i]" in source
    assert "rowMarginNote && rowMarginAgent" in source


def test_explore_og_demo_rows_two_and_three_trigger_margin_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "targets: 128" in source
    assert "age: 29" in source


def test_explore_og_no_longer_lead_only_margin_gate():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "leadMarginNote" not in source
    assert "leadAgent" not in source
