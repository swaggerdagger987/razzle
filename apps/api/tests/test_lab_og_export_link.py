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


def test_weekly_empty_board_exports_sample_card():
    renderer = (
        Path(__file__).resolve().parents[3]
        / "apps/web/components/lab/renderers/WeeklyHeatmapRenderer.tsx"
    ).read_text(encoding="utf-8")
    assert "WEEKLY_SAMPLE_OG_ROWS" in renderer
    assert 'label="export sample card"' in renderer
    assert "snapshotRows={WEEKLY_SAMPLE_OG_ROWS}" in renderer
    assert "!players.length" in renderer


def test_efficiency_empty_board_exports_sample_card():
    renderer = (
        Path(__file__).resolve().parents[3]
        / "apps/web/components/lab/renderers/EfficiencyRenderer.tsx"
    ).read_text(encoding="utf-8")
    assert "EFFICIENCY_SAMPLE_OG_ROWS" in renderer
    assert 'label="export sample card"' in renderer
    assert "snapshotRows={EFFICIENCY_SAMPLE_OG_ROWS}" in renderer


def test_prospects_empty_board_exports_sample_card():
    renderer = (
        Path(__file__).resolve().parents[3]
        / "apps/web/components/lab/renderers/ProspectsRenderer.tsx"
    ).read_text(encoding="utf-8")
    assert "PROSPECTS_SAMPLE_OG_ROWS" in renderer
    assert 'label="export sample card"' in renderer
    assert "snapshotRows={PROSPECTS_SAMPLE_OG_ROWS}" in renderer
    assert "!prospects.length" in renderer


def test_breakouts_empty_board_exports_sample_card():
    renderer = (
        Path(__file__).resolve().parents[3]
        / "apps/web/components/lab/renderers/BreakoutsRenderer.tsx"
    ).read_text(encoding="utf-8")
    assert "BREAKOUTS_SAMPLE_OG_ROWS" in renderer
    assert 'label="export sample card"' in renderer
    assert "snapshotRows={BREAKOUTS_SAMPLE_OG_ROWS}" in renderer
    assert "!candidates.length" in renderer


def test_aging_empty_curve_exports_sample_card():
    renderer = (
        Path(__file__).resolve().parents[3]
        / "apps/web/components/lab/renderers/AgingCurvesRenderer.tsx"
    ).read_text(encoding="utf-8")
    assert "AGING_SAMPLE_OG_ROWS" in renderer
    assert 'label="export sample card"' in renderer
    assert "snapshotRows={AGING_SAMPLE_OG_ROWS}" in renderer
    assert "!posData?.curve?.length" in renderer


def test_rankings_empty_filter_exports_sample_card():
    renderer = (
        Path(__file__).resolve().parents[3]
        / "apps/web/components/lab/renderers/DynastyRankingsRenderer.tsx"
    ).read_text(encoding="utf-8")
    assert "RANKINGS_SAMPLE_OG_ROWS" in renderer
    assert "isEmptyBoard" in renderer
    assert "snapshotRows={RANKINGS_SAMPLE_OG_ROWS}" in renderer
    assert 'label="export sample card"' in renderer


def test_default_lab_og_player_matches_og_route():
    route = (
        Path(__file__).resolve().parents[3]
        / "apps/web/app/og/[panel]/route.tsx"
    ).read_text(encoding="utf-8")
    link = _export_link_source()
    assert 'DEFAULT_OG_PLAYER_ID = "00-0036900"' in route
    assert 'DEFAULT_LAB_OG_PLAYER_ID = "00-0036900"' in link
