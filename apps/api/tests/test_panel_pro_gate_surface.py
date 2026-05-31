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


def _assert_pro_gate_renderer_slug(slug: str) -> None:
    renderer = (
        _repo_root() / f"apps/web/components/lab/renderers/{slug}Renderer.tsx"
    ).read_text(encoding="utf-8")
    assert "ProGateFromPanelError" in renderer
    assert "ProUpgradeGate" not in renderer


def _assert_pro_gate_renderer_path(path: str) -> None:
    renderer = (_repo_root() / path).read_text(encoding="utf-8")
    assert "ProGateFromPanelError" in renderer
    assert "ProUpgradeGate" not in renderer


def test_pro_gate_from_panel_error_wired_in_breakouts():
    _assert_pro_gate_renderer_slug("Breakouts")


def test_pro_gate_from_panel_error_wired_in_tradevalues_and_efficiency():
    _assert_pro_gate_renderer_slug("TradeValues")
    _assert_pro_gate_renderer_slug("Efficiency")
    surface = (
        _repo_root() / "apps/web/components/lab/ProGateFromPanelError.tsx"
    ).read_text(encoding="utf-8")
    assert re.search(r"export function ProGateFromPanelError", surface)


@pytest.mark.parametrize(
    "path",
    [
        "apps/web/components/lab/renderers/DynastyRankingsRenderer.tsx",
        "apps/web/components/lab/renderers/GamelogRenderer.tsx",
        "apps/web/components/lab/renderers/BuySellRenderer.tsx",
        "apps/web/components/lab/renderers/AgingCurvesRenderer.tsx",
    ],
)
def test_pro_gate_from_panel_error_wired_in_remaining_launch10(path: str):
    _assert_pro_gate_renderer_path(path)


def test_pro_gate_from_panel_error_wired_in_dynasty_comps():
    _assert_pro_gate_renderer_path("apps/web/components/lab/renderers/DynastyCompsRenderer.tsx")


def test_pro_gate_from_panel_error_wired_in_prospects():
    _assert_pro_gate_renderer_path("apps/web/components/lab/renderers/ProspectsRenderer.tsx")
