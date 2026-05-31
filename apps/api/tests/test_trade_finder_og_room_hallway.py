"""Trade Finder OG — Bones Room hallway on hero deal (League L5 GTM)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE = ROOT / "apps/web/app/og/trade-finder/route.tsx"


def test_trade_finder_og_bones_room_hallway_on_hero():
    source = ROUTE.read_text(encoding="utf-8")
    assert "toRoom" in source
    assert 'agentId: "bones"' in source
    assert "bonesTradeFinderRoomQuestion" in source
    assert 'panelSlug: "trade-finder"' in source
    assert "bonesRoomPath" in source
    assert "ask ${bones.name}" in source
