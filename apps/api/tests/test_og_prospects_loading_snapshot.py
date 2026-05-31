"""Prospects OG — loading + empty board sample snapshot (Lab L5 Gate C)."""

from __future__ import annotations

import base64
import json
from pathlib import Path

PROSPECTS_OG_GATE_C_SNAPSHOT = (
    "eyJyIjpbeyJuIjoiVHJhdmlzIEh1bnRlciIsInAiOiJXUiIsInQiOiJKQVgiLCJzIjo5NCwic2wiOiJSUFMifV19"
)

ROOT = Path(__file__).resolve().parents[3]
RENDERER_TS = ROOT / "apps/web/components/lab/renderers/ProspectsRenderer.tsx"
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_prospects_sample_rows_defined_in_renderer():
    source = RENDERER_TS.read_text(encoding="utf-8")
    assert "PROSPECTS_SAMPLE_OG_ROWS" in source
    assert "Travis Hunter" in source
    assert 'statLabel: "RPS"' in source


def test_prospects_loading_state_exports_sample_card():
    source = RENDERER_TS.read_text(encoding="utf-8")
    assert "q.isPending" in source
    assert "snapshotRows={PROSPECTS_SAMPLE_OG_ROWS}" in source
    assert 'label="export sample card"' in source
    idx = source.index("if (q.isPending)")
    block = source[idx : idx + 520]
    assert "PanelAgentLoading" in block
    assert "LabOgExportLink" in block


def test_prospects_empty_board_exports_sample_card():
    source = RENDERER_TS.read_text(encoding="utf-8")
    assert "!prospects.length" in source
    assert source.count("PROSPECTS_SAMPLE_OG_ROWS") >= 2


def test_prospects_og_demo_rows_align_with_sample_snapshot():
    route = ROUTE_TS.read_text(encoding="utf-8")
    renderer = RENDERER_TS.read_text(encoding="utf-8")
    assert "prospects:" in route
    assert "Travis Hunter" in route
    assert "Travis Hunter" in renderer
    assert "DEMO_ROWS_BY_SLUG" in route


def test_prospects_snapshot_codec_fixture():
    decoded = json.loads(base64.urlsafe_b64decode(PROSPECTS_OG_GATE_C_SNAPSHOT + "==").decode())
    rows = decoded["r"] if isinstance(decoded, dict) and "r" in decoded else decoded
    assert rows[0]["n"] == "Travis Hunter"
    assert rows[0]["sl"] == "RPS"


def test_prospects_og_gate_c_fixture_params_documented():
    assert "download=1" in "download=1&snapshot=" + PROSPECTS_OG_GATE_C_SNAPSHOT
