"""Bureau strength-of-schedule OG trust stickers (League L5)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/strength-of-schedule/route.tsx"


def test_sos_og_trust_stickers_in_route():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "LIVE · Sleeper schedule slate" in source
    assert "SAMPLE · demo schedule slate" in source
    assert "EXPORTED · panel schedule rows" in source
    assert "const isLive = !isSnapshot && Boolean(live?.verdict)" in source
