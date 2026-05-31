"""Launch-10 gamelog + efficiency OG LIVE labels and blank player_id trim."""

from __future__ import annotations

from pathlib import Path


def _route_source() -> str:
    return (
        Path(__file__).resolve().parents[3]
        / "apps/web/app/og/[panel]/route.tsx"
    ).read_text(encoding="utf-8")


def test_gamelog_efficiency_live_sticker_labels():
    source = _route_source()
    assert 'if (slug === "gamelog") return "LIVE · week log";' in source
    assert 'if (slug === "efficiency") return "LIVE · efficiency ranks";' in source
    assert 'if (slug === "gamelog") return " · live week log";' in source
    assert 'if (slug === "efficiency") return " · live efficiency ranks";' in source


def test_og_route_trims_blank_player_id():
    source = _route_source()
    assert 'rawPlayerId?.trim() || DEFAULT_OG_PLAYER_ID' in source
