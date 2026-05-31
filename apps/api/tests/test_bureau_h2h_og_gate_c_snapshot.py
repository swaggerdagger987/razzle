"""Bureau H2H OG Gate C — snapshot fixture params + demo fallback (League L5 atom 3/3)."""

from __future__ import annotations

import importlib.util
from pathlib import Path

_CODEC_PATH = Path(__file__).resolve().parent / "test_bureau_h2h_og_snapshot_codec.py"
_spec = importlib.util.spec_from_file_location("bureau_h2h_codec", _CODEC_PATH)
_codec = importlib.util.module_from_spec(_spec)
assert _spec and _spec.loader
_spec.loader.exec_module(_codec)

DEMO_SNAPSHOT_PARAM = _codec.DEMO_SNAPSHOT_PARAM
decode_bureau_h2h_snapshot = _codec.decode_bureau_h2h_snapshot

H2H_OG_GATE_C_PATH = "/og/head-to-head"
H2H_OG_GATE_C_PARAMS = f"download=1&snapshot={DEMO_SNAPSHOT_PARAM}"


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_h2h_og_route_has_demo_fallback_for_gate_c():
    route = _repo_root() / "apps/web/app/og/head-to-head/route.tsx"
    text = route.read_text(encoding="utf-8")
    assert "DEMO_H2H" in text
    assert "decodeBureauH2HOgSnapshot" in text
    assert "EXPORTED · panel rivalry rows" in text


def test_h2h_og_gate_c_fixture_snapshot_param_documented():
    assert "download=1" in H2H_OG_GATE_C_PARAMS
    assert "snapshot=" in H2H_OG_GATE_C_PARAMS
    assert len(DEMO_SNAPSHOT_PARAM) > 40


def test_h2h_codec_demo_param_matches_og_demo_teams():
    decoded = decode_bureau_h2h_snapshot(DEMO_SNAPSHOT_PARAM)
    assert decoded is not None
    assert decoded["you"]["team"] == "Your Squad"
    assert decoded["them"]["team"] == "Rival FC"
    route = (_repo_root() / "apps/web/app/og/head-to-head/route.tsx").read_text(
        encoding="utf-8"
    )
    assert "Your Squad" in route
    assert "Rival FC" in route
