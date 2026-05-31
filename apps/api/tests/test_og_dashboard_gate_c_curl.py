"""Gate C curl contract — dashboard OG snapshot export (Lab L5)."""

from __future__ import annotations

import base64
import json

# Reality Checker curls against `next start` on :3000 (see evidence file).
DASHBOARD_SNAPSHOT = (
    "W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MTIuNCwic2wiOiJDaGcifSx7Im4iOiJNYWlrbiBOYWJlcnMiLCJwIjoiV1IiLCJ0IjoiTllHIiwicyI6OS44LCJzbCI6IkNoZyJ9LHsibiI6IkRhdmFudGUgQWRhbXMiLCJwIjoiV1IiLCJ0IjoiTllKIiwicyI6LTguMiwic2wiOiJDaGcifSx7Im4iOiJMYWRkIE1jQ29ua2V5IiwicCI6IldSIiwidCI6IkxBQyIsInMiOjEwLjIsInNsIjoiQ2hnIn0seyJuIjoiQnJpYW4gVGhvbWFzIiwicCI6IlJCIiwidCI6IkpBWCIsInMiOjcuMSwic2wiOiJDaGcifSx7Im4iOiJKb25hdGhhbiBUYXlsb3IiLCJwIjoiUkIiLCJ0IjoiSU5EIiwicyI6Ni41LCJzbCI6IkNoZyJ9XQ"
)

DASHBOARD_FROM_PANEL_GATE_C_PARAMS = f"download=1&snapshot={DASHBOARD_SNAPSHOT}"

MIN_GATE_C_PNG_BYTES = 40_000


def _decode_snapshot(param: str) -> list[dict]:
    padded = param + "=" * (-len(param) % 4)
    return json.loads(base64.urlsafe_b64decode(padded))


def test_dashboard_gate_c_fixture_decodes_to_six_rows():
    rows = _decode_snapshot(DASHBOARD_SNAPSHOT)
    assert len(rows) == 6
    for row in rows:
        assert row["n"] and row["p"] and row["t"]


def test_dashboard_gate_c_params_document_download_and_snapshot():
    assert "download=1" in DASHBOARD_FROM_PANEL_GATE_C_PARAMS
    assert "snapshot=" in DASHBOARD_FROM_PANEL_GATE_C_PARAMS
    assert DASHBOARD_SNAPSHOT in DASHBOARD_FROM_PANEL_GATE_C_PARAMS


def test_route_renders_from_panel_sticker_for_dashboard():
    from pathlib import Path

    route = Path(__file__).resolve().parents[3] / "apps/web/app/og/[panel]/route.tsx"
    source = route.read_text(encoding="utf-8")
    assert '"dashboard"' in source.split("const LAUNCH_10_OG_SLUGS", 1)[1].split(");", 1)[0]
    assert "FROM PANEL · your rows" in source
