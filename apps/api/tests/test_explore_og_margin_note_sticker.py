"""Explore OG — LIVE/STAFF margin sticker when rows carry staff notes (Explore L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_staff_margin_sticker_guards():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "hasStaffMarginNotes" in source
    assert "showLiveStaffSticker" in source
    assert "showDemoStaffSticker" in source
    assert "!isDemo && hasStaffMarginNotes" in source


def test_explore_og_live_staff_sticker_copy():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "LIVE · staff margin notes" in source
    assert "STAFF · margin notes" in source


def test_explore_og_sticker_uses_caveat_trust_style():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert 'fontFamily: "Caveat"' in source
    assert "background: \"#2ec4b6\"" in source
