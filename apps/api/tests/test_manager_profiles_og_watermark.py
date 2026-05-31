"""Manager Profiles OG export — terracotta watermark band (League L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/manager-profiles/route.tsx"
SHARE_BAR_TS = ROOT / "apps/web/components/league/BureauManagerProfilesShareBar.tsx"


def test_manager_profiles_og_watermark_band():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'from "@razzle/hallway"' in source
    assert "toLeague(league, \"manager-profiles\")" in source
    assert "background: \"#d97757\"" in source
    assert "made with 🐯 razzle.lol" in source


def test_manager_profiles_share_bar_mirrors_build_profiles():
    source = SHARE_BAR_TS.read_text(encoding="utf-8")
    assert "BureauManagerProfilesShareBar" in source
    assert "/og/manager-profiles?" in source
    assert "copy profiles link" in source
