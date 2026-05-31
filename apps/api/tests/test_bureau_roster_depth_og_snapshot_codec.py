"""Contract tests for Bureau Roster Depth OG snapshot codec + route wiring."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
LIB_TS = ROOT / "apps/web/lib/bureau-roster-depth-og-snapshot.ts"
SHARE_BAR = ROOT / "apps/web/components/league/BureauRosterDepthShareBar.tsx"
ROUTE_TS = ROOT / "apps/web/app/og/roster-depth/route.tsx"


def test_roster_depth_snapshot_lib_exports_codec():
    source = LIB_TS.read_text(encoding="utf-8")
    assert "encodeBureauRosterDepthOgSnapshot" in source
    assert "decodeBureauRosterDepthOgSnapshot" in source


def test_share_bar_encodes_snapshot_from_depth():
    source = SHARE_BAR.read_text(encoding="utf-8")
    assert "rosterDepthSnapshotFromBureau" in source


def test_og_route_decodes_snapshot_param():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "decodeBureauRosterDepthOgSnapshot" in source
    assert "from your depth chart" in source
