"""Explore OG — LIVE staff sticker when margin notes on live rows (Explore L5 atom 3/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_staff_live_sticker_helper():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "exploreOgShowsStaffMarginNotes" in source
    assert "if (isDemo) return false" in source
    assert "marginNoteForOgExploreRow(p, universe)" in source


def test_explore_og_live_staff_sticker_badge():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "showStaffLiveSticker" in source
    assert "LIVE · staff notes" in source
    assert "#2ec4b6" in source
