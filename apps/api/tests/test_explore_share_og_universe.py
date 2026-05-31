"""Explore share toolbar must pass universe into OG preview + export URLs (Explore L5)."""

from __future__ import annotations

from pathlib import Path


def _explore_share_source() -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/components/explore/ExploreShareButton.tsx").read_text(
        encoding="utf-8"
    )


def test_explore_share_og_params_include_universe():
    source = _explore_share_source()
    assert 'new URLSearchParams({ sort, dir })' in source
    assert 'universe === "college"' in source
    assert 'previewParams.set("universe", "college")' in source
    assert "/og/explore?" in source
    assert 'ogParams.set("download", "1")' in source


def test_explore_share_nfl_omits_redundant_universe_param():
    source = _explore_share_source()
    assert "new URLSearchParams({ universe, sort, dir })" not in source


def test_explore_share_college_export_filename():
    source = _explore_share_source()
    assert 'universe === "college"' in source
    assert "razzle-college-screener.png" in source
    assert "razzle-explore.png" in source
