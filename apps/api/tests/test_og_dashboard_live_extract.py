"""Dashboard OG live extract mirrors DynastyDashboardRenderer Value/Chg rows."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_dashboard_live_extract_mirrors_renderer():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "extractDashboardRows" in source
    assert 'slug === "dashboard"' in source
    idx = source.index("function extractDashboardRows")
    block = source[idx : idx + 1800]
    assert "top5" in block
    assert "rank_diff" in block
    assert '"Value"' in block
    assert '"Chg"' in block
    assert "value_picks" in block
