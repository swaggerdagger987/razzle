"""Trade Finder OG — Bones Room hallway on hero deal (League L5 atom 3/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_bones_room_hallway_on_hero():
    route = _repo_root() / "apps/web/app/og/trade-finder/route.tsx"
    text = route.read_text(encoding="utf-8")
    assert 'toRoom({' in text
    assert 'agentId: "bones"' in text
    assert "panelSlug: \"trade-finder\"" in text
    assert "bonesRoomPath" in text
    assert "ask ${bones.name} about" in text
