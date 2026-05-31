"""Waiver Tendencies OG watermark — League L5 GTM export atom 1/3."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_waiver_tendencies_og_watermark_hallway_band():
    path = _repo_root() / "apps/web/app/og/waiver-tendencies/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "Always-on watermark band" in text
    assert "toLeague(" in text
    assert 'background: "#d97757"' in text
    assert "LIVE · Sleeper wire archetypes" in text
    assert "SAMPLE · demo waiver rows" in text
    assert "resolveApiOrigin" in text
