"""Contract tests for Bureau H2H OG snapshot compact codec (y/m/pc).

Mirrors apps/web/lib/bureau-h2h-og-snapshot.ts so ShareBar encode and OG decode
stay aligned in CI without a separate web test runner.
"""

from __future__ import annotations

import base64
import json
from typing import Any


def _b64url_encode(compact: dict[str, Any]) -> str:
    raw = json.dumps(compact, separators=(",", ":"))
    b64 = base64.b64encode(raw.encode("utf-8")).decode("ascii")
    return b64.replace("+", "-").replace("/", "_").rstrip("=")


def _b64url_decode(param: str) -> dict[str, Any]:
    b64 = param.replace("-", "+").replace("_", "/")
    pad = "=" * ((4 - len(b64) % 4) % 4)
    return json.loads(base64.b64decode(b64 + pad))


def encode_bureau_h2h_snapshot(
    *,
    you_team: str,
    you_record: str,
    you_ppg: float,
    them_team: str,
    them_record: str,
    them_ppg: float,
    position_compare: list[dict[str, Any]],
    offer: list[str] | None = None,
    target: list[str] | None = None,
) -> str:
    compact: dict[str, Any] = {
        "y": {"t": you_team, "r": you_record, "p": you_ppg},
        "m": {"t": them_team, "r": them_record, "p": them_ppg},
        "pc": [
            {"p": row["position"], "y": row["your_count"], "m": row["their_count"]}
            for row in position_compare
        ],
    }
    if offer is not None or target is not None:
        compact["tf"] = {"o": offer or [], "g": target or []}
    return _b64url_encode(compact)


def decode_bureau_h2h_snapshot(param: str) -> dict[str, Any] | None:
    try:
        compact = _b64url_decode(param)
    except (json.JSONDecodeError, ValueError):
        return None
    y, m, pc = compact.get("y"), compact.get("m"), compact.get("pc")
    if not isinstance(y, dict) or not y.get("t"):
        return None
    if not isinstance(m, dict) or not m.get("t"):
        return None
    if not isinstance(pc, list) or len(pc) == 0:
        return None
    tf = compact.get("tf") if isinstance(compact.get("tf"), dict) else {}
    return {
        "you": {"team": y["t"], "record": y["r"], "ppg": y["p"]},
        "them": {"team": m["t"], "record": m["r"], "ppg": m["p"]},
        "position_compare": [
            {"position": row["p"], "your_count": row["y"], "their_count": row["m"]}
            for row in pc
        ],
        "trade_fit": {
            "you_could_offer": tf.get("o") or [],
            "you_could_target": tf.get("g") or [],
        },
    }


DEMO_POSITION_COMPARE = [
    {"position": "RB", "your_count": 4, "their_count": 2},
    {"position": "WR", "your_count": 5, "their_count": 6},
    {"position": "TE", "your_count": 2, "their_count": 1},
]

# Canonical fixture used in slice acceptance curl (matches DEMO_H2H on OG route).
DEMO_SNAPSHOT_PARAM = encode_bureau_h2h_snapshot(
    you_team="Your Squad",
    you_record="8-5",
    you_ppg=118.4,
    them_team="Rival FC",
    them_record="7-6",
    them_ppg=112.1,
    position_compare=DEMO_POSITION_COMPARE,
    offer=["RB"],
    target=["WR"],
)


def test_snapshot_roundtrip_matches_panel_shape():
    param = encode_bureau_h2h_snapshot(
        you_team="Dynasty Dogs",
        you_record="9-4",
        you_ppg=121.2,
        them_team="Rebuild FC",
        them_record="6-7",
        them_ppg=109.8,
        position_compare=[
            {"position": "QB", "your_count": 2, "their_count": 2},
            {"position": "RB", "your_count": 5, "their_count": 3},
        ],
        offer=["RB"],
        target=["WR"],
    )
    decoded = decode_bureau_h2h_snapshot(param)
    assert decoded is not None
    assert decoded["you"]["team"] == "Dynasty Dogs"
    assert decoded["them"]["ppg"] == 109.8
    assert decoded["position_compare"][1]["their_count"] == 3
    assert decoded["trade_fit"]["you_could_offer"] == ["RB"]


def test_demo_fixture_param_decodes_for_og_export():
    decoded = decode_bureau_h2h_snapshot(DEMO_SNAPSHOT_PARAM)
    assert decoded is not None
    assert decoded["you"]["team"] == "Your Squad"
    assert decoded["them"]["team"] == "Rival FC"
    assert len(decoded["position_compare"]) == 3


def test_legacy_opponent_key_t_fails_decode():
    """Pre-canonical payloads used `t` for opponent — must not pass y/m/pc decode."""
    legacy = {
        "y": {"t": "You", "r": "8-5", "p": 100.0},
        "t": {"t": "Them", "r": "7-6", "p": 90.0},
        "pc": [{"p": "RB", "y": 3, "m": 2}],
    }
    decoded = decode_bureau_h2h_snapshot(_b64url_encode(legacy))
    assert decoded is None


def test_malformed_snapshot_returns_none():
    assert decode_bureau_h2h_snapshot("not-valid-base64!!!") is None
    assert decode_bureau_h2h_snapshot(_b64url_encode({"y": {}, "m": {}, "pc": []})) is None
