"""Explore OG — staff margin stickers (Explore L5 atom 3/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_OG = ROOT / "apps/web/app/og/explore/route.tsx"


def test_explore_og_live_staff_margin_sticker():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "hasStaffMarginNotes" in source
    assert "LIVE · staff margin notes" in source


def test_explore_og_margin_rows_render_staff_sticker():
    source = EXPLORE_OG.read_text(encoding="utf-8")
    assert "STAFF" in source
    assert "rotate(-4deg)" in source
    assert "rowMarginNote && rowAgent" in source
