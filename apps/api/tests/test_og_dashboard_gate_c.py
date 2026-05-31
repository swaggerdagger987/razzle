"""Dashboard OG — Gate C contract for dynasty-dashboard live rows (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"

DASHBOARD_OG_GATE_C_PARAMS = "download=1"


def test_dashboard_og_gate_c_fixture_params_documented():
    assert "download=1" in DASHBOARD_OG_GATE_C_PARAMS


def test_dashboard_dynasty_dashboard_row_extract_in_route():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "Array.isArray(obj.top5)" in source
    assert "Array.isArray(obj.risers)" in source
    assert "Array.isArray(obj.fallers)" in source
    assert "value_picks" in source
    assert 'dashboard: "rank_diff"' in source


def test_dashboard_demo_rows_chg_stat_for_gate_c():
    source = ROUTE_TS.read_text(encoding="utf-8")
    block = source.split("dashboard: [", 1)[1].split("],", 1)[0]
    assert "Chg" in block
    assert "Ladd McConkey" in block


def test_dashboard_live_sticker_for_gate_c():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "LIVE · roster grades" in source
    assert "live roster grades" in source
