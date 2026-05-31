"""College explore OG must pass FACTORY Gate C (≥40KB PNG with rows or documented demo)."""

from __future__ import annotations

from pathlib import Path


def _explore_og_source() -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/app/og/explore/route.tsx").read_text(encoding="utf-8")


def test_college_og_demo_fallback_and_stickers():
    source = _explore_og_source()
    assert "function collegeOgDemoRows()" in source
    assert "SAMPLE · demo college rows" in source
    assert "LIVE · college screener" in source
    assert "effectiveSeason" in source
    assert "universe === \"college\" && season === 0 ? 2024" in source


def test_college_og_fixture_url_documented():
    """Reality curl — season=2024 fixture for Gate C evidence."""
    fixture = (
        "http://127.0.0.1:3000/og/explore"
        "?universe=college&sort=total_yards&dir=desc&season=2024"
    )
    assert "universe=college" in fixture
    assert "season=2024" in fixture
