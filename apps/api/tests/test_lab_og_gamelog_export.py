"""Lab OG export URL contract — player-scoped panels always carry player_id."""

from __future__ import annotations

from pathlib import Path


def _lib_source() -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/lib/lab-og-export-params.ts").read_text(encoding="utf-8")


def test_resolve_helper_and_gamelog_in_scoped_set():
    lib = _lib_source()
    assert "resolveLabOgPlayerId" in lib
    assert "buildLabOgExportParams" in lib
    assert '"gamelog"' in lib
    assert "DEFAULT_LAB_OG_PLAYER_ID" in lib


def test_lab_og_export_link_uses_builder():
    root = Path(__file__).resolve().parents[3]
    link = (root / "apps/web/components/lab/LabOgExportLink.tsx").read_text(encoding="utf-8")
    assert "buildLabOgExportParams" in link
    assert 'new URLSearchParams({ download: "1" })' not in link


def test_gamelog_empty_state_offers_export():
    root = Path(__file__).resolve().parents[3]
    renderer = (root / "apps/web/components/lab/renderers/GamelogRenderer.tsx").read_text(
        encoding="utf-8"
    )
    assert "export sample card" in renderer
    assert 'slug="gamelog"' in renderer
