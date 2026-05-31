"""Explore OG URL params — universe + college sort in export links (Explore L5)."""

from __future__ import annotations

from pathlib import Path


def _read(rel: str) -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / rel).read_text(encoding="utf-8")


def test_build_explore_og_search_params_exports_universe():
    source = _read("apps/web/lib/explore-params.ts")
    assert "buildExploreOgSearchParams" in source
    assert "ogSortForUniverse" in source
    assert 'universe: opts.universe' in source or "universe: opts.universe" in source


def test_explore_share_button_uses_canonical_og_params():
    share = _read("apps/web/components/explore/ExploreShareButton.tsx")
    assert "buildExploreOgSearchParams" in share
    assert "previewParams.toString()" in share
    assert "/og/explore?" in share
    assert "window.location.origin}/explore?" in share
