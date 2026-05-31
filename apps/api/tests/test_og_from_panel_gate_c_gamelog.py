"""Gate C curl contract — gamelog + efficiency FROM PANEL snapshot exports (Lab L5)."""

from __future__ import annotations

import base64
import json

# Reality Checker curls these against `next start` on :3000 (see evidence file).
GAMELOG_SNAPSHOT = (
    "W3sibiI6IldrIDE3IiwicCI6IldSIiwidCI6IkNJTiIsInMiOjI4LjQsInNsIjoiUFBSIn0seyJuIjoiV2sgMTYiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MjQuMSwic2wiOiJQUFIifSx7Im4iOiJXayAxNSIsInAiOiJXUiIsInQiOiJDSU4iLCJzIjozMS4yLCJzbCI6IlBQUiJ9LHsibiI6IldrIDE0IiwicCI6IldSIiwidCI6IkNJTiIsInMiOjE5LjgsInNsIjoiUFBSIn0seyJuIjoiV2sgMTMiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MjIuNSwic2wiOiJQUFIifSx7Im4iOiJXayAxMiIsInAiOiJXUiIsInQiOiJDSU4iLCJzIjoxOC4wLCJzbCI6IlBQUiJ9XQ"
)

EFFICIENCY_SNAPSHOT = (
    "W3sibiI6IkJpamFuIFJvYmluc29uIiwicCI6IlJCIiwidCI6IkFUTCIsInMiOjAuODIsInNsIjoiUFBPIn0seyJuIjoiQ2hyaXN0aWFuIE1jQ2FmZnJleSIsInAiOiJSQiIsInQiOiJTRiIsInMiOjAuNzksInNsIjoiUFBPIn0seyJuIjoiSmEnTWFyciBDaGFzZSIsInAiOiJXUiIsInQiOiJDSU4iLCJzIjowLjc2LCJzbCI6IlBQTyJ9LHsibiI6Ikp1c3RpbiBKZWZmZXJzb24iLCJwIjoiV1IiLCJ0IjoiTUlOIiwicyI6MC43NCwic2wiOiJQUE8ifSx7Im4iOiJUcmF2aXMgS2VsY2UiLCJwIjoiVEUiLCJ0IjoiS0MiLCJzIjowLjcxLCJzbCI6IlBQTyJ9LHsibiI6Ikpvc2ggQWxsZW4iLCJwIjoiUUIiLCJ0IjoiQlVGIiwicyI6MC42OCwic2wiOiJQUE8ifV0"
)

DEFAULT_OG_PLAYER_ID = "00-0036900"
GAMELOG_FROM_PANEL_GATE_C_PARAMS = (
    f"download=1&player_id={DEFAULT_OG_PLAYER_ID}&snapshot={GAMELOG_SNAPSHOT}"
)
EFFICIENCY_FROM_PANEL_GATE_C_PARAMS = f"download=1&snapshot={EFFICIENCY_SNAPSHOT}"

MIN_GATE_C_PNG_BYTES = 40_000


def _encode_snapshot(rows: list[dict]) -> str:
    compact = json.dumps(rows, separators=(",", ":"))
    return base64.urlsafe_b64encode(compact.encode()).decode().rstrip("=")


def _decode_snapshot(param: str) -> list[dict]:
    padded = param + "=" * (-len(param) % 4)
    return json.loads(base64.urlsafe_b64decode(padded))


def test_gate_c_snapshot_fixtures_decode_to_six_rows():
    for snapshot in (GAMELOG_SNAPSHOT, EFFICIENCY_SNAPSHOT):
        rows = _decode_snapshot(snapshot)
        assert len(rows) == 6
        for row in rows:
            assert row["n"] and row["p"] and row["sl"]


def test_gamelog_week_rows_use_ppr_label():
    rows = _decode_snapshot(GAMELOG_SNAPSHOT)
    assert all(r["n"].startswith("Wk ") for r in rows)
    assert all(r["sl"] == "PPR" for r in rows)


def test_efficiency_fixture_snapshots_match_encoder():
    efficiency_rows = _decode_snapshot(EFFICIENCY_SNAPSHOT)
    assert EFFICIENCY_SNAPSHOT == _encode_snapshot(efficiency_rows)


def test_gate_c_params_document_download_player_and_snapshot():
    assert "download=1" in GAMELOG_FROM_PANEL_GATE_C_PARAMS
    assert f"player_id={DEFAULT_OG_PLAYER_ID}" in GAMELOG_FROM_PANEL_GATE_C_PARAMS
    assert "snapshot=" in GAMELOG_FROM_PANEL_GATE_C_PARAMS
    assert "download=1" in EFFICIENCY_FROM_PANEL_GATE_C_PARAMS
    assert "snapshot=" in EFFICIENCY_FROM_PANEL_GATE_C_PARAMS


def test_min_gate_c_threshold_documents_factory_dod():
    assert MIN_GATE_C_PNG_BYTES >= 40_000
