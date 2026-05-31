"""Lab dashboard OG — live extract mirrors DynastyDashboardRenderer snapshot rows."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_dashboard_live_extract_function_present():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "extractDashboardRows" in source
    assert 'slug === "dashboard"' in source
    idx = source.index("function extractDashboardRows")
    block = source[idx : idx + 1400]
    assert "trade_value" in block
    assert "rank_diff" in block
    assert '"Value"' in block
    assert '"Chg"' in block


def test_dashboard_extract_called_before_generic_top5_merge():
    source = ROUTE_TS.read_text(encoding="utf-8")
    dash_idx = source.index('if (slug === "dashboard")')
    top5_idx = source.index("Array.isArray(obj.top5)")
    assert dash_idx < top5_idx
