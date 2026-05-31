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
    assert "watermarkPlayerId !== DEFAULT_OG_PLAYER_ID || includeDefaultPlayer" in source


def test_snapshot_export_player_id_in_watermark():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "snapshotPlayerId" in source
    assert "exportPlayerId" in source
    assert "exportPlayerId: snapshotExportPlayerId" in source.replace("\n", " ") or "snapshotExportPlayerId" in source


def test_lab_og_export_link_encodes_snapshot_player_id():
    link_ts = ROOT / "apps/web/components/lab/LabOgExportLink.tsx"
    source = link_ts.read_text(encoding="utf-8")
    assert "encodeOgSnapshot(snapshotRows, {" in source
    assert "OgSnapshotEncodeContext" in source
    assert '"pi": playerId' in source or "pi: playerId" in source


def test_weekly_og_watermark_includes_default_wr_position():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "TOLAB_DEFAULT_POSITION" in source
    assert 'weekly: "WR"' in source
    assert "watermarkPosition" in source
    assert "positionFilter: watermarkPosition" in source
