"""Explore OG — margin notes on top-3 screener rows (Explore L5 atom 2/4)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_top_three_margin_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "topMarginNotes" in source
    assert ".slice(0, 3)" in source
    assert "i < 3 ? topMarginNotes[i]" in source
    assert "marginNote && marginAgent" in source
