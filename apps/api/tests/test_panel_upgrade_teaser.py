"""Launch-10 + generic pro gate teaser coverage (Lab L4)."""

from __future__ import annotations

# Mirrors apps/web/lib/panel-upgrade-teaser.ts LAUNCH_10_* exports.
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

LAUNCH_10_PRO_GATE_SLUGS = (
    "rankings",
    "tradevalues",
    "breakouts",
    "gamelog",
    "efficiency",
    "aging",
    "buysell",
)

GENERIC_PRO_GATE_SLUGS = (
    "tiers",
    "vorp",
    "stocks",
    "waivers",
    "dynasty-comps",
)


def _teaser_source() -> str:
    from pathlib import Path

    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/lib/panel-upgrade-teaser.ts").read_text(encoding="utf-8")


def _slug_has_custom_teaser(source: str, slug: str) -> bool:
    key = f'"{slug}"' if "-" in slug else slug
    rows_block = f"{key}:"
    pitch_block = f'{key}: "' if "-" not in slug else f'"{slug}": "'
    return rows_block in source and pitch_block in source


def test_launch10_staff_picks_have_custom_teasers():
    source = _teaser_source()
    missing = [s for s in LAUNCH_10_STAFF_PICK_SLUGS if not _slug_has_custom_teaser(source, s)]
    assert not missing, f"launch-10 staff picks missing teaser rows+pitch: {missing}"


def test_launch10_pro_gate_slugs_have_custom_teasers():
    source = _teaser_source()
    missing = [s for s in LAUNCH_10_PRO_GATE_SLUGS if not _slug_has_custom_teaser(source, s)]
    assert not missing, f"launch-10 pro gate slugs missing teaser: {missing}"


def test_generic_pro_gate_slugs_have_custom_teasers():
    source = _teaser_source()
    missing = [s for s in GENERIC_PRO_GATE_SLUGS if not _slug_has_custom_teaser(source, s)]
    assert not missing, f"generic pro gate slugs missing teaser: {missing}"


LAUNCH_10_PERK_TITLES = (
    "Weekly Heatmap",
    "Big Board",
    "Dynasty Rankings",
    "Trade Values",
    "Breakouts",
    "Game Log",
    "Efficiency",
    "Aging Curves",
    "Buy / Sell",
    "Dashboard",
)

BUREAU_7_PERK_LABELS = (
    "Self-Scout",
    "Monte Carlo",
    "Manager Profiles",
    "Pressure Map",
    "Trade Network",
    "Trade Finder",
    "Head-to-Head",
)


def _pro_gate_source() -> str:
    from pathlib import Path

    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/components/lab/ProUpgradeGate.tsx").read_text(encoding="utf-8")


def _bureau_source() -> str:
    from pathlib import Path

    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/lib/bureau-features.ts").read_text(encoding="utf-8")


def test_pro_gate_wires_launch10_and_bureau7_perk_helpers():
    gate = _pro_gate_source()
    assert "launch10PerkLabels" in gate
    assert "bureau7PerkLabels" in gate
    assert "10 launch Lab panels" in gate
    assert "7 Bureau behavioral tabs" in gate


def test_pro_gate_perks_list_launch10_parity_titles():
    """Titles come from @razzle/panels via launch10PerkLabels — guard catalog parity."""
    from pathlib import Path

    root = Path(__file__).resolve().parents[3]
    catalog = (root / "packages/panels/catalog.ts").read_text(encoding="utf-8")
    missing = [t for t in LAUNCH_10_PERK_TITLES if f'title: "{t}"' not in catalog]
    assert not missing, f"catalog missing launch-10 perk titles: {missing}"
    assert "launch10PerkLabels" in _teaser_source()


def test_pro_gate_perks_list_bureau7_labels():
    bureau = _bureau_source()
    assert "BUREAU_7_SLUGS" in bureau
    assert "bureau7PerkLabels" in bureau
    missing = [label for label in BUREAU_7_PERK_LABELS if f'label: "{label}"' not in bureau]
    assert not missing, f"bureau-features missing Bureau-7 labels: {missing}"


def test_launch_panel_pitches_are_screenshot_native():
    """Lab L4 atom — sharpened copy on rankings, tradevalues, breakouts."""
    source = _teaser_source()
    assert "before the thread does" in source
    assert "before your league posts the screenshot" in source
    assert "beat the waiver wire" in source
