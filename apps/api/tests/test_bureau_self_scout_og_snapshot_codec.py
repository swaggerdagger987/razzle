"""Contract tests for Bureau Self-Scout OG snapshot compact codec (tm/rc/pos).

Mirrors apps/web/lib/bureau-self-scout-og-snapshot.ts so ShareBar encode and OG
decode stay aligned in CI without a separate web test runner.
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


def encode_bureau_self_scout_snapshot(
    *,
    team: str,
    record: str,
    positions: list[dict[str, Any]],
    league: str | None = None,
    season: str | None = None,
    archetype: str | None = None,
    rank: int | None = None,
    total: int | None = None,
) -> str:
    compact: dict[str, Any] = {
        "tm": team,
        "rc": record,
        "pos": [
            {
                "p": row["position"],
                "g": row["grade"],
                "s": row["score"],
                "c": row["count"],
                "e": row["elite"],
                "n": str(row["top_name"])[:24],
            }
            for row in positions[:4]
        ],
    }
    if league:
        compact["lg"] = league
    if season:
        compact["sn"] = season
    if archetype:
        compact["ar"] = archetype
    if rank is not None:
        compact["rk"] = rank
    if total is not None:
        compact["tt"] = total
    return _b64url_encode(compact)


def decode_bureau_self_scout_snapshot(param: str) -> dict[str, Any] | None:
    try:
        compact = _b64url_decode(param)
    except (json.JSONDecodeError, ValueError):
        return None
    tm = compact.get("tm")
    pos = compact.get("pos")
    if not tm or not isinstance(pos, list) or len(pos) == 0:
        return None
    positions = []
    for row in pos:
        if not isinstance(row, dict) or not row.get("p"):
            continue
        positions.append(
            {
                "position": row["p"],
                "grade": row["g"],
                "score": row["s"],
                "count": row["c"],
                "elite": row["e"],
                "top_name": row["n"],
            }
        )
    if not positions:
        return None
    return {
        "team": tm,
        "record": compact.get("rc", ""),
        "league": compact.get("lg"),
        "season": compact.get("sn"),
        "archetype": compact.get("ar"),
        "rank": compact.get("rk"),
        "total": compact.get("tt"),
        "positions": positions,
    }


DEMO_POSITIONS = [
    {
        "position": "QB",
        "grade": "B+",
        "score": 72,
        "count": 2,
        "elite": 1,
        "top_name": "J. Burrow",
    },
    {
        "position": "RB",
        "grade": "A-",
        "score": 88,
        "count": 4,
        "elite": 2,
        "top_name": "B. Robinson",
    },
    {
        "position": "WR",
        "grade": "B",
        "score": 76,
        "count": 5,
        "elite": 1,
        "top_name": "J. Chase",
    },
    {
        "position": "TE",
        "grade": "C+",
        "score": 58,
        "count": 1,
        "elite": 0,
        "top_name": "S. LaPorta",
    },
]

DEMO_SNAPSHOT_PARAM = encode_bureau_self_scout_snapshot(
    team="Dynasty Dukes",
    record="7-6-0",
    league="Sunday Sweat",
    season="2025",
    archetype="Win Now",
    rank=3,
    total=12,
    positions=DEMO_POSITIONS,
)


def test_snapshot_roundtrip_matches_panel_shape():
    param = encode_bureau_self_scout_snapshot(
        team="Dynasty Dogs",
        record="9-4",
        archetype="Rebuild",
        rank=5,
        total=12,
        positions=[
            {
                "position": "QB",
                "grade": "A",
                "score": 91,
                "count": 2,
                "elite": 1,
                "top_name": "L. Jackson",
            },
            {
                "position": "RB",
                "grade": "B",
                "score": 74,
                "count": 5,
                "elite": 2,
                "top_name": "J. Gibbs",
            },
        ],
    )
    decoded = decode_bureau_self_scout_snapshot(param)
    assert decoded is not None
    assert decoded["team"] == "Dynasty Dogs"
    assert decoded["archetype"] == "Rebuild"
    assert decoded["positions"][1]["top_name"] == "J. Gibbs"
    assert decoded["positions"][0]["grade"] == "A"


def test_demo_fixture_param_decodes_for_og_export():
    decoded = decode_bureau_self_scout_snapshot(DEMO_SNAPSHOT_PARAM)
    assert decoded is not None
    assert decoded["team"] == "Dynasty Dukes"
    assert decoded["league"] == "Sunday Sweat"
    assert len(decoded["positions"]) == 4
    assert decoded["positions"][2]["position"] == "WR"


def test_legacy_team_key_fails_decode():
    """Pre-canonical payloads used `team` instead of `tm` — must not pass decode."""
    legacy = {
        "team": "You",
        "rc": "8-5",
        "pos": [{"p": "RB", "g": "B", "s": 70, "c": 3, "e": 1, "n": "RB1"}],
    }
    decoded = decode_bureau_self_scout_snapshot(_b64url_encode(legacy))
    assert decoded is None


def test_malformed_snapshot_returns_none():
    assert decode_bureau_self_scout_snapshot("not-valid-base64!!!") is None
    assert decode_bureau_self_scout_snapshot(_b64url_encode({"tm": "", "rc": "", "pos": []})) is None
