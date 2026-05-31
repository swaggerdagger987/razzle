"""Explore OG export URL contract — universe + college sort in toolbar links."""

from __future__ import annotations

import re
from pathlib import Path


def _source() -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/lib/explore-og-export-params.ts").read_text(encoding="utf-8")


def test_export_helper_exists():
    assert "buildExploreOgExportParams" in _source()
    assert "ogSortKeyForExport" in _source()


def test_share_button_uses_export_helper():
    root = Path(__file__).resolve().parents[3]
    share = (root / "apps/web/components/explore/ExploreShareButton.tsx").read_text(
        encoding="utf-8"
    )
    assert "buildExploreOgExportParams" in share
    assert "new URLSearchParams({ universe" not in share


def test_college_export_params_include_universe_and_yards_sort():
    """Contract: college OG URLs must carry universe=college and yards sort key."""
    root = Path(__file__).resolve().parents[3]
    lib = (root / "apps/web/lib/explore-og-export-params.ts").read_text(encoding="utf-8")
    assert 'universe === "college"' in lib
    assert "total_yards" in lib
    assert "fantasy_points_ppr" in lib


def test_explore_page_passes_universe_to_share():
    root = Path(__file__).resolve().parents[3]
    page = (root / "apps/web/components/explore/ExplorePageClient.tsx").read_text(
        encoding="utf-8"
    )
    assert re.search(r"universe=\{universe\}", page)
