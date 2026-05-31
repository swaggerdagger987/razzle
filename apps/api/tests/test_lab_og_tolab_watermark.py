"""Lab Launch-10 OG watermark uses typed toLab hallway path (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"
EXPORT_TS = ROOT / "apps/web/components/lab/LabOgExportLink.tsx"


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
    source = EXPORT_TS.read_text(encoding="utf-8")
    assert "encodeOgSnapshot(snapshotRows, resolvedPlayerId)" in source
    assert "exportPlayerId?: string" in source
    assert '{ r: compact, pid }' in source or "pid }" in source


def test_watermark_uses_player_display_name_from_export_url():
    route = ROUTE_TS.read_text(encoding="utf-8")
    export = EXPORT_TS.read_text(encoding="utf-8")
    gamelog = (ROOT / "apps/web/components/lab/renderers/GamelogRenderer.tsx").read_text(
        encoding="utf-8",
    )
    assert "playerDisplayName" in route
    assert "DEFAULT_OG_PLAYER_NAME" in route
    assert 'params.set("name"' in export
    assert "playerName={displayName}" in gamelog


def test_weekly_og_watermark_includes_default_wr_position():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "TOLAB_DEFAULT_POSITION" in source
    assert 'weekly: "WR"' in source
    assert "watermarkPosition" in source
    assert "positionFilter: watermarkPosition" in source


def test_efficiency_og_watermark_includes_default_rb_position():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'efficiency: "RB"' in source
    assert "TOLAB_DEFAULT_POSITION[slug]" in source


def test_aging_og_watermark_includes_default_rb_position():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'aging: "RB"' in source
    assert "TOLAB_DEFAULT_POSITION[slug]" in source


def test_percentiles_og_watermark_includes_default_player_tolab():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert '"percentiles"' in source
    idx = source.index("TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS")
    block = source[idx : idx + 200]
    assert '"percentiles"' in block
    export = EXPORT_TS.read_text(encoding="utf-8")
    assert '"percentiles"' in export


def test_breakouts_og_watermark_includes_default_wr_position():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'breakouts: "WR"' in source


def test_rankings_og_has_no_tolab_default_position():
    """Dynasty rankings board is cross-position when unfiltered — no watermark default."""
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "rankings:" not in source.split("TOLAB_DEFAULT_POSITION")[1].split("};")[0]
