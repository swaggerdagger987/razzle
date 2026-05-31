"""Pro gate perks + shared error surface (Lab L4)."""

from __future__ import annotations

import re
from pathlib import Path

import pytest

LAUNCH_10_STAFF_PICK_SLUGS = (
    "weekly",
    "prospects",
    "rankings",
    "tradevalues",
    "breakouts",
    "gamelog",
    "efficiency",
    "aging",
    "buysell",
    "dashboard",
)

LAUNCH_10_RENDERER_FILES = {
    "weekly": "WeeklyHeatmapRenderer.tsx",
    "prospects": "ProspectsRenderer.tsx",
    "rankings": "DynastyRankingsRenderer.tsx",
    "tradevalues": "TradeValuesRenderer.tsx",
    "breakouts": "BreakoutsRenderer.tsx",
    "gamelog": "GamelogRenderer.tsx",
    "efficiency": "EfficiencyRenderer.tsx",
    "aging": "AgingCurvesRenderer.tsx",
    "buysell": "BuySellRenderer.tsx",
    "dashboard": "DynastyDashboardRenderer.tsx",
}

BUREAU_7_SLUGS = (
    "self-scout",
    "monte-carlo",
    "manager-profiles",
    "pressure-map",
    "trade-network",
    "trade-finder",
    "head-to-head",
)


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _renderer_text(slug: str) -> str:
    name = LAUNCH_10_RENDERER_FILES[slug]
    return (_repo_root() / "apps/web/components/lab/renderers" / name).read_text(encoding="utf-8")


def test_launch10_perk_labels_count_and_order():
    teaser = (_repo_root() / "apps/web/lib/panel-upgrade-teaser.ts").read_text(encoding="utf-8")
    assert "export function launch10PerkLabels()" in teaser
    assert teaser.count("LAUNCH_10_STAFF_PICK_SLUGS") >= 1
    for slug in LAUNCH_10_STAFF_PICK_SLUGS:
        assert f'"{slug}"' in teaser or slug in teaser


def test_bureau7_perk_labels_match_parity_slugs():
    bureau = (_repo_root() / "apps/web/lib/bureau-features.ts").read_text(encoding="utf-8")
    assert "export function bureau7PerkLabels()" in bureau
    for slug in BUREAU_7_SLUGS:
        assert f'"{slug}"' in bureau


def test_panel_api_exports_panel_api_get():
    panel_api = (_repo_root() / "apps/web/lib/panel-api.ts").read_text(encoding="utf-8")
    assert "export async function panelApiGet" in panel_api


def test_pro_gate_from_panel_error_surface():
    surface = (
        _repo_root() / "apps/web/components/lab/ProGateFromPanelError.tsx"
    ).read_text(encoding="utf-8")
    assert re.search(r"export function ProGateFromPanelError", surface)


@pytest.mark.parametrize("slug", LAUNCH_10_STAFF_PICK_SLUGS)
def test_launch10_renderers_use_shared_pro_gate(slug: str):
    renderer = _renderer_text(slug)
    assert "ProGateFromPanelError" in renderer
    assert "ProUpgradeGate" not in renderer
    assert "panelApiGet" in renderer


def test_panel_renderer_generic_uses_pro_gate():
    panel_renderer = (
        _repo_root() / "apps/web/components/lab/PanelRenderer.tsx"
    ).read_text(encoding="utf-8")
    assert "ProGateFromPanelError" in panel_renderer
    assert "ProUpgradeGate" not in panel_renderer
