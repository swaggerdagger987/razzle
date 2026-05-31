"""Launch-10 OG live extract prefers formula_score when present (Lab L5 parity)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_breakouts_live_extract_prefers_formula_score():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'slug === "breakouts"' in source
    assert "breakoutsStatKeys" in source
    idx = source.index("breakoutsStatKeys")
    block = source[idx : idx + 280]
    assert '"formula_score"' in block
    assert block.index('"formula_score"') < block.index('"rbs_score"')


def test_rankings_live_extract_prefers_formula_score():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'slug === "rankings"' in source
    assert "rankingsStatKeys" in source
    idx = source.index("rankingsStatKeys")
    block = source[idx : idx + 280]
    assert '"formula_score"' in block
    assert block.index('"formula_score"') < block.index('"dynasty_value"')
