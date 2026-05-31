"""Lab percentiles OG — toLab default player hallway (Lab L5 pro profile epic atom 4/4)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"
GATE_TS = ROOT / "apps/web/components/lab/ProUpgradeGate.tsx"
RENDERER_TS = ROOT / "apps/web/components/lab/renderers/PercentilesRenderer.tsx"
PANEL_TS = ROOT / "apps/web/components/lab/PanelRenderer.tsx"


def test_percentiles_in_tolab_default_player_slugs():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert '"percentiles"' in source
    assert "TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS" in source
    assert 'percentiles: "WR"' in source


def test_pro_gate_percentiles_export_passes_player_and_position():
    source = GATE_TS.read_text(encoding="utf-8")
    assert '"percentiles"' in source
    assert "DEFAULT_OG_PLAYER_NAME" in source
    assert 'panelSlug === "percentiles"' in source
    assert 'position={panelSlug === "percentiles" ? "WR"' in source.replace("\n", " ")


def test_percentiles_renderer_wires_export_link():
    renderer = RENDERER_TS.read_text(encoding="utf-8")
    panel = PANEL_TS.read_text(encoding="utf-8")
    assert "PercentilesRenderer" in renderer
    assert 'slug="percentiles"' in renderer
    assert "playerName={displayName}" in renderer
    assert 'panel.slug === "percentiles"' in panel
