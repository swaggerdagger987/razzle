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


def test_launch_panel_pitches_are_screenshot_native():
    """Lab L4 atom — sharpened copy on rankings, tradevalues, breakouts."""
    source = _teaser_source()
    assert "before the thread does" in source
    assert "before your league posts the screenshot" in source
    assert "beat the waiver wire" in source
