"""Explore OG — LIVE staff sticker when rows carry margin notes (Explore L5 atom 3/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_staff_live_sticker_when_margin_notes():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "LIVE · staff notes" in source
    assert "hasMarginNotes" in source
    assert "showStaffLiveSticker" in source
    assert "hasMarginNotes && !isDemo" in source


def test_explore_og_staff_sticker_uses_caveat_teal_band():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "showStaffLiveSticker" in source
    assert 'fontFamily: "Caveat"' in source
    assert "#2ec4b6" in source
