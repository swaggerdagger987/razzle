"""Lab OG export links default player_id for player-scoped panels (Lab L5)."""

from __future__ import annotations

from pathlib import Path


def _export_link_source() -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/components/lab/LabOgExportLink.tsx").read_text(encoding="utf-8")


def test_player_scoped_export_slugs_match_og_route():
    source = _export_link_source()
    for slug in ("percentiles", "career", "archetypes"):
        assert f'"{slug}"' in source
    assert "resolvedPlayerId" in source
    assert "DEFAULT_LAB_OG_PLAYER_ID" in source
