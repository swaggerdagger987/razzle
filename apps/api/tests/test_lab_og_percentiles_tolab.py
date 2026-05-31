"""Percentiles OG watermark keeps DEFAULT_OG_PLAYER_ID in toLab (Lab L5 T6)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_percentiles_in_tolab_default_player_slugs():
    source = ROUTE_TS.read_text(encoding="utf-8")
    block = source.split("TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS")[1].split(");")[0]
    assert '"percentiles"' in block


def test_percentiles_player_scoped_for_watermark():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert '"percentiles"' in source.split("PLAYER_SCOPED_SLUGS")[1]
    assert "labOgWatermarkLink" in source
