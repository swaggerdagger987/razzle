"""Trade Finder OG — Bones Room hallway link on hero deal (League L5 atom 3/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_hero_bones_room_path():
    route = _repo_root() / "apps/web/app/og/trade-finder/route.tsx"
    text = route.read_text(encoding="utf-8")
    assert 'from "@razzle/hallway"' in text
    assert "toRoom" in text
    assert "bonesRoomPath" in text
    assert 'agentId: "bones"' in text
    assert 'panelSlug: "trade-finder"' in text
    assert "hero.give.player_id" in text
    assert "ask ${bones.name}" in text
