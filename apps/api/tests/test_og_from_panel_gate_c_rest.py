"""Gate C fixtures for prospects + tradevalues FROM PANEL snapshot OG (Lab L5)."""

from __future__ import annotations

import base64
import json
from typing import Any

# Mirrors apps/web/components/lab/LabOgExportLink.encodeOgSnapshot
PROSPECTS_SNAPSHOT_ROWS = [
    {
        "name": "Travis Hunter",
        "position": "WR",
        "team": "JAX",
        "stat": 94,
        "statLabel": "RPS",
    },
    {
        "name": "Cam Ward",
        "position": "QB",
        "team": "TEN",
        "stat": 91,
        "statLabel": "RPS",
    },
]

TRADEVALUES_SNAPSHOT_ROWS = [
    {
        "name": "Ja'Marr Chase",
        "position": "WR",
        "team": "CIN",
        "stat": 10200,
        "statLabel": "Value",
    },
    {
        "name": "Bijan Robinson",
        "position": "RB",
        "team": "ATL",
        "stat": 9800,
        "statLabel": "Value",
    },
]


def encode_lab_og_snapshot(rows: list[dict[str, Any]]) -> str:
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
    raw = json.dumps(compact, separators=(",", ":"))
    b64 = base64.b64encode(raw.encode("utf-8")).decode("ascii")
    return b64.replace("+", "-").replace("/", "_").rstrip("=")


PROSPECTS_GATE_C_SNAPSHOT = encode_lab_og_snapshot(PROSPECTS_SNAPSHOT_ROWS)
TRADEVALUES_GATE_C_SNAPSHOT = encode_lab_og_snapshot(TRADEVALUES_SNAPSHOT_ROWS)

PROSPECTS_OG_GATE_C_URL = (
    f"/og/prospects?download=1&snapshot={PROSPECTS_GATE_C_SNAPSHOT}"
)
TRADEVALUES_OG_GATE_C_URL = (
    f"/og/tradevalues?download=1&snapshot={TRADEVALUES_GATE_C_SNAPSHOT}"
)


def test_prospects_tradevalues_snapshot_params_roundtrip():
    for param in (PROSPECTS_GATE_C_SNAPSHOT, TRADEVALUES_GATE_C_SNAPSHOT):
        b64 = param.replace("-", "+").replace("_", "/")
        pad = "=" * ((4 - len(b64) % 4) % 4)
        arr = json.loads(base64.b64decode(b64 + pad))
        assert isinstance(arr, list) and len(arr) >= 1
        assert arr[0]["n"]


def test_gate_c_fixture_urls_documented():
    assert "download=1" in PROSPECTS_OG_GATE_C_URL
    assert "snapshot=" in PROSPECTS_OG_GATE_C_URL
    assert "download=1" in TRADEVALUES_OG_GATE_C_URL
    assert "snapshot=" in TRADEVALUES_OG_GATE_C_URL
    assert PROSPECTS_GATE_C_SNAPSHOT in PROSPECTS_OG_GATE_C_URL
    assert TRADEVALUES_GATE_C_SNAPSHOT in TRADEVALUES_OG_GATE_C_URL
