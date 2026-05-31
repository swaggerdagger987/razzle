"""Lab OG snapshot codec — mirrors apps/web/components/lab/LabOgExportLink.encodeOgSnapshot."""

from __future__ import annotations

import base64
import json
from typing import Any

PROSPECTS_SNAPSHOT_ROWS = [
    {
        "name": "Marvin Harrison Jr.",
        "position": "WR",
        "team": "OSU",
        "stat": 92.4,
        "statLabel": "RPS",
    },
    {
        "name": "Malik Nabers",
        "position": "WR",
        "team": "LSU",
        "stat": 91.1,
        "statLabel": "RPS",
    },
]

TRADEVALUES_SNAPSHOT_ROWS = [
    {
        "name": "Ja'Marr Chase",
        "position": "WR",
        "team": "CIN",
        "stat": 9800,
        "statLabel": "1 · Value",
    },
    {
        "name": "Justin Jefferson",
        "position": "WR",
        "team": "MIN",
        "stat": 9600,
        "statLabel": "2 · Value",
    },
]


def _b64url_encode(payload: Any) -> str:
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def encode_og_snapshot(rows: list[dict[str, Any]]) -> str:
    compact = [
        {
            "n": r["name"],
            "p": r["position"],
            "t": r["team"],
            "s": r["stat"],
            "sl": r["statLabel"],
        }
        for r in rows
        if r.get("name")
    ][:6]
    return _b64url_encode(compact)


PROSPECTS_SNAPSHOT_PARAM = encode_og_snapshot(PROSPECTS_SNAPSHOT_ROWS)
TRADEVALUES_SNAPSHOT_PARAM = encode_og_snapshot(TRADEVALUES_SNAPSHOT_ROWS)


def test_prospects_snapshot_roundtrip_shape():
    assert len(PROSPECTS_SNAPSHOT_PARAM) > 20
    decoded = json.loads(
        base64.urlsafe_b64decode(PROSPECTS_SNAPSHOT_PARAM + "==").decode("utf-8")
    )
    assert decoded[0]["n"] == "Marvin Harrison Jr."
    assert decoded[0]["sl"] == "RPS"


def test_tradevalues_snapshot_roundtrip_shape():
    assert len(TRADEVALUES_SNAPSHOT_PARAM) > 20
    decoded = json.loads(
        base64.urlsafe_b64decode(TRADEVALUES_SNAPSHOT_PARAM + "==").decode("utf-8")
    )
    assert decoded[0]["n"] == "Ja'Marr Chase"
    assert "Value" in decoded[0]["sl"]
