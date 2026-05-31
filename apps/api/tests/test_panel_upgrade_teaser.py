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


def test_pro_upgrade_perks_cover_launch10_and_bureau():
    from pathlib import Path

    source = _teaser_source()
    assert "PRO_UPGRADE_PERKS" in source
    assert "weekly" in source and "dashboard" in source
    assert "self-scout" in source and "Monte Carlo" in source
    root = Path(__file__).resolve().parents[3]
    gate = (root / "apps/web/components/lab/ProUpgradeGate.tsx").read_text(encoding="utf-8")
    assert "PRO_UPGRADE_PERKS" in gate
