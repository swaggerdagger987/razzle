"""Dynasty Comps OG — LIVE sticker + comp row extract (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_dynasty_comps_live_sticker_and_extract_in_route():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "PLAYER_SCOPED_LIVE_STICKER_SLUGS" in source
    assert '"dynasty-comps"' in source.split("PLAYER_SCOPED_LIVE_STICKER_SLUGS", 1)[1]
    assert "LIVE · comp matches" in source
    assert "extractDynastyCompsRows" in source
    assert 'slug === "dynasty-comps" && Array.isArray(obj.comps)' in source
    assert '"dynasty-comps": "similarity"' in source
    assert "live comp matches" in source


def test_player_scoped_live_sticker_not_duplicated_for_launch10_gamelog():
    source = ROUTE_TS.read_text(encoding="utf-8")
    block = source.split("const PLAYER_SCOPED_LIVE_STICKER_SLUGS", 1)[1].split(");", 1)[0]
    assert '"gamelog"' not in block
