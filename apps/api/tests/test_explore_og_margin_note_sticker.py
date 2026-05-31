"""Explore OG — LIVE staff margin sticker when live rows carry notes (Explore L5 atom 3/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_live_staff_margin_sticker_constant():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert 'LIVE_STAFF_MARGIN_STICKER = "LIVE · staff margin notes"' in source
    assert "showLiveStaffSticker" in source


def test_explore_og_sticker_only_when_live_rows_have_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "topRowsHaveStaffMarginNotes" in source
    assert "!isDemo && topRowsHaveStaffMarginNotes" in source
    assert "marginNoteForOgExploreRow(p, universe)" in source


def test_explore_og_sticker_uses_caveat_teal_band():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert 'fontFamily: "Caveat"' in source
    assert 'background: "#2ec4b6"' in source
    assert "LIVE_STAFF_MARGIN_STICKER" in source
