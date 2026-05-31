"""Bureau H2H OG watermark uses typed toLeague hallway path (League L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/head-to-head/route.tsx"


def test_h2h_og_imports_toleague():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'from "@razzle/hallway"' in source
    assert "toLeague" in source


def test_h2h_og_watermark_helper_preserves_rivalry_params():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "function h2hOgWatermarkLink" in source
    assert 'toLeague(league, "head-to-head")' in source
    assert 'q.set("opponent", opponent)' in source
    assert "h2hOgWatermarkLink(league, user, opponent)" in source


def test_h2h_og_watermark_band_unchanged():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "Always-on watermark band" in source
    assert 'background: "#d97757"' in source
