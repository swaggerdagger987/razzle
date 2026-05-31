"""Pressure Map OG watermark — League hallway + LIVE/SAMPLE stickers (L5)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_pressure_map_og_terracotta_watermark_band():
    path = _repo_root() / "apps/web/app/og/pressure-map/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "toLeague(" in text
    assert 'background: "#d97757"' in text
    assert "LIVE · trade pressure board" in text
    assert "leagueDeepLink" in text
