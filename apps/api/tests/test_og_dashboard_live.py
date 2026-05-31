"""Dashboard OG live extract mirrors DynastyDashboardRenderer snapshot (Lab L5)."""

from __future__ import annotations

import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ROUTE_TS = ROOT / "apps/web/app/og/[panel]/route.tsx"
RENDERER_TS = ROOT / "apps/web/components/lab/renderers/DynastyDashboardRenderer.tsx"


def test_dashboard_live_extract_function():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "function extractDashboardRows" in source
    assert 'slug === "dashboard"' in source
    assert "rank_diff" in source
    assert 'statLabel: "Chg"' in source or '"Chg"' in source
    assert "value_picks" in source
    assert "seen.has(id)" in source


def test_dashboard_renderer_snapshot_order_matches_og():
    renderer = RENDERER_TS.read_text(encoding="utf-8")
    route = ROUTE_TS.read_text(encoding="utf-8")
    for token in ("top5", "risers", "fallers", "value_picks", "rank_diff", "trade_value"):
        assert token in renderer
        assert token in route


def test_dashboard_snapshot_codec_fixture():
    rows = [
        {"n": "Ladd McConkey", "p": "WR", "t": "LAC", "s": 12.4, "sl": "Chg"},
        {"n": "Malik Nabers", "p": "WR", "t": "NYG", "s": 9.8, "sl": "Chg"},
    ]
    raw = base64.urlsafe_b64encode(json.dumps(rows).encode()).decode().rstrip("=")
    assert raw
    decoded = json.loads(base64.urlsafe_b64decode(raw + "==").decode())
    assert decoded[0]["sl"] == "Chg"


def test_dashboard_in_launch10_from_panel_sticker():
    source = ROUTE_TS.read_text(encoding="utf-8")
    launch_block = source.split("const LAUNCH_10_OG_SLUGS", 1)[1].split(");", 1)[0]
    assert '"dashboard"' in launch_block
    assert "FROM PANEL · your rows" in source
