"""Launch-10 OG snapshot exports show FROM PANEL trust sticker (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"

# Snapshot export panels — Gate C evidence targets.
SNAPSHOT_FROM_PANEL_SLUGS = ("rankings", "weekly", "gamelog")


def test_from_panel_sticker_on_snapshot_path():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "FROM PANEL · your rows" in source
    assert "FROM PANEL · Wk tape" in source
    assert "showsFromPanelSticker" in source
    assert "PLAYER_SCOPED_SNAPSHOT_FROM_PANEL_SLUGS" in source


def test_from_panel_sticker_covers_rankings_and_weekly():
    source = ROUTE_TS.read_text(encoding="utf-8")
    launch_block = source.split("const LAUNCH_10_OG_SLUGS", 1)[1].split(");", 1)[0]
    for slug in ("rankings", "weekly"):
        assert f'"{slug}"' in launch_block, f"{slug} must be in LAUNCH_10_OG_SLUGS"
    assert "from your panel" in source
    assert "#5b7fff" in source, "FROM PANEL sticker uses trust blue"


def test_gamelog_player_scoped_snapshot_from_panel():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert '"gamelog"' in source.split("PLAYER_SCOPED_SNAPSHOT_FROM_PANEL_SLUGS", 1)[1].split(")", 1)[0]
    assert 'if (slug === "gamelog") return "FROM PANEL · Wk tape"' in source
