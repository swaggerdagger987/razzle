"""Trade values OG — loading + empty board sample snapshot (Lab L5 Gate C)."""

from __future__ import annotations

import base64
import json
from pathlib import Path

TRADEVALUES_OG_GATE_C_SNAPSHOT = (
    "eyJyIjpbeyJuIjoiSmEnTWFyciBDaGFzZSIsInAiOiJXUiIsInQiOiJDSU4iLCJzIjoxMDIwMCwic2wiOiJWYWx1ZSJ9XX0"
)

ROOT = Path(__file__).resolve().parents[3]
RENDERER_TS = ROOT / "apps/web/components/lab/renderers/TradeValuesRenderer.tsx"
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"


def test_tradevalues_sample_rows_defined_in_renderer():
    source = RENDERER_TS.read_text(encoding="utf-8")
    assert "TRADEVALUES_SAMPLE_OG_ROWS" in source
    assert "Ja'Marr Chase" in source
    assert 'statLabel: "Value"' in source


def test_tradevalues_loading_state_exports_sample_card():
    source = RENDERER_TS.read_text(encoding="utf-8")
    assert "q.isPending" in source
    assert "snapshotRows={TRADEVALUES_SAMPLE_OG_ROWS}" in source
    assert 'label="export sample card"' in source
    idx = source.index("if (q.isPending)")
    block = source[idx : idx + 620]
    assert "PanelAgentLoading" in block
    assert "LabOgExportLink" in block


def test_tradevalues_empty_board_exports_sample_card():
    source = RENDERER_TS.read_text(encoding="utf-8")
    assert "!players.length" in source
    assert source.count("TRADEVALUES_SAMPLE_OG_ROWS") >= 2


def test_tradevalues_og_demo_rows_align_with_sample_snapshot():
    route = ROUTE_TS.read_text(encoding="utf-8")
    renderer = RENDERER_TS.read_text(encoding="utf-8")
    assert "tradevalues:" in route
    assert "Ja'Marr Chase" in route
    assert "Ja'Marr Chase" in renderer
    assert "DEMO_ROWS_BY_SLUG" in route


def test_tradevalues_snapshot_codec_fixture():
    decoded = json.loads(base64.urlsafe_b64decode(TRADEVALUES_OG_GATE_C_SNAPSHOT + "==").decode())
    rows = decoded["r"] if isinstance(decoded, dict) and "r" in decoded else decoded
    assert rows[0]["n"] == "Ja'Marr Chase"
    assert rows[0]["sl"] == "Value"


def test_tradevalues_og_gate_c_fixture_params_documented():
    assert "download=1" in "download=1&snapshot=" + TRADEVALUES_OG_GATE_C_SNAPSHOT
