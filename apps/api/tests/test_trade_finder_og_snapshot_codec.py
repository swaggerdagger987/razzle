"""Contract tests for Bureau Trade Finder OG snapshot compact codec (m/h/n/s).

Mirrors apps/web/lib/bureau-trade-finder-og-snapshot.ts so ShareBar encode and OG
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


def encode_bureau_trade_finder_snapshot(
    *,
    matches: list[dict[str, Any]],
    hero_index: int = 0,
    needs: list[str] | None = None,
    surplus: list[str] | None = None,
) -> str:
    compact: dict[str, Any] = {
        "m": [
            {
                "pr": m["partner_roster_id"],
                "pt": m["partner_team"],
                "g": {
                    "id": m["give"]["player_id"],
                    "n": m["give"]["name"],
                    "p": m["give"]["position"],
                    "dv": m["give"]["dynasty_value"],
                },
                "t": {
                    "id": m["get"]["player_id"],
                    "n": m["get"]["name"],
                    "p": m["get"]["position"],
                    "dv": m["get"]["dynasty_value"],
                },
                "gp": m["gap_pct"],
            }
            for m in matches
        ],
        "h": hero_index,
    }
    if needs:
        compact["n"] = needs
    if surplus:
        compact["s"] = surplus
    return _b64url_encode(compact)


def decode_bureau_trade_finder_snapshot(param: str) -> dict[str, Any] | None:
    try:
        compact = _b64url_decode(param)
    except (json.JSONDecodeError, ValueError):
        return None
    rows = compact.get("m")
    if not isinstance(rows, list) or len(rows) == 0:
        return None
    matches = []
    for row in rows:
        g, t = row.get("g"), row.get("t")
        if not isinstance(g, dict) or not g.get("n") or not isinstance(t, dict) or not t.get("n"):
            continue
        matches.append(
            {
                "partner_roster_id": row.get("pr", 0),
                "partner_team": row.get("pt", ""),
                "give": {
                    "player_id": g.get("id", ""),
                    "name": g["n"],
                    "position": g.get("p", ""),
                    "dynasty_value": g.get("dv", 0),
                },
                "get": {
                    "player_id": t.get("id", ""),
                    "name": t["n"],
                    "position": t.get("p", ""),
                    "dynasty_value": t.get("dv", 0),
                },
                "gap_pct": row.get("gp", 0),
            }
        )
    if not matches:
        return None
    hero_idx = compact.get("h", 0)
    if not isinstance(hero_idx, int) or hero_idx < 0 or hero_idx >= len(matches):
        hero_idx = 0
    return {
        "matches": matches,
        "hero_match": matches[hero_idx],
        "needs": compact.get("n") or [],
        "surplus": compact.get("s") or [],
    }


DEMO_MATCHES = [
    {
        "partner_roster_id": 2,
        "partner_team": "Rebuild FC",
        "give": {
            "player_id": "p1",
            "name": "J. Gibbs",
            "position": "RB",
            "dynasty_value": 8420,
        },
        "get": {
            "player_id": "p2",
            "name": "C. Lamb",
            "position": "WR",
            "dynasty_value": 8310,
        },
        "gap_pct": 1.3,
    },
    {
        "partner_roster_id": 4,
        "partner_team": "Win-Now LLC",
        "give": {
            "player_id": "p3",
            "name": "B. Bowers",
            "position": "TE",
            "dynasty_value": 6120,
        },
        "get": {
            "player_id": "p4",
            "name": "D. Achane",
            "position": "RB",
            "dynasty_value": 5980,
        },
        "gap_pct": 2.3,
    },
]

DEMO_SNAPSHOT_PARAM = encode_bureau_trade_finder_snapshot(
    matches=DEMO_MATCHES,
    needs=["WR", "TE"],
    surplus=["RB"],
)


def test_trade_finder_snapshot_roundtrip():
    param = encode_bureau_trade_finder_snapshot(matches=DEMO_MATCHES, needs=["WR"], surplus=["RB"])
    decoded = decode_bureau_trade_finder_snapshot(param)
    assert decoded is not None
    assert len(decoded["matches"]) == 2
    assert decoded["hero_match"]["give"]["name"] == "J. Gibbs"
    assert decoded["needs"] == ["WR"]
    assert decoded["surplus"] == ["RB"]


def test_trade_finder_snapshot_demo_fixture():
    decoded = decode_bureau_trade_finder_snapshot(DEMO_SNAPSHOT_PARAM)
    assert decoded is not None
    assert decoded["matches"][0]["partner_team"] == "Rebuild FC"


def test_trade_finder_snapshot_rejects_garbage():
    assert decode_bureau_trade_finder_snapshot("not-valid-base64!!!") is None
    assert decode_bureau_trade_finder_snapshot(_b64url_encode({"m": []})) is None


def test_trade_finder_og_route_reads_snapshot_codec():
    path = __import__("pathlib").Path(__file__).resolve().parents[3] / "apps/web/app/og/trade-finder/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "decodeBureauTradeFinderOgSnapshot" in text
    assert 'url.searchParams.get("snapshot")' in text
    assert "EXPORTED · panel trade rows" in text
