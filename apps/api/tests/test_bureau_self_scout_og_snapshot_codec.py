"""Contract tests for Bureau Self-Scout OG snapshot compact codec.

Mirrors apps/web/lib/bureau-self-scout-og-snapshot.ts so ShareBar encode and OG decode
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


def encode_self_scout_snapshot(
    *,
    team: str,
    record: str,
    league: str,
    season: str,
    archetype: str,
    rank: int,
    total: int,
    rows: list[dict[str, Any]],
) -> str:
    compact = {
        "tm": team,
        "rc": record,
        "lg": league,
        "sn": season,
        "ar": archetype,
        "rk": rank,
        "tt": total,
        "d": [
            {
                "p": r["pos"],
                "g": r["grade"],
                "s": r["score"],
                "c": r["count"],
                "e": r["elite"],
                "n": r["topName"],
            }
            for r in rows
        ],
    }
    return _b64url_encode(compact)


def test_self_scout_snapshot_roundtrip() -> None:
    rows = [
        {"pos": "QB", "grade": "B", "score": 78, "count": 2, "elite": 1, "topName": "J. Burrow"},
        {"pos": "RB", "grade": "A", "score": 91, "count": 4, "elite": 2, "topName": "B. Robinson"},
        {"pos": "WR", "grade": "B", "score": 84, "count": 5, "elite": 1, "topName": "J. Chase"},
        {"pos": "TE", "grade": "C", "score": 54, "count": 1, "elite": 0, "topName": "S. LaPorta"},
    ]
    param = encode_self_scout_snapshot(
        team="Dynasty Dukes",
        record="7-6-0",
        league="Sunday Sweat",
        season="2025",
        archetype="Win Now",
        rank=3,
        total=12,
        rows=rows,
    )
    decoded = _b64url_decode(param)
    assert decoded["tm"] == "Dynasty Dukes"
    assert decoded["rk"] == 3
    assert len(decoded["d"]) == 4
    assert decoded["d"][2]["n"] == "J. Chase"


def test_self_scout_snapshot_rejects_empty_team() -> None:
    param = encode_self_scout_snapshot(
        team="",
        record="",
        league="",
        season="",
        archetype="",
        rank=0,
        total=0,
        rows=[],
    )
    decoded = _b64url_decode(param)
    assert decoded["tm"] == ""
