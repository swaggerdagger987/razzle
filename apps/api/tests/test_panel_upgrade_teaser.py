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

GENERIC_CATALOG_PRO_GATE_SLUGS = ("tiers", "vorp", "stocks", "waivers")

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


def test_generic_catalog_pro_gate_slugs_exported_in_teaser():
    source = _teaser_source()
    assert "export const GENERIC_CATALOG_PRO_GATE_SLUGS" in source
    assert "isGenericCatalogProGateSlug" in source
    for slug in GENERIC_CATALOG_PRO_GATE_SLUGS:
        assert f'"{slug}"' in source


def test_generic_catalog_pro_gate_slugs_have_unique_teaser_details():
    source = _teaser_source()
    markers = {
        "tiers": ("Tier S", "dynasty tiers with value scores"),
        "vorp": ("VORP", "value-over-replacement"),
        "stocks": ("Stock", "rank deltas"),
        "waivers": ("FAAB", "snap share"),
    }
    pitch_block = source.split("const PITCH_BY_SLUG", 1)[1]
    for slug in GENERIC_CATALOG_PRO_GATE_SLUGS:
        assert _slug_has_custom_teaser(source, slug), f"catalog slug missing teaser: {slug}"
        rows_block = source.split(f"{slug}:", 1)[1].split("\n  ],", 1)[0]
        row_marker, pitch_marker = markers[slug]
        assert row_marker in rows_block, f"{slug} missing batch-1 domain rows"
        assert "Ja'Marr Chase" not in rows_block, f"{slug} still on default teaser rows"
        assert pitch_marker in pitch_block, f"{slug} missing batch-1 pitch copy"


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
    assert "teaserRowsToOgSnapshot" in teaser
    assert "LabOgExportLink" in gate
    assert "export sample card" in gate
    assert len(BUREAU_7_FEATURE_SLUGS) == 7
    for slug in BUREAU_7_FEATURE_SLUGS:
        assert f'"{slug}"' in teaser
    for title in LAUNCH_10_PERK_TITLES:
        assert title in catalog, f"catalog missing launch-10 title: {title}"
    for label in BUREAU_7_PERK_LABELS:
        assert label in bureau, f"bureau-features missing label: {label}"
