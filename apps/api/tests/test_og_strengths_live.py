"""Strengths OG — live percentile extract + player-scoped stickers (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_strengths_live_extract_and_stickers():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "extractStrengthsRows" in source
    assert 'slug === "strengths"' in source
    assert "Array.isArray(obj.strengths)" in source
    assert "PLAYER_SCOPED_LIVE_STICKER_SLUGS" in source
    assert '"strengths"' in source.split("PLAYER_SCOPED_LIVE_STICKER_SLUGS", 1)[1]
    assert "LIVE · top strengths" in source
    assert 'strengths: "percentile"' in source
