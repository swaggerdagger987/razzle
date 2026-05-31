"""Lab OG export links default player_id for player-scoped panels (Lab L5)."""

from __future__ import annotations

from pathlib import Path


def _export_link_source() -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/components/lab/LabOgExportLink.tsx").read_text(encoding="utf-8")


def test_gamelog_export_defaults_player_id_when_omitted():
    source = _export_link_source()
    assert "PLAYER_SCOPED_OG_SLUGS" in source
    assert '"gamelog"' in source
    assert '"percentiles"' in source
    assert "DEFAULT_LAB_OG_PLAYER_ID" in source
    assert "resolvedPlayerId" in source
    assert 'params.set("player_id", resolvedPlayerId)' in source
