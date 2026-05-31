"""Contract tests for Bureau Self-Scout OG snapshot compact codec (t/r/d).

Mirrors apps/web/lib/bureau-self-scout-og-snapshot.ts so panel encode and OG
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
    depth: list[dict[str, Any]],
    league: str | None = None,
    archetype: str | None = None,
    rank: int | None = None,
    total: int | None = None,
) -> str:
    compact: dict[str, Any] = {
        "t": team,
        "r": record,
        "d": [
            {
                "p": row["position"],
                "g": row["grade"],
                "c": row["count"],
                "e": row["elite"],
                **({"top": row["topName"]} if row.get("topName") and row["topName"] != "—" else {}),
            }
            for row in depth
        ],
    }
    if league:
        compact["l"] = league
    if archetype:
        compact["a"] = archetype
    if rank is not None:
        compact["rk"] = rank
    if total is not None:
        compact["tot"] = total
    return _b64url_encode(compact)


def decode_bureau_self_scout_snapshot(param: str) -> dict[str, Any] | None:
    try:
        compact = _b64url_decode(param)
    except (json.JSONDecodeError, ValueError):
        return None
    t, d = compact.get("t"), compact.get("d")
    if not isinstance(t, str) or not t:
        return None
    if not isinstance(d, list) or len(d) == 0:
        return None
    return {
        "team": t,
        "record": compact.get("r") or "",
        "league": compact.get("l"),
        "archetype": compact.get("a"),
        "rank": compact.get("rk"),
        "total": compact.get("tot"),
        "depth": [
            {
                "position": row["p"],
                "grade": row["g"],
                "count": row["c"],
                "elite": row["e"],
                "topName": row.get("top") or "—",
            }
            for row in d
        ],
    }


DEMO_DEPTH = [
    {"position": "QB", "grade": "B", "count": 2, "elite": 1, "topName": "J. Burrow"},
    {"position": "RB", "grade": "A", "count": 4, "elite": 2, "topName": "B. Robinson"},
    {"position": "WR", "grade": "B", "count": 5, "elite": 1, "topName": "J. Chase"},
    {"position": "TE", "grade": "C", "count": 1, "elite": 0, "topName": "S. LaPorta"},
]

DEMO_SNAPSHOT_PARAM = encode_bureau_self_scout_snapshot(
    team="Dynasty Dukes",
    record="7-6-0",
    league="Sunday Sweat",
    archetype="Win Now",
    rank=3,
    total=12,
    depth=DEMO_DEPTH,
)


def test_snapshot_roundtrip_matches_panel_shape():
    param = encode_bureau_self_scout_snapshot(
        team="Rebuild FC",
        record="3-10",
        depth=[
            {"position": "QB", "grade": "C", "count": 2, "elite": 0, "topName": "Stafford"},
            {"position": "RB", "grade": "F", "count": 1, "elite": 0, "topName": "—"},
        ],
        archetype="Rebuild",
        rank=10,
        total=12,
    )
    decoded = decode_bureau_self_scout_snapshot(param)
    assert decoded is not None
    assert decoded["team"] == "Rebuild FC"
    assert decoded["depth"][0]["grade"] == "C"
    assert decoded["depth"][1]["count"] == 1
    assert decoded["rank"] == 10


def test_demo_fixture_param_decodes_for_og_export():
    decoded = decode_bureau_self_scout_snapshot(DEMO_SNAPSHOT_PARAM)
    assert decoded is not None
    assert decoded["team"] == "Dynasty Dukes"
    assert decoded["depth"][2]["topName"] == "J. Chase"
    assert len(decoded["depth"]) == 4


def test_malformed_snapshot_returns_none():
    assert decode_bureau_self_scout_snapshot("not-valid-base64!!!") is None
    assert decode_bureau_self_scout_snapshot(_b64url_encode({"t": "", "d": []})) is None
