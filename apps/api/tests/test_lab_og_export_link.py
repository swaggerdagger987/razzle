"""Lab OG export link — player-scoped default player_id in export URL."""

from __future__ import annotations

from pathlib import Path


def _export_link_source() -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/components/lab/LabOgExportLink.tsx").read_text(encoding="utf-8")


def test_player_scoped_slugs_default_player_id_in_export_url():
    source = _export_link_source()
    assert "PLAYER_SCOPED_OG_SLUGS" in source
    assert "DEFAULT_LAB_OG_PLAYER_ID" in source
    assert 'params.set("player_id", resolvedPlayerId)' in source
    assert '"gamelog"' in source and '"dynasty-comps"' in source


def test_gamelog_empty_state_passes_snapshot_to_export_link():
    renderer = (
        Path(__file__).resolve().parents[3]
        / "apps/web/components/lab/renderers/GamelogRenderer.tsx"
    ).read_text(encoding="utf-8")
    assert "sampleGamelogQ" in renderer
    assert "sampleOgSnapshotRows" in renderer
    assert "snapshotRows={sampleOgSnapshotRows.length ? sampleOgSnapshotRows : undefined}" in renderer


def test_efficiency_empty_state_shows_export_sample_link():
    renderer = (
        Path(__file__).resolve().parents[3]
        / "apps/web/components/lab/renderers/EfficiencyRenderer.tsx"
    ).read_text(encoding="utf-8")
    assert "!efficient.length && !volume.length" in renderer
    assert 'label="export sample card"' in renderer
    assert "LabOgExportLink" in renderer


def test_default_lab_og_player_matches_og_route():
    route = (
        Path(__file__).resolve().parents[3]
        / "apps/web/app/og/[panel]/route.tsx"
    ).read_text(encoding="utf-8")
    link = _export_link_source()
    assert 'DEFAULT_OG_PLAYER_ID = "00-0036900"' in route
    assert 'DEFAULT_LAB_OG_PLAYER_ID = "00-0036900"' in link
