"""Trade Finder OG Bones Room hallway — League L5 GTM export atom 3/3."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_bones_room_hallway():
    og = _repo_root() / "apps/web/app/og/trade-finder/route.tsx"
    share = _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    og_text = og.read_text(encoding="utf-8")
    share_text = share.read_text(encoding="utf-8")
    assert "toRoom(" in og_text
    assert 'agentId: "bones"' in og_text
    assert 'panelSlug: "trade-finder"' in og_text
    assert "bonesTradeFinderRoomQuestion" in og_text
    assert "ask ${bones.name}" in og_text
    assert "toRoom(" in share_text
    assert "ask Bones about" in share_text
