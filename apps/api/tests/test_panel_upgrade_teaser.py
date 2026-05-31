"""Launch-10 + generic pro gate teaser coverage (Lab L4 pro gates)."""

from __future__ import annotations

from pathlib import Path

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

BUREAU_7_FEATURE_SLUGS = (
    "self-scout",
    "head-to-head",
    "pressure-map",
    "trade-network",
    "trade-finder",
    "manager-profiles",
    "monte-carlo",
)

# Canonical titles from packages/panels/catalog.ts + apps/web/lib/bureau-features.ts
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
    "Head-to-Head",
    "Pressure Map",
    "Trade Network",
    "Trade Finder",
    "Manager Profiles",
    "Monte Carlo",
)

ROOT = Path(__file__).resolve().parents[3]


def _teaser_source() -> str:
    return (ROOT / "apps/web/lib/panel-upgrade-teaser.ts").read_text(encoding="utf-8")


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


def test_panel_pitch_sharpens_rankings_tradevalues_breakouts():
    source = _teaser_source()
    pitch_checks = {
        "rankings": ("trade-value", "rank movers"),
        "tradevalues": ("buy/sell", "trade deadline"),
        "breakouts": ("RBS", "waiver wire"),
    }
    for slug, needles in pitch_checks.items():
        key = f'{slug}: "'
        start = source.find(key)
        assert start != -1, f"missing pitch for {slug}"
        line = source[start : source.find("\n", start)]
        for needle in needles:
            assert needle in line, f"{slug} pitch missing {needle!r}: {line}"


def test_pro_upgrade_perks_list_launch10_and_bureau7_names():
    teaser = _teaser_source()
    gate = (
        Path(__file__).resolve().parents[3]
        / "apps/web/components/lab/ProUpgradeGate.tsx"
    ).read_text(encoding="utf-8")
    bureau = (
        Path(__file__).resolve().parents[3] / "apps/web/lib/bureau-features.ts"
    ).read_text(encoding="utf-8")
    catalog = (
        Path(__file__).resolve().parents[3] / "packages/panels/catalog.ts"
    ).read_text(encoding="utf-8")

    assert "proUpgradePerkLines" in teaser
    assert "BUREAU_7_FEATURE_SLUGS" in teaser
    assert "getPanel" in teaser
    assert "proUpgradePerkLines" in gate
    assert len(BUREAU_7_FEATURE_SLUGS) == 7
    for slug in BUREAU_7_FEATURE_SLUGS:
        assert f'"{slug}"' in teaser
    for title in LAUNCH_10_PERK_TITLES:
        assert title in catalog, f"catalog missing launch-10 title: {title}"
    for label in BUREAU_7_PERK_LABELS:
        assert label in bureau, f"bureau-features missing label: {label}"
