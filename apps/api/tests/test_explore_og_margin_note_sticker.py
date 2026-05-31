"""Explore OG — LIVE staff sticker when top rows carry margin notes (Explore L5 atom 3/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_staff_margin_notes_detection():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "hasStaffMarginNotes" in source
    assert "showStaffLiveSticker" in source
    assert "!isDemo && hasStaffMarginNotes" in source


def test_explore_og_live_staff_sticker_badge():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "LIVE · staff notes" in source
    assert "showStaffLiveSticker" in source
    assert "#2ec4b6" in source


def test_explore_og_sticker_uses_top_margin_row_window():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "slice(0, TOP_MARGIN_NOTE_ROWS)" in source
