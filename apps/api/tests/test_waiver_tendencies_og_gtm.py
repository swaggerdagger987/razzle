"""Waiver Tendencies OG — LIVE/SAMPLE + hallway watermark (League L5 atom 1/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_waiver_tendencies_og_gtm_watermark_and_stickers():
    path = _repo_root() / "apps/web/app/og/waiver-tendencies/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "toLeague(" in text
    assert "toRoom(" in text
    assert "hawkeyeWaiverRoomQuestion" in text
    assert "LIVE · Sleeper waiver wire" in text
    assert "SAMPLE · demo waiver archetypes" in text
    assert 'background: "#d97757"' in text
    assert "resolveApiOrigin" in text
