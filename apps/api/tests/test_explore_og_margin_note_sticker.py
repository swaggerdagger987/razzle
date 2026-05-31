"""Explore OG — LIVE staff sticker when top rows carry margin notes (Explore L5 atom 3/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_live_staff_sticker_constant():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "EXPLORE_OG_LIVE_STAFF_STICKER" in source
    assert "LIVE · staff notes" in source


def test_explore_og_has_staff_margin_notes_helper():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "exploreOgHasStaffMarginNotes" in source
    assert "showLiveStaffSticker" in source
    assert "!isDemo && exploreOgHasStaffMarginNotes" in source


def test_explore_og_live_sticker_not_on_demo_path():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "SAMPLE · not live data" in source
    assert "!isDemo && exploreOgHasStaffMarginNotes(players, universe)" in source
    assert "showLiveStaffSticker ?" in source


def test_explore_og_live_subtitle_blurb_when_sticker():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "Hawkeye/Dolphin staff on top rows" in source
