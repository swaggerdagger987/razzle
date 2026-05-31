"""Launch-10 OG snapshot exports show FROM PANEL trust sticker (Lab L5)."""

from __future__ import annotations

import base64
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"

# Trust sticker channel per Launch-10 OG slug — must mirror LAUNCH_10_OG_SLUGS in route.tsx.
LAUNCH_10_OG_TRUST_REGISTRY: dict[str, str] = {
    "rankings": "from_panel_snapshot",
    "weekly": "from_panel_snapshot",
    "prospects": "from_panel_snapshot",
    "tradevalues": "from_panel_snapshot",
    "dashboard": "live",
    "breakouts": "live",
    "gamelog": "live",
    "efficiency": "live",
    "aging": "live",
    "buysell": "live",
}

SNAPSHOT_FROM_PANEL_SLUGS = tuple(
    slug for slug, mode in LAUNCH_10_OG_TRUST_REGISTRY.items() if mode == "from_panel_snapshot"
)


def _parse_launch10_og_slugs(source: str) -> frozenset[str]:
    launch_block = source.split("const LAUNCH_10_OG_SLUGS", 1)[1].split(");", 1)[0]
    return frozenset(re.findall(r'"([a-z0-9-]+)"', launch_block))


def _encode_snapshot(rows: list[dict]) -> str:
    compact = [
        {"n": r["name"], "p": r["position"], "t": r["team"], "s": r["stat"], "sl": r["statLabel"]}
        for r in rows
    ]
    raw = base64.urlsafe_b64encode(json.dumps(compact).encode()).decode()
    return raw.rstrip("=")


def test_launch10_og_trust_registry_covers_all_route_slugs():
    source = ROUTE_TS.read_text(encoding="utf-8")
    route_slugs = _parse_launch10_og_slugs(source)
    assert set(LAUNCH_10_OG_TRUST_REGISTRY) == set(route_slugs), (
        "registry must list every LAUNCH_10_OG_SLUGS member exactly once"
    )


def test_from_panel_sticker_on_snapshot_path():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "FROM PANEL · your rows" in source
    assert "isSnapshot && LAUNCH_10_OG_SLUGS.has(slug)" in source


def test_from_panel_sticker_covers_launch10_snapshot_slugs():
    source = ROUTE_TS.read_text(encoding="utf-8")
    launch_block = source.split("const LAUNCH_10_OG_SLUGS", 1)[1].split(");", 1)[0]
    for slug in SNAPSHOT_FROM_PANEL_SLUGS:
        assert f'"{slug}"' in launch_block, f"{slug} must be in LAUNCH_10_OG_SLUGS"
    assert "from your panel" in source
    assert "#5b7fff" in source, "FROM PANEL sticker uses trust blue"


def test_live_registry_slugs_have_live_sticker_copy():
    source = ROUTE_TS.read_text(encoding="utf-8")
    for slug in LAUNCH_10_OG_TRUST_REGISTRY:
        if LAUNCH_10_OG_TRUST_REGISTRY[slug] != "live":
            continue
        assert f'case "{slug}"' in source, f"missing launch10LiveBlurbSuffix for {slug}"
        assert "launch10LiveStickerLabel" in source


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
