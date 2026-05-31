"""Lab career-compare OG — multi-player overlay rows + LIVE sticker (Lab L5 pro profile epic)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_career_compare_og_live_extract_and_sticker():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "extractCareerCompareRow" in source
    assert "fetchCareerCompareOgRows" in source
    assert 'slug === "career-compare"' in source
    assert "DEFAULT_CAREER_COMPARE_PLAYER_IDS" in source
    assert '["p1", "p2", "p3"]' in source
    assert '"career-compare"' in source
    assert "PLAYER_SCOPED_LIVE_STICKER_SLUGS" in source
    assert "LIVE · overlay arcs" in source
    assert '"career-compare": "ppg"' in source


def test_career_compare_demo_rows_for_factory_gate_c():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "DEMO_ROWS_BY_SLUG" in source
    assert "sample overlay arcs" in source
    assert "live overlay arcs" in source
    assert "Peak PPG" in source
