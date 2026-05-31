"""Gate C curl contract — breakouts + buysell FROM PANEL snapshot exports (Lab L5)."""

from __future__ import annotations

import base64
import json

# Reality Checker curls these against `next start` on :3000 (see evidence file).
BREAKOUTS_SNAPSHOT = (
    "W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6ODguMiwic2wiOiJSQlMifSx7Im4iOiJCcmlhbiBUaG9tYXMiLCJwIjoiV1IiLCJ0IjoiSkFYIiwicyI6ODUuMSwic2wiOiJSQlMifSx7Im4iOiJKb25hdGhhbiBUYXlsb3IiLCJwIjoiUkIiLCJ0IjoiSU5EIiwicyI6ODIuNCwic2wiOiJSQlMifSx7Im4iOiJEZXJyaWNrIEhlbnJ5IiwicCI6IlJCIiwidCI6IkJBTCIsInMiOjgwLjMsInNsIjoiUkJTIn0seyJuIjoiQnJhbmRvbiBKYWNvYnMiLCJwIjoiUkIiLCJ0IjoiTllHIiwicyI6NzguOSwic2wiOiJSQlMifSx7Im4iOiJKb3NoIEphY29icyIsInAiOiJSQiIsInQiOiJOWUciLCJzIjo3Ni41LCJzbCI6IlJCUyJ9XQ"
)

BUYSELL_SNAPSHOT = (
    "W3sibiI6Ikpvc2ggQWxsZW4iLCJwIjoiUUIiLCJ0IjoiQlVGIiwicyI6OTUuMiwic2wiOiJNaXNtYXRjaCJ9LHsibiI6IkpvcmRhbiBMb3ZlIiwicCI6IlFCIiwidCI6IkdCIiwicyI6OTIuMSwic2wiOiJNaXNtYXRjaCJ9LHsibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6OTguNSwic2wiOiJNaXNtYXRjaCJ9LHsibiI6IkJyaWFuIFRob21hcyIsInAiOiJXUiIsInQiOiJXQVMiLCJzIjo0Mi4zLCJzbCI6Ik1pc21hdGNoIn0seyJuIjoiQnJhbmRvbiBBaXl1ayIsInAiOiJXUiIsInQiOiJTRiIsInMiOjQxLjgsInNsIjoiTWlzbWF0Y2gifSx7Im4iOiJCcnljZSBIYWxsIiwicCI6IlRFIiwidCI6Ik5ZSiIsInMiOjQwLjEsInNsIjoiTWlzbWF0Y2gifV0"
)

BREAKOUTS_FROM_PANEL_GATE_C_PARAMS = f"download=1&snapshot={BREAKOUTS_SNAPSHOT}"
BUYSELL_FROM_PANEL_GATE_C_PARAMS = f"download=1&snapshot={BUYSELL_SNAPSHOT}"

MIN_GATE_C_PNG_BYTES = 40_000


def _encode_snapshot(rows: list[dict]) -> str:
    compact = json.dumps(rows, separators=(",", ":"))
    return base64.urlsafe_b64encode(compact.encode()).decode().rstrip("=")


def _decode_snapshot(param: str) -> list[dict]:
    padded = param + "=" * (-len(param) % 4)
    return json.loads(base64.urlsafe_b64decode(padded))


def test_gate_c_snapshot_fixtures_decode_to_six_rows():
    for snapshot in (BREAKOUTS_SNAPSHOT, BUYSELL_SNAPSHOT):
        rows = _decode_snapshot(snapshot)
        assert len(rows) == 6
        for row in rows:
            assert row["n"] and row["p"] and row["t"]


def test_gate_c_params_document_download_and_snapshot():
    for params in (BREAKOUTS_FROM_PANEL_GATE_C_PARAMS, BUYSELL_FROM_PANEL_GATE_C_PARAMS):
        assert "download=1" in params
        assert "snapshot=" in params


def test_breakouts_and_buysell_fixture_snapshots_match_encoder():
    breakouts_rows = _decode_snapshot(BREAKOUTS_SNAPSHOT)
    buysell_rows = _decode_snapshot(BUYSELL_SNAPSHOT)
    assert BREAKOUTS_SNAPSHOT == _encode_snapshot(breakouts_rows)
    assert BUYSELL_SNAPSHOT == _encode_snapshot(buysell_rows)


def test_min_gate_c_threshold_documents_factory_dod():
    assert MIN_GATE_C_PNG_BYTES >= 40_000
