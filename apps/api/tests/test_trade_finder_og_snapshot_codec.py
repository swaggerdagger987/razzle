"""Contract tests for Bureau Trade Finder OG snapshot codec (m/n/s/h).

Mirrors apps/web/lib/bureau-trade-finder-og-snapshot.ts for ShareBar + OG decode.
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


def encode_trade_finder_snapshot(
    matches: list[dict[str, Any]],
    *,
    needs: list[str] | None = None,
    surplus: list[str] | None = None,
    hero_idx: int = 0,
) -> str:
    compact: dict[str, Any] = {
        "m": [
            {
                "pid": m["partner_roster_id"],
                "pt": m["partner_team"],
                "g": {
                    "id": m["give"]["player_id"],
                    "n": m["give"]["name"],
                    "p": m["give"]["position"],
                    "v": m["give"]["dynasty_value"],
                },
                "r": {
                    "id": m["get"]["player_id"],
                    "n": m["get"]["name"],
                    "p": m["get"]["position"],
                    "v": m["get"]["dynasty_value"],
                },
                "gap": m["gap_pct"],
            }
            for m in matches
        ],
        "h": hero_idx,
    }
    if needs:
        compact["n"] = needs
    if surplus:
        compact["s"] = surplus
    return _b64url_encode(compact)


def decode_trade_finder_snapshot(param: str) -> dict[str, Any] | None:
    try:
        compact = _b64url_decode(param)
    except (json.JSONDecodeError, ValueError):
        return None
    rows = compact.get("m")
    if not isinstance(rows, list) or len(rows) == 0:
        return None
    matches = []
    for row in rows:
        if not isinstance(row, dict) or not row.get("pt"):
            continue
        g, r = row.get("g"), row.get("r")
        if not isinstance(g, dict) or not isinstance(r, dict):
            continue
        matches.append(
            {
                "partner_roster_id": row["pid"],
                "partner_team": row["pt"],
                "give": {
                    "player_id": g["id"],
                    "name": g["n"],
                    "position": g["p"],
                    "dynasty_value": g["v"],
                },
                "get": {
                    "player_id": r["id"],
                    "name": r["n"],
                    "position": r["p"],
                    "dynasty_value": r["v"],
                },
                "gap_pct": row["gap"],
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
        "give": {"player_id": "p1", "name": "J. Gibbs", "position": "RB", "dynasty_value": 8420},
        "get": {"player_id": "p2", "name": "C. Lamb", "position": "WR", "dynasty_value": 8310},
        "gap_pct": 1.3,
    },
    {
        "partner_roster_id": 4,
        "partner_team": "Win-Now LLC",
        "give": {"player_id": "p3", "name": "B. Bowers", "position": "TE", "dynasty_value": 6120},
        "get": {"player_id": "p4", "name": "D. Achane", "position": "RB", "dynasty_value": 5980},
        "gap_pct": 2.3,
    },
]

DEMO_SNAPSHOT_PARAM = encode_trade_finder_snapshot(
    DEMO_MATCHES,
    needs=["WR", "TE"],
    surplus=["RB"],
    hero_idx=0,
)


def test_snapshot_roundtrip_matches_panel_shape():
    param = encode_trade_finder_snapshot(DEMO_MATCHES, needs=["WR"], surplus=["RB"])
    decoded = decode_trade_finder_snapshot(param)
    assert decoded is not None
    assert decoded["matches"][0]["partner_team"] == "Rebuild FC"
    assert decoded["hero_match"]["give"]["name"] == "J. Gibbs"
    assert decoded["needs"] == ["WR"]


def test_demo_fixture_param_decodes_for_og_export():
    decoded = decode_trade_finder_snapshot(DEMO_SNAPSHOT_PARAM)
    assert decoded is not None
    assert len(decoded["matches"]) == 2
    assert decoded["surplus"] == ["RB"]


def test_route_uses_snapshot_decoder():
    path = (
        __import__("pathlib").Path(__file__).resolve().parents[3]
        / "apps/web/app/og/trade-finder/route.tsx"
    )
    text = path.read_text(encoding="utf-8")
    assert "decodeBureauTradeFinderOgSnapshot" in text
    assert "bureauTradeFinderOgSnapshotToData" in text
    assert 'searchParams.get("snapshot")' in text


def test_malformed_snapshot_returns_none():
    assert decode_trade_finder_snapshot("not-valid!!!") is None
    assert decode_trade_finder_snapshot(_b64url_encode({"m": []})) is None
