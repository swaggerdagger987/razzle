"""Trade Finder OG Bones Room hallway — hero deal deep link on export (L5 atom 3/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_bones_room_hallway_on_hero():
    path = _repo_root() / "apps/web/app/og/trade-finder/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "toRoom" in text
    assert 'agentId: "bones"' in text
    assert "bonesTradeFinderRoomPath" in text
    assert "ask ${bones.name} about ${hero.partner_team}" in text
    assert 'panelSlug: "trade-finder"' in text


def test_trade_finder_sharebar_bones_room_link():
    path = _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    text = path.read_text(encoding="utf-8")
    assert "toRoom" in text
    assert "ask Bones about" in text
    assert "hero_match" in text
