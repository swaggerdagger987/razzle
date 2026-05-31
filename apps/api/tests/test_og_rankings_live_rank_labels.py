"""Rankings OG live rows use #rank statLabel (Lab L5 — matches DynastyRankingsRenderer)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_extract_rankings_rows_function_exists():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "function extractRankingsRows" in source
    assert 'if (slug === "rankings")' in source
    assert "statLabel: `#${i + 1}`" in source or "statLabel: `#${rank}`" in source


def test_rankings_live_blurb_unchanged():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "live dynasty values" in source
    assert "LIVE · dynasty values" in source
