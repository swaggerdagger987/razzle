"""Explore OG — LIVE staff sticker when top rows carry margin notes (Explore L5 atom 3/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_live_staff_sticker_guard():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "topRowsHaveMarginNotes" in source
    assert "showLiveStaffSticker" in source
    assert "LIVE · staff notes" in source
    assert "!isDemo && topRowsHaveMarginNotes" in source


def test_explore_og_live_sticker_uses_teal_live_palette():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    idx = source.index("showLiveStaffSticker")
    window = source[idx : source.index("LIVE · staff notes", idx) + 20]
    assert "#2ec4b6" in window
