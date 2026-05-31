"""Trade Finder OG — Bones Room hallway on hero deal (League L5 atom 3/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_bones_room_hallway():
    route = _repo_root() / "apps/web/app/og/trade-finder/route.tsx"
    share = _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    route_text = route.read_text(encoding="utf-8")
    share_text = share.read_text(encoding="utf-8")
    assert "toRoom" in route_text
    assert 'agentId: "bones"' in route_text
    assert "panelSlug: \"trade-finder\"" in route_text
    assert "bonesRoomPath" in route_text
    assert "bones.name" in route_text
    assert "toRoom" in share_text
    assert "ask Bones about" in share_text
