"""Power Rankings OG watermark — League hallway deep link + LIVE/SAMPLE stickers (L5 atom 3/4)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_power_rankings_og_watermark_hallway_band():
    path = _repo_root() / "apps/web/app/og/power-rankings/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "Always-on watermark band" in text
    assert "toLeague(" in text
    assert 'background: "#d97757"' in text
    assert "LIVE · Sleeper power rankings" in text
    assert "SAMPLE · demo ranking rows" in text
    assert "resolveApiOrigin" in text
