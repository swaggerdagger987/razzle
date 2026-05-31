"""Round-trip tests for Bureau H2H OG snapshot compact codec (matches apps/web/lib/bureau-h2h-og-snapshot.ts)."""

from __future__ import annotations

import base64
import json


def _encode_snapshot(snap: dict) -> str:
    compact = {
        "y": {"t": snap["you"]["team"], "r": snap["you"]["record"], "p": snap["you"]["ppg"]},
        "m": {"t": snap["them"]["team"], "r": snap["them"]["record"], "p": snap["them"]["ppg"]},
        "pc": [
            {"p": row["position"], "y": row["your_count"], "m": row["their_count"]}
            for row in snap["position_compare"]
        ],
        "tf": {
            "o": snap.get("trade_fit", {}).get("you_could_offer", []),
            "g": snap.get("trade_fit", {}).get("you_could_target", []),
        },
    }
    raw = base64.urlsafe_b64encode(json.dumps(compact, separators=(",", ":")).encode()).decode()
    return raw.rstrip("=")


def _decode_snapshot(param: str) -> dict | None:
    try:
        pad = "=" * (-len(param) % 4)
        data = json.loads(base64.urlsafe_b64decode(param + pad))
        if not data.get("y", {}).get("t") or not data.get("m", {}).get("t"):
            return None
        return {
            "you": {
                "team": data["y"]["t"],
                "record": data["y"]["r"],
                "ppg": data["y"]["p"],
            },
            "them": {
                "team": data["m"]["t"],
                "record": data["m"]["r"],
                "ppg": data["m"]["p"],
            },
            "position_compare": [
                {"position": row["p"], "your_count": row["y"], "their_count": row["m"]}
                for row in data.get("pc", [])
            ],
            "trade_fit": {
                "you_could_offer": data.get("tf", {}).get("o", []),
                "you_could_target": data.get("tf", {}).get("g", []),
            },
        }
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        return None


SAMPLE = {
    "you": {"team": "Your Squad", "record": "8-5", "ppg": 118.4},
    "them": {"team": "Rival FC", "record": "7-6", "ppg": 112.1},
    "position_compare": [
        {"position": "RB", "your_count": 4, "their_count": 2},
        {"position": "WR", "your_count": 5, "their_count": 6},
    ],
    "trade_fit": {"you_could_offer": ["RB"], "you_could_target": ["WR"]},
}


def test_h2h_snapshot_roundtrip_preserves_matchup():
    encoded = _encode_snapshot(SAMPLE)
    decoded = _decode_snapshot(encoded)
    assert decoded is not None
    assert decoded["you"]["team"] == SAMPLE["you"]["team"]
    assert decoded["them"]["team"] == SAMPLE["them"]["team"]
    assert decoded["position_compare"][0]["position"] == "RB"
    assert decoded["trade_fit"]["you_could_target"] == ["WR"]


def test_h2h_snapshot_rejects_garbage():
    assert _decode_snapshot("not-valid-base64!!!") is None
