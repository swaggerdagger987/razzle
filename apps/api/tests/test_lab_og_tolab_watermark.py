"""Lab Launch-10 OG watermark uses typed toLab hallway path (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_panel_og_imports_tolab():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'from "@razzle/hallway"' in source
    assert "toLab" in source


def test_lab_og_watermark_helper_preserves_position_and_player():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "function labOgWatermarkLink" in source
    assert "toLab(" in source
    assert "position=${encodeURIComponent(opts.positionFilter)}" in source
    assert "PLAYER_SCOPED_SLUGS.has(slug)" in source
    assert "{labLink}" in source


def test_default_og_player_tolab_rules():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "DEFAULT_OG_PLAYER_ID" in source
    assert "TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS" in source
    assert '"gamelog"' in source
    assert '"dynasty-comps"' in source
    assert "includeDefaultPlayer" in source
    assert "opts.playerId !== DEFAULT_OG_PLAYER_ID || includeDefaultPlayer" in source


def test_snapshot_payload_preserves_player_for_tolab():
    route = ROUTE_TS.read_text(encoding="utf-8")
    link_ts = (ROOT / "apps/web/components/lab/LabOgExportLink.tsx").read_text(encoding="utf-8")
    assert "snapshotPlayerId" in route
    assert "watermarkPlayerId" in route
    assert "DecodedOgSnapshot" in route
    assert '{ r: compact, p: pid }' in link_ts or "{ r: compact, p: pid }" in link_ts
    assert "encodeOgSnapshot(snapshotRows, resolvedPlayerId)" in link_ts
