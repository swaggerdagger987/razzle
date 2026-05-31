"""Gamelog + dynasty-comps OG snapshot exports show FROM PANEL trust sticker (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"

FROM_PANEL_SNAPSHOT_SLUGS = ("gamelog", "dynasty-comps")


def test_player_scoped_from_panel_sticker_set():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "PLAYER_SCOPED_FROM_PANEL_STICKER_SLUGS" in source
    block = source.split("const PLAYER_SCOPED_FROM_PANEL_STICKER_SLUGS", 1)[1].split(");", 1)[0]
    for slug in FROM_PANEL_SNAPSHOT_SLUGS:
        assert f'"{slug}"' in block, f"{slug} must be in PLAYER_SCOPED_FROM_PANEL_STICKER_SLUGS"


def test_from_panel_sticker_on_gamelog_and_dynasty_snapshot_path():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "FROM PANEL · your rows" in source
    assert "PLAYER_SCOPED_FROM_PANEL_STICKER_SLUGS.has(slug)" in source
    assert "isSnapshot &&" in source
    assert "#5b7fff" in source
