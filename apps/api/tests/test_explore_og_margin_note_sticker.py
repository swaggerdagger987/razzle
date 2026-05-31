"""Explore OG — LIVE staff margin note sticker when live rows qualify (Explore L5)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_explore_og_live_staff_margin_sticker():
    route = _repo_root() / "apps/web/app/og/explore/route.tsx"
    text = route.read_text(encoding="utf-8")
    assert "hasStaffMarginNotes" in text
    assert "showLiveStaffSticker" in text
    assert "LIVE · staff margins" in text
    assert "TOP_MARGIN_NOTE_ROWS" in text
    assert "!isDemo && hasStaffMarginNotes" in text
