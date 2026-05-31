"""Launch-10 OG snapshot exports show FROM PANEL trust sticker (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"

# All Launch-10 Lab panels — Gate C contract: snapshot export uses FROM PANEL sticker.
LAUNCH_10_OG_SLUGS = (
    "weekly",
    "prospects",
    "dashboard",
    "rankings",
    "tradevalues",
    "breakouts",
    "gamelog",
    "efficiency",
    "aging",
    "buysell",
)


def _launch10_slug_block() -> str:
    source = ROUTE_TS.read_text(encoding="utf-8")
    return source.split("const LAUNCH_10_OG_SLUGS", 1)[1].split(");", 1)[0]


def test_from_panel_sticker_on_snapshot_path():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "FROM PANEL · your rows" in source
    assert "isSnapshot && LAUNCH_10_OG_SLUGS.has(slug)" in source


def test_from_panel_sticker_covers_all_launch10_slugs():
    launch_block = _launch10_slug_block()
    for slug in LAUNCH_10_OG_SLUGS:
        assert f'"{slug}"' in launch_block, f"{slug} must be in LAUNCH_10_OG_SLUGS"
    assert "from your panel" in ROUTE_TS.read_text(encoding="utf-8")
    assert "#5b7fff" in ROUTE_TS.read_text(encoding="utf-8"), (
        "FROM PANEL sticker uses trust blue"
    )


def test_launch10_slug_registry_matches_route_count():
    launch_block = _launch10_slug_block()
    listed = [slug for slug in LAUNCH_10_OG_SLUGS if f'"{slug}"' in launch_block]
    assert len(listed) == len(LAUNCH_10_OG_SLUGS), (
        "pytest LAUNCH_10_OG_SLUGS must stay aligned with route.tsx"
    )
