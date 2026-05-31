"""Bureau Strength of Schedule OG watermark — League L5 terracotta band (atom 2/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_bureau_sos_og_watermark_hallway_band():
    path = _repo_root() / "apps/web/app/og/strength-of-schedule/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "Always-on watermark band" in text
    assert 'background: "#d97757"' in text
    assert "strength-of-schedule" in text
    assert "made with 🐯 razzle.lol" in text
