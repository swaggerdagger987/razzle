"""Pressure Map OG watermark — League hallway deep link + LIVE/SAMPLE stickers (L5 atom 3/4)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_pressure_map_og_watermark_hallway_band():
    path = _repo_root() / "apps/web/app/og/pressure-map/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "Always-on watermark band" in text
    assert "toLeague(" in text
    assert 'background: "#d97757"' in text
    assert "LIVE · Sleeper pressure bars" in text
    assert "SAMPLE · demo pressure preview" in text
    assert "resolveApiOrigin" in text
