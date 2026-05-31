"""Explore OG — LIVE staff sticker when top rows carry margin notes (Explore L5 atom 3/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_staff_margin_notes_flag():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "hasStaffMarginNotes" in source
    assert "marginNoteForOgExploreRow(p, universe)" in source


def test_explore_og_live_staff_sticker_when_margin_notes_and_not_demo():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "LIVE · staff margin notes" in source
    assert "hasStaffMarginNotes && !isDemo" in source


def test_explore_og_live_sticker_uses_teal_cavec_style():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert 'background: "#2ec4b6"' in source
    assert 'fontFamily: "Caveat"' in source
