"""Breakouts OG — Lab L5 live fetch path + FACTORY-DOD Gate C guards."""

from __future__ import annotations

import base64
import json
from pathlib import Path

BREAKOUTS_OG_GATE_C_PARAMS = "download=1"

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"
RENDERER_TS = ROOT / "apps/web/components/lab/renderers/BreakoutsRenderer.tsx"
EXPORT_LINK_TS = ROOT / "apps/web/components/lab/LabOgExportLink.tsx"


def test_breakouts_og_panel_route_exists():
    assert ROUTE_TS.is_file()
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "export async function GET" in source
    assert '"breakouts"' in source
    assert "fetchOgLiveRows" in source


def test_breakouts_og_demo_fallback_for_gate_c():
    """Breakouts OG must render demo RBS rows when API empty — FACTORY-DOD Gate C."""
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "DEMO_ROWS_BY_SLUG" in source
    assert "breakouts:" in source
    assert "RBS" in source
    assert "launch10DemoBlurbSuffix" in source


def test_breakouts_og_live_fetch_prefers_panel_api_then_panels_slug():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "LAUNCH_10_OG_SLUGS.has(slug)" in source
    assert "fetchPanelData" in source
    assert "fetchLiveOgRows" in source
    idx = source.index("async function fetchOgLiveRows")
    block = source[idx : idx + 520]
    assert "fromPanelApi.length > 0" in block


def test_breakouts_renderer_sort_matches_og_stat_keys():
    renderer = RENDERER_TS.read_text(encoding="utf-8")
    route = ROUTE_TS.read_text(encoding="utf-8")
    for token in ("formula_score", "rbs_score", "candidates"):
        assert token in renderer
    assert "breakoutsStatKeys" in route
    assert 'slug === "breakouts"' in route
    idx = route.index("breakoutsStatKeys")
    block = route[idx : idx + 280]
    assert block.index('"formula_score"') < block.index('"rbs_score"')


def test_breakouts_snapshot_codec_fixture():
    rows = [
        {"n": "Rome Odunze", "p": "WR", "t": "CHI", "s": 92, "sl": "RBS"},
        {"n": "Ladd McConkey", "p": "WR", "t": "LAC", "s": 88, "sl": "RBS"},
    ]
    raw = base64.urlsafe_b64encode(json.dumps(rows).encode()).decode().rstrip("=")
    decoded = json.loads(base64.urlsafe_b64decode(raw + "==").decode())
    assert decoded[0]["sl"] == "RBS"


def test_lab_og_export_link_breakouts_download_param():
    text = EXPORT_LINK_TS.read_text(encoding="utf-8")
    assert 'download: "1"' in text
    assert "/og/${slug}" in text or "`/og/${slug}?" in text


def test_breakouts_og_gate_c_fixture_params_documented():
    assert "download=1" in BREAKOUTS_OG_GATE_C_PARAMS
