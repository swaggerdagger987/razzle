"""College explore OG Gate C — demo rows + fixture params when screener empty."""

from __future__ import annotations

from pathlib import Path


def _explore_og_source() -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/app/og/explore/route.tsx").read_text(encoding="utf-8")


def test_explore_og_college_demo_rows_defined():
    source = _explore_og_source()
    assert "DEMO_COLLEGE_ROWS" in source
    assert "demoRowsForExplore" in source
    assert "Cam Ward" in source


def test_explore_og_college_demo_fallback_when_empty():
    source = _explore_og_source()
    assert "livePlayers.length === 0" in source
    assert 'universe === "college" ? DEMO_COLLEGE_ROWS' in source


def test_explore_og_college_fixture_force_demo_param():
    source = _explore_og_source()
    assert 'get("force_demo") === "1"' in source
    assert "campus stats preview" in source
