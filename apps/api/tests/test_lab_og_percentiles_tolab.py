"""Lab percentiles OG — toLab default player hallway (Lab L5 pro profile epic)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PRO_GATE = ROOT / "apps/web/components/lab/ProUpgradeGate.tsx"
PANEL_RENDERER = ROOT / "apps/web/components/lab/PanelRenderer.tsx"
OG_ROUTE = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_percentiles_in_tolab_include_default_player_slugs():
    source = OG_ROUTE.read_text(encoding="utf-8")
    assert '"percentiles"' in source
    assert "TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS" in source


def test_pro_upgrade_gate_percentiles_export_player():
    source = PRO_GATE.read_text(encoding="utf-8")
    assert '"percentiles"' in source
    assert "playerName={ogPlayerName}" in source
    assert "DEFAULT_LAB_OG_PLAYER_NAME" in source


def test_percentiles_panel_renderer_export_footer():
    source = PANEL_RENDERER.read_text(encoding="utf-8")
    assert "PercentilesPanelRenderer" in source
    assert 'slug="percentiles"' in source
    assert "playerName={DEFAULT_LAB_OG_PLAYER_NAME}" in source
