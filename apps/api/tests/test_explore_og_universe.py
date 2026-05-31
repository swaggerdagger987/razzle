"""Explore OG export must preserve NFL vs college universe (Explore L5)."""

from __future__ import annotations

from pathlib import Path


def _root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_explore_share_button_passes_universe_to_og_urls():
    source = (_root() / "apps/web/components/explore/ExploreShareButton.tsx").read_text(
        encoding="utf-8"
    )
    assert "universe" in source
    assert "new URLSearchParams({ universe, sort, dir })" in source
    assert 'href={`/og/explore?${ogParams.toString()}`}' in source


def test_explore_og_route_reads_universe_query():
    source = (_root() / "apps/web/app/og/explore/route.tsx").read_text(encoding="utf-8")
    assert 'url.searchParams.get("universe")' in source
    assert "College Screener" in source
    assert "universe: params.universe" in source


def test_explore_og_route_shows_live_sticker_when_rows():
    source = (_root() / "apps/web/app/og/explore/route.tsx").read_text(encoding="utf-8")
    assert "LIVE" in source
    assert "players.length" in source
