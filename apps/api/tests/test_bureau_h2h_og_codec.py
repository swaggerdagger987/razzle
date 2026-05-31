"""Bureau H2H OG snapshot codec — ShareBar encode must round-trip OG decode."""

from __future__ import annotations

import base64
import json


def _encode_bureau_h2h_og_snapshot(snap: dict) -> str:
    """Mirror apps/web/lib/bureau-h2h-og-snapshot.ts compact keys (y/m/pc/tf)."""
    compact = {
        "y": {"t": snap["you"]["team"], "r": snap["you"]["record"], "p": snap["you"]["ppg"]},
        "m": {"t": snap["them"]["team"], "r": snap["them"]["record"], "p": snap["them"]["ppg"]},
        "pc": [
            {"p": row["position"], "y": row["your_count"], "m": row["their_count"]}
            for row in snap["position_compare"]
        ],
    }
    if snap.get("trade_fit"):
        compact["tf"] = {
            "o": snap["trade_fit"]["you_could_offer"],
            "g": snap["trade_fit"]["you_could_target"],
        }
    raw = base64.b64encode(json.dumps(compact, separators=(",", ":")).encode()).decode()
    return raw.replace("+", "-").replace("/", "_").rstrip("=")


def _decode_bureau_h2h_og_snapshot(param: str) -> dict | None:
    """Mirror decodeBureauH2HOgSnapshot — must accept ShareBar export params."""
    try:
        pad = "=" * (-len(param) % 4)
        b64 = param.replace("-", "+").replace("_", "/") + pad
        compact = json.loads(base64.b64decode(b64))
        if not compact.get("y", {}).get("t") or not compact.get("m", {}).get("t"):
            return None
        if not compact.get("pc"):
            return None
        snap = {
            "you": {
                "team": compact["y"]["t"],
                "record": compact["y"]["r"],
                "ppg": compact["y"]["p"],
            },
            "them": {
                "team": compact["m"]["t"],
                "record": compact["m"]["r"],
                "ppg": compact["m"]["p"],
            },
            "position_compare": [
                {"position": row["p"], "your_count": row["y"], "their_count": row["m"]}
                for row in compact["pc"]
            ],
        }
        if compact.get("tf"):
            snap["trade_fit"] = {
                "you_could_offer": compact["tf"].get("o", []),
                "you_could_target": compact["tf"].get("g", []),
            }
        return snap
    except (KeyError, TypeError, ValueError, json.JSONDecodeError):
        return None


SAMPLE_RIVALRY = {
    "you": {"team": "Your Squad", "record": "8-5", "ppg": 118.4},
    "them": {"team": "Rival FC", "record": "7-6", "ppg": 112.1},
    "position_compare": [
        {"position": "RB", "your_count": 4, "their_count": 2},
        {"position": "WR", "your_count": 5, "their_count": 6},
        {"position": "TE", "your_count": 2, "their_count": 1},
    ],
    "trade_fit": {"you_could_offer": ["RB"], "you_could_target": ["WR"]},
}


def test_bureau_h2h_og_snapshot_encode_decode_roundtrip():
    encoded = _encode_bureau_h2h_og_snapshot(SAMPLE_RIVALRY)
    assert encoded
    decoded = _decode_bureau_h2h_og_snapshot(encoded)
    assert decoded == SAMPLE_RIVALRY


def test_bureau_h2h_og_snapshot_rejects_legacy_opponent_key():
    """Regression: inline decoder used `t` for opponent; canonical codec uses `m`."""
    legacy = base64.b64encode(
        json.dumps(
            {
                "y": {"t": "A", "r": "1-0", "p": 100.0},
                "t": {"t": "B", "r": "0-1", "p": 90.0},
                "pc": [{"p": "RB", "y": 2, "m": 1}],
            },
            separators=(",", ":"),
        ).encode()
    ).decode()
    param = legacy.replace("+", "-").replace("/", "_").rstrip("=")
    assert _decode_bureau_h2h_og_snapshot(param) is None


def test_bureau_h2h_sharebar_snapshot_param_for_og_route():
    """Canonical param ShareBar would attach — OG route must decode this."""
    param = _encode_bureau_h2h_og_snapshot(SAMPLE_RIVALRY)
    decoded = _decode_bureau_h2h_og_snapshot(param)
    assert decoded is not None
    assert decoded["them"]["team"] == "Rival FC"
    assert decoded["trade_fit"]["you_could_offer"] == ["RB"]
