"""Lab OG snapshot exports preserve player_id in toLab watermark (Lab L5 hallway epic)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_snapshot_exports_pass_from_snapshot_to_watermark_helper():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "fromSnapshot?: boolean" in source
    assert "fromSnapshot: isSnapshot" in source
    assert "opts.fromSnapshot ||" in source


def test_snapshot_player_preserves_default_player_in_tolab():
    source = ROUTE_TS.read_text(encoding="utf-8")
    idx = source.index("function labOgWatermarkLink")
    helper = source[idx : source.index("function formatStat", idx)]
    assert "fromSnapshot" in helper
    assert "opts.fromSnapshot ||" in helper
