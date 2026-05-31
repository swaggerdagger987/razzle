"""Bureau Waiver Tendencies OG watermark — League L5 terracotta band (atom 1/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_bureau_waiver_og_watermark_hallway_band():
    path = _repo_root() / "apps/web/app/og/waiver-tendencies/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "Always-on watermark band" in text
    assert 'background: "#d97757"' in text
    assert "waiver-tendencies" in text
    assert "made with 🐯 razzle.lol" in text
    assert "watch ${heroTeam}" in text
