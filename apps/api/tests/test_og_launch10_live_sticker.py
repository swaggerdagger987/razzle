"""Launch-10 OG LIVE sticker labels are panel-specific (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"

EXPECTED = {
    "rankings": "LIVE · dynasty values",
    "gamelog": "LIVE · Wk tape",
    "efficiency": "LIVE · PPO board",
    "buysell": "LIVE · buy/sell board",
    "tradevalues": "LIVE · trade values",
    "aging": "LIVE · aging curve",
    "breakouts": "LIVE · breakout board",
    "dashboard": "LIVE · dynasty pulse",
}


def test_launch10_live_sticker_labels_in_route():
    source = ROUTE_TS.read_text(encoding="utf-8")
    for slug, label in EXPECTED.items():
        assert label in source, f"missing LIVE sticker copy for {slug}"


def test_launch10_live_blurb_suffix_in_route():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "live dynasty values" in source
    assert "live Wk tape" in source
    assert "live PPO board" in source
    assert "live buy/sell board" in source
    assert "live trade values" in source
    assert "live aging curve" in source
    assert "live breakout board" in source
    assert "live dynasty pulse" in source
