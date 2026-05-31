"""Explore OG — top-3 staff margin notes on screener export (Explore L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_top_three_margin_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "topMarginNotes" in source
    assert ".slice(0, 3)" in source
    assert "i < 3 ? topMarginNotes[i]" in source
    assert "leadMarginNote" not in source


def test_explore_og_demo_rows_support_multiple_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "targets: 128" in source
    assert "age: 22" in source
