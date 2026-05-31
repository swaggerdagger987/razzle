"""Launch-10 OG snapshot exports show FROM PANEL trust sticker (Lab L5)."""

from __future__ import annotations

import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"

# All Launch-10 Lab panels — FROM PANEL snapshot sticker must apply to each slug.
LAUNCH_10_OG_SLUGS = (
    "weekly",
    "prospects",
    "dashboard",
    "rankings",
    "tradevalues",
    "breakouts",
    "gamelog",
    "efficiency",
    "aging",
    "buysell",
)

# Snapshot export panels with Gate C curl evidence — FROM PANEL trust sticker.
SNAPSHOT_FROM_PANEL_SLUGS = LAUNCH_10_OG_SLUGS


def _encode_snapshot(rows: list[dict]) -> str:
    compact = [
        {"n": r["name"], "p": r["position"], "t": r["team"], "s": r["stat"], "sl": r["statLabel"]}
        for r in rows
    ]
    raw = base64.urlsafe_b64encode(json.dumps(compact).encode()).decode()
    return raw.rstrip("=")


def test_from_panel_sticker_on_snapshot_path():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "FROM PANEL · your rows" in source
    assert "isSnapshot && LAUNCH_10_OG_SLUGS.has(slug)" in source


def _launch10_slug_block() -> str:
    source = ROUTE_TS.read_text(encoding="utf-8")
    return source.split("const LAUNCH_10_OG_SLUGS", 1)[1].split(");", 1)[0]


def test_from_panel_sticker_covers_launch10_snapshot_slugs():
    launch_block = _launch10_slug_block()
    for slug in SNAPSHOT_FROM_PANEL_SLUGS:
        assert f'"{slug}"' in launch_block, f"{slug} must be in LAUNCH_10_OG_SLUGS"
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "from your panel" in source
    assert "#5b7fff" in source, "FROM PANEL sticker uses trust blue"


def test_launch10_slug_registry_matches_route_count():
    launch_block = _launch10_slug_block()
    listed = [slug for slug in LAUNCH_10_OG_SLUGS if f'"{slug}"' in launch_block]
    assert len(listed) == len(LAUNCH_10_OG_SLUGS), (
        "pytest LAUNCH_10_OG_SLUGS must stay aligned with route.tsx"
    )


def test_prospects_snapshot_extract_uses_rps():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "function extractProspectsRows" in source
    assert 'slug === "prospects"' in source
    assert 'stat: Number(p.rps ?? 0)' in source
    assert 'statLabel: rank != null' in source or "RPS" in source


def test_tradevalues_live_extract_prefers_trade_value():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert 'slug === "tradevalues"' in source
    assert "tradeValueStatKeys" in source
    idx = source.index("tradeValueStatKeys")
    block = source[idx : idx + 320]
    assert '"formula_score"' in block
    assert '"trade_value"' in block
    assert block.index('"formula_score"') < block.index('"trade_value"')


def test_snapshot_codec_matches_lab_export_link():
    snap = _encode_snapshot(
        [
            {
                "name": "Travis Hunter",
                "position": "WR",
                "team": "JAX",
                "stat": 94,
                "statLabel": "RPS",
            },
        ],
    )
    assert snap
    decoded = json.loads(base64.urlsafe_b64decode(snap + "==").decode())
    assert decoded[0]["n"] == "Travis Hunter"
    assert decoded[0]["s"] == 94
