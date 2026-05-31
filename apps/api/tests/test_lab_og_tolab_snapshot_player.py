"""Snapshot Lab OG exports preserve player_id in toLab watermark (Lab L5 hallway)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_snapshot_player_in_tolab_watermark():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "snapshotPlayer" in source
    assert "opts.isSnapshot" in source
    assert "isSnapshot," in source.split("labOgWatermarkLink(slug", 1)[1]


def test_snapshot_watermark_adds_from_panel_hallway_query():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'path = `${path}${sep}from=panel`;' in source
    assert "if (opts.isSnapshot)" in source
