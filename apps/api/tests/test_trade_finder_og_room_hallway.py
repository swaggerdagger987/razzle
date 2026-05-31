"""Trade Finder OG + ShareBar — Bones Room hallway on hero deal (L5 atom 3/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_route_bones_room_path():
    route = (_repo_root() / "apps/web/app/og/trade-finder/route.tsx").read_text(encoding="utf-8")
    assert "toRoom" in route
    assert 'agentId: "bones"' in route
    assert "bonesRoomPath" in route
    assert "trade-finder" in route


def test_trade_finder_share_bar_bones_room_link():
    share = (
        _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    ).read_text(encoding="utf-8")
    assert "toRoom" in share
    assert 'agentId: "bones"' in share
    assert "ask Bones about" in share
