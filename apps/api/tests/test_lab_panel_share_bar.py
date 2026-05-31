"""Lab panel share bar — GTM copy/preview/export contract."""

from __future__ import annotations

from pathlib import Path


def _read(rel: str) -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / rel).read_text(encoding="utf-8")


def test_lab_panel_share_bar_has_copy_preview_export():
    source = _read("apps/web/components/lab/LabPanelShareBar.tsx")
    assert "copy panel link" in source or "copyLabel" in source
    assert "preview card" in source
    assert "export card" in source
    assert "encodeOgSnapshot" in source
    assert "toLab" in source


def test_dynasty_rankings_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/DynastyRankingsRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy rankings link" in renderer
    assert "snapshotRows={ogSnapshotRows}" in renderer
