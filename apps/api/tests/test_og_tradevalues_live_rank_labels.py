"""Trade Values OG live rows use rank · Value statLabel (Lab L5 — matches TradeValuesRenderer)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_extract_tradevalues_rows_function_exists():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "function extractTradeValuesRows" in source
    assert 'if (slug === "tradevalues")' in source
    assert "statLabel: `${i + 1} · Value`" in source or "statLabel: `${rank} · Value`" in source


def test_tradevalues_live_blurb_unchanged():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "live trade values" in source
    assert "LIVE · trade values" in source
