"""Lab career OG — live season arc extract + LIVE sticker (Lab L5 pro profile epic)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_career_og_live_extract_and_sticker():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "extractCareerRows" in source
    assert 'slug === "career"' in source
    assert "Array.isArray(obj.seasons)" in source
    assert 'career: "ppg"' in source
    assert '"career"' in source
    assert "PLAYER_SCOPED_LIVE_STICKER_SLUGS" in source
    assert "LIVE · career arc" in source
    assert "TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS" in source


def test_career_demo_rows_for_factory_gate_c():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "DEMO_ROWS_BY_SLUG" in source
    assert "sample season arc" in source
    assert "live season arc" in source
