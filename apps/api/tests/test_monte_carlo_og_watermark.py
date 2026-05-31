"""Monte Carlo OG — LIVE/SAMPLE stickers + terracotta watermark (League L5 atom 1/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_monte_carlo_og_watermark_hallway_band():
    path = _repo_root() / "apps/web/app/og/monte-carlo/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "Always-on watermark band" in text
    assert "toLeague(" in text
    assert 'background: "#d97757"' in text
    assert "LIVE · Sleeper league sims" in text
    assert "SAMPLE · demo sim rows" in text
    assert "EXPORTED · panel sim rows" in text
    assert "resolveApiOrigin" in text
