"""Explore OG export must preserve universe/college from the screener URL (Lab L5 / Explore L5)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]


def test_explore_share_passes_universe_to_og_routes() -> None:
    share = (ROOT / "apps/web/components/explore/ExploreShareButton.tsx").read_text(
        encoding="utf-8",
    )
    og = (ROOT / "apps/web/app/og/explore/route.tsx").read_text(encoding="utf-8")
    assert "universe" in share and "previewParams" in share
    assert "ogParams" in share
    assert "/og/explore?" in share
    assert 'searchParams.get("universe")' in og
    assert "college" in og
