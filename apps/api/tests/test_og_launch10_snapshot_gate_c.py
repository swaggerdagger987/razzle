"""Gate C fixture params for Launch-10 OG snapshot exports (prospects + tradevalues)."""

from __future__ import annotations

import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

# Documented curl targets — Reality Checker uses these on localhost:3000.
# Compact array payloads — matches LabOgExportLink.encodeOgSnapshot (max 6 rows).
PROSPECTS_OG_GATE_C_SNAPSHOT = (
    "W3sibiI6IlRyYXZpcyBIdW50ZXIiLCJwIjoiV1IiLCJ0IjoiSkFYIiwicyI6OTQsInNsIjoiU2NvcmUifV0"
)
TRADEVALUES_OG_GATE_C_SNAPSHOT = (
    "W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MTAyMDAsInNsIjoiVmFsdWUifV0"
)

PROSPECTS_OG_GATE_C_PARAMS = f"download=1&snapshot={PROSPECTS_OG_GATE_C_SNAPSHOT}"
TRADEVALUES_OG_GATE_C_PARAMS = f"download=1&snapshot={TRADEVALUES_OG_GATE_C_SNAPSHOT}"


def _decode_compact_snapshot(param: str) -> list[dict]:
    b64 = param.replace("-", "+").replace("_", "/")
    pad = "=" * (-len(b64) % 4)
    return json.loads(base64.b64decode(b64 + pad).decode("utf-8"))


def test_prospects_snapshot_fixture_decodes_travis_hunter_row():
    rows = _decode_compact_snapshot(PROSPECTS_OG_GATE_C_SNAPSHOT)
    assert isinstance(rows, list)
    assert len(rows) == 1
    assert rows[0]["n"] == "Travis Hunter"
    assert rows[0]["p"] == "WR"
    assert rows[0]["sl"] == "Score"


def test_tradevalues_snapshot_fixture_decodes_chase_value_row():
    rows = _decode_compact_snapshot(TRADEVALUES_OG_GATE_C_SNAPSHOT)
    assert isinstance(rows, list)
    assert len(rows) == 1
    assert rows[0]["n"] == "Ja'Marr Chase"
    assert rows[0]["s"] == 10200
    assert rows[0]["sl"] == "Value"


def test_prospects_renderer_passes_snapshot_rows_to_export_link():
    text = (ROOT / "apps/web/components/lab/renderers/ProspectsRenderer.tsx").read_text(
        encoding="utf-8"
    )
    assert 'slug="prospects"' in text
    assert "snapshotRows={ogSnapshotRows}" in text


def test_tradevalues_renderer_passes_snapshot_rows_to_export_link():
    text = (ROOT / "apps/web/components/lab/renderers/TradeValuesRenderer.tsx").read_text(
        encoding="utf-8"
    )
    assert 'slug="tradevalues"' in text
    assert "snapshotRows={ogSnapshotRows}" in text


def test_gate_c_fixture_params_documented_for_reality_curl():
    assert "download=1" in PROSPECTS_OG_GATE_C_PARAMS
    assert PROSPECTS_OG_GATE_C_SNAPSHOT in PROSPECTS_OG_GATE_C_PARAMS
    assert "download=1" in TRADEVALUES_OG_GATE_C_PARAMS
    assert TRADEVALUES_OG_GATE_C_SNAPSHOT in TRADEVALUES_OG_GATE_C_PARAMS
