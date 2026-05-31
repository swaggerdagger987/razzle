"""Waiver Tendencies OG — Hawkeye Room hallway + LIVE/SAMPLE stickers (L5 atom 4/4)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_waiver_tendencies_og_hawkeye_room_band():
    path = _repo_root() / "apps/web/app/og/waiver-tendencies/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "Always-on watermark band" in text
    assert "toLeague(" in text
    assert "toRoom(" in text
    assert 'background: "#d97757"' in text
    assert "LIVE · Sleeper waiver archetypes" in text
    assert "SAMPLE · demo waiver rows" in text
    assert "hawkeyeWaiverRoomQuestion" in text
    assert 'agentId: "hawkeye"' in text
