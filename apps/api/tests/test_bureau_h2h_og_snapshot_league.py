"""Bureau H2H OG snapshot embeds league context for watermark deep links (League L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SNAPSHOT_TS = ROOT / "apps/web/lib/bureau-h2h-og-snapshot.ts"
ROUTE_TS = ROOT / "apps/web/app/og/head-to-head/route.tsx"
SHAREBAR_TS = ROOT / "apps/web/components/league/BureauH2HShareBar.tsx"


def test_h2h_snapshot_codec_embeds_league_context():
    source = SNAPSHOT_TS.read_text(encoding="utf-8")
    assert "lg?: string" in source
    assert "leagueContext" in source
    assert "encodeBureauH2HOgSnapshot(" in source
    assert "leagueContext?: BureauH2HOgLeagueContext" in source


def test_h2h_og_route_restores_league_from_snapshot():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "decodedSnapshot?.leagueContext" in source
    assert "snapshotLeague.leagueId" in source


def test_h2h_sharebar_passes_league_into_encode():
    source = SHAREBAR_TS.read_text(encoding="utf-8")
    assert "encodeBureauH2HOgSnapshot(snapshot, {" in source
    assert "leagueId," in source
