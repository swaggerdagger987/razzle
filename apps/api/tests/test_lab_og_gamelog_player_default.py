"""Gamelog OG must default nflverse player_id when export URL omits or blanks query."""

from __future__ import annotations

from pathlib import Path


def _root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_og_panel_route_defaults_blank_player_id():
    source = (_root() / "apps/web/app/og/[panel]/route.tsx").read_text(encoding="utf-8")
    assert "DEFAULT_OG_PLAYER_ID" in source
    assert 'rawPlayerId?.trim() || DEFAULT_OG_PLAYER_ID' in source
    assert '"00-0036900"' in source


def test_gamelog_og_passes_player_id_to_api_params():
    source = (_root() / "apps/web/app/og/[panel]/route.tsx").read_text(encoding="utf-8")
    assert '"gamelog"' in source
    assert "PLAYER_SCOPED_SLUGS" in source
    assert "apiParams.player_id = playerId" in source


def test_gamelog_renderer_export_uses_default_lab_player():
    source = (_root() / "apps/web/components/lab/renderers/GamelogRenderer.tsx").read_text(
        encoding="utf-8",
    )
    assert "DEFAULT_LAB_OG_PLAYER_ID" in source
    assert "LabOgExportLink" in source
