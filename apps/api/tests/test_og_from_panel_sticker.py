"""Launch-10 OG snapshot exports show FROM PANEL trust sticker (Lab L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_from_panel_sticker_on_snapshot_path():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "FROM PANEL · your rows" in source
    assert "isSnapshot && LAUNCH_10_OG_SLUGS.has(slug)" in source
