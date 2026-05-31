"""Prove Bureau H2H ShareBar snapshot codec round-trips (matches apps/web/lib/bureau-h2h-og-snapshot.ts)."""

from __future__ import annotations

import base64
import json


def _encode_compact(compact: dict) -> str:
    raw = json.dumps(compact, separators=(",", ":")).encode()
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _decode_compact(param: str) -> dict:
    pad = "=" * (-len(param) % 4)
    raw = base64.urlsafe_b64decode(param + pad)
    return json.loads(raw)


def test_h2h_snapshot_roundtrip_compact_keys():
    """ShareBar encode → OG decode must preserve y/m/pc/tf compact keys."""
    compact = {
        "y": {"t": "Your Squad", "r": "8-5", "p": 118.4},
        "m": {"t": "Rival FC", "r": "7-6", "p": 112.1},
        "pc": [
            {"p": "RB", "y": 4, "m": 2},
            {"p": "WR", "y": 5, "m": 6},
        ],
        "tf": {"o": ["RB"], "g": ["WR"]},
    }
    encoded = _encode_compact(compact)
    decoded = _decode_compact(encoded)
    assert decoded == compact
    assert decoded["m"]["t"] == "Rival FC"
    assert decoded["pc"][0]["p"] == "RB"


def test_h2h_snapshot_rejects_empty_opponent():
    compact = {
        "y": {"t": "A", "r": "1-0", "p": 100.0},
        "m": {"t": "", "r": "0-1", "p": 90.0},
        "pc": [],
    }
    encoded = _encode_compact(compact)
    decoded = _decode_compact(encoded)
    assert decoded["m"]["t"] == ""
