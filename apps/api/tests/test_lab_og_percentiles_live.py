"""Lab percentiles OG — live extract + LIVE sticker (Lab L5 pro profile epic)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_percentiles_og_live_extract_and_sticker():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "extractPercentilesRows" in source
    assert 'slug === "percentiles"' in source
    assert "Array.isArray(obj.percentiles)" in source
    assert 'percentiles: "percentile"' in source
    assert '"percentiles"' in source
    assert "PLAYER_SCOPED_LIVE_STICKER_SLUGS" in source
    assert "LIVE · peer percentiles" in source
    assert "TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS" in source
    assert "percentiles:" in source or '"percentiles"' in source


def test_percentiles_demo_rows_for_factory_gate_c():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "DEMO_ROWS_BY_SLUG" in source
    assert "sample percentile bars" in source
    assert "live peer percentiles" in source
