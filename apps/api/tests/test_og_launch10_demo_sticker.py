"""Launch-10 OG SAMPLE sticker labels match panel demo blurbs (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"

EXPECTED_BLURBS = {
    "gamelog": "demo Wk tape",
    "efficiency": "demo PPO board",
    "aging": "demo aging curve",
    "buysell": "demo buy/sell board",
    "dashboard": "demo roster grades",
}

EXPECTED_STICKERS = {
    "gamelog": "SAMPLE · Wk tape",
    "efficiency": "SAMPLE · PPO board",
    "aging": "SAMPLE · aging curve",
    "buysell": "SAMPLE · buy/sell board",
    "dashboard": "SAMPLE · roster grades",
}


def test_launch10_demo_blurb_suffix_in_route():
    source = ROUTE_TS.read_text(encoding="utf-8")
    for slug, phrase in EXPECTED_BLURBS.items():
        assert phrase in source, f"missing demo blurb copy for {slug}"


def test_launch10_demo_sticker_labels_in_route():
    source = ROUTE_TS.read_text(encoding="utf-8")
    for slug, label in EXPECTED_STICKERS.items():
        assert label in source, f"missing SAMPLE sticker copy for {slug}"
