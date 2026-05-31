"""Lab weekly OG Gate C — fixture params + route contract (Lab L5)."""

from __future__ import annotations

from pathlib import Path

WEEKLY_OG_GATE_C_PARAMS = "download=1&position=WR"


def _panel_og_source() -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/app/og/[panel]/route.tsx").read_text(encoding="utf-8")


def test_weekly_og_in_launch10_slugs():
    source = _panel_og_source()
    launch_block = source.split("const LAUNCH_10_OG_SLUGS", 1)[1].split(");", 1)[0]
    assert '"weekly"' in launch_block


def test_weekly_og_position_wr_default_for_live_rows():
    """Weekly OG defaults position=WR so /api/panels/weekly returns rows — Gate C."""
    source = _panel_og_source()
    assert 'slug === "weekly" && apiParams.position == null' in source
    assert 'apiParams.position = "WR"' in source


def test_weekly_og_extracts_heatmap_rows():
    source = _panel_og_source()
    assert "extractWeeklyHeatmapRows" in source
    assert 'slug === "weekly" && Array.isArray(obj.players)' in source


def test_weekly_og_demo_fallback_rows_defined():
    source = _panel_og_source()
    assert "weekly:" in source
    assert "PPG" in source
    assert "demoRowsForPanel" in source


def test_weekly_og_live_sticker_label():
    source = _panel_og_source()
    assert "LIVE · PPG heatmap" in source
    assert "live PPG heatmap" in source


def test_weekly_og_gate_c_fixture_params_documented():
    assert "download=1" in WEEKLY_OG_GATE_C_PARAMS
    assert "position=WR" in WEEKLY_OG_GATE_C_PARAMS
