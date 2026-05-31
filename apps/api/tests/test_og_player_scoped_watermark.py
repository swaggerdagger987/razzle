"""Player-scoped Lab OG — hallway deep link in watermark band (Lab L5 atom 3/3)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_player_scoped_og_watermark_uses_hallway_to_lab_and_room():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "toLab" in source
    assert "toRoom" in source
    assert "function labOgWatermarkLink" in source
    assert "fetchPanelPlayerRef" in source
    assert "playerRefFromOgUrl" in source
    assert "continue in Lab" in source
    assert "player: playerRef" in source or "player: playerRef," in source
    assert "razzle.lol${roomPath}" in source


def test_player_scoped_og_terracotta_watermark_band():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'background: "#d97757"' in source
    assert "made with 🐯 razzle.lol" in source
    assert "{labLink}" in source
