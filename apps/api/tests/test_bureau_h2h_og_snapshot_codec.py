"""Bureau H2H OG snapshot codec — mirrors apps/web/lib/bureau-h2h-og-snapshot.ts."""

from __future__ import annotations

import base64
import json
from typing import Any

import pytest

SAMPLE = {
    "you": {"team": "Your Squad", "record": "8-5", "ppg": 118.4},
    "them": {"team": "Rival FC", "record": "7-6", "ppg": 112.1},
    "position_compare": [
        {"position": "RB", "your_count": 4, "their_count": 2},
        {"position": "WR", "your_count": 5, "their_count": 6},
    ],
    "trade_fit": {"you_could_offer": ["RB"], "you_could_target": ["WR"]},
}


def _b64url_encode(compact: dict[str, Any]) -> str:
    raw = base64.urlsafe_b64encode(json.dumps(compact, separators=(",", ":")).encode()).decode()
    return raw.rstrip("=")


def encode_canonical(snap: dict[str, Any]) -> str:
    compact = {
        "y": {"t": snap["you"]["team"], "r": snap["you"]["record"], "p": snap["you"]["ppg"]},
        "m": {"t": snap["them"]["team"], "r": snap["them"]["record"], "p": snap["them"]["ppg"]},
        "pc": [
            {"p": row["position"], "y": row["your_count"], "m": row["their_count"]}
            for row in snap["position_compare"]
        ],
        "tf": {
            "o": snap["trade_fit"]["you_could_offer"],
            "g": snap["trade_fit"]["you_could_target"],
        },
    }
    return _b64url_encode(compact)


def encode_legacy(snap: dict[str, Any]) -> str:
    compact = {
        "y": snap["you"],
        "t": snap["them"],
        "pc": [
            {"position": row["position"], "y": row["your_count"], "t": row["their_count"]}
            for row in snap["position_compare"]
        ],
        "tf": {
            "o": snap["trade_fit"]["you_could_offer"],
            "g": snap["trade_fit"]["you_could_target"],
        },
    }
    return _b64url_encode(compact)


def decode_snapshot(param: str) -> dict[str, Any] | None:
    try:
        pad = "=" * (-len(param) % 4)
        raw = base64.urlsafe_b64decode(param.replace("-", "+").replace("_", "/") + pad)
        parsed = json.loads(raw)
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        return None

    if isinstance(parsed.get("y"), dict) and "team" in parsed["y"]:
        y, t = parsed["y"], parsed["t"]
        return {
            "you": {"team": y["team"], "record": y["record"], "ppg": y["ppg"]},
            "them": {"team": t["team"], "record": t["record"], "ppg": t["ppg"]},
            "position_compare": [
                {
                    "position": row["position"],
                    "your_count": row["y"],
                    "their_count": row["t"],
                }
                for row in parsed.get("pc", [])
            ],
            "trade_fit": {
                "you_could_offer": parsed.get("tf", {}).get("o", []),
                "you_could_target": parsed.get("tf", {}).get("g", []),
            },
        }

    y, m = parsed.get("y"), parsed.get("m")
    if not y or not m or not y.get("t") or not m.get("t"):
        return None
    if not parsed.get("pc"):
        return None
    return {
        "you": {"team": y["t"], "record": y["r"], "ppg": y["p"]},
        "them": {"team": m["t"], "record": m["r"], "ppg": m["p"]},
        "position_compare": [
            {"position": row["p"], "your_count": row["y"], "their_count": row["m"]}
            for row in parsed.get("pc", [])
        ],
        "trade_fit": {
            "you_could_offer": parsed.get("tf", {}).get("o", []),
            "you_could_target": parsed.get("tf", {}).get("g", []),
        },
    }


@pytest.mark.parametrize("encoder", [encode_canonical, encode_legacy])
def test_h2h_snapshot_encode_decode_roundtrip(encoder):
    token = encoder(SAMPLE)
    decoded = decode_snapshot(token)
    assert decoded is not None
    assert decoded["you"]["team"] == SAMPLE["you"]["team"]
    assert decoded["them"]["team"] == SAMPLE["them"]["team"]
    assert len(decoded["position_compare"]) == len(SAMPLE["position_compare"])
    assert decoded["position_compare"][0]["your_count"] == 4
    assert decoded["trade_fit"]["you_could_offer"] == ["RB"]


def test_h2h_snapshot_rejects_empty_payload():
    assert decode_snapshot(_b64url_encode({"y": {}, "m": {}})) is None
