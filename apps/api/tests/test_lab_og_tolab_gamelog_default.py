"""Gamelog OG watermark keeps toLab deep link for default showcase player (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_gamelog_preserves_default_player_in_tolab():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "preserveDefaultGamelog" in source
    assert 'slug === "gamelog"' in source
    assert "DEFAULT_OG_PLAYER" in source
    assert "Ja'Marr Chase" in source


def test_watermark_band_includes_lab_link_with_id_for_gamelog():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "labOgWatermarkLink(slug" in source
    assert "playerCtx" in source


def test_non_gamelog_still_skips_default_tolab_player():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "opts.playerId !== DEFAULT_OG_PLAYER_ID" in source
