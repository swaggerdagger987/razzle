"""Bureau Monte Carlo OG watermark uses typed toLeague + user query (League L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/monte-carlo/route.tsx"


def test_monte_carlo_og_imports_toleague():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'from "@razzle/hallway"' in source
    assert "toLeague" in source


def test_monte_carlo_og_watermark_helper_preserves_user_param():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "function monteCarloOgWatermarkLink" in source
    assert 'toLeague(league, "monte-carlo")' in source
    assert "URLSearchParams({ user })" in source
    assert "monteCarloOgWatermarkLink(league, user)" in source


def test_monte_carlo_og_watermark_band_unchanged():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "Always-on watermark band" in source
    assert 'background: "#d97757"' in source
