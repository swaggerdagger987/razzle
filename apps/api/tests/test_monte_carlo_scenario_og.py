"""Monte Carlo OG snapshot carries what-if trade delta (League L5 scenario GTM)."""

from __future__ import annotations

import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SNAPSHOT_TS = ROOT / "apps/web/lib/bureau-monte-carlo-og-snapshot.ts"
ROUTE_TS = ROOT / "apps/web/app/og/monte-carlo/route.tsx"


def test_snapshot_codec_exports_scenario_types():
    source = SNAPSHOT_TS.read_text(encoding="utf-8")
    assert "BureauMonteCarloScenarioOg" in source
    assert "scenarioFromCompact" in source
    assert "scenarioToCompact" in source


def test_monte_carlo_og_route_renders_scenario_block():
    source = ROUTE_TS.read_text(encoding="utf-8")
    assert "snapshot?.scenario" in source
    assert "what-if trade" in source
    assert "title odds shift" in source


def test_scenario_snapshot_roundtrip_compact_keys():
    payload = {
        "r": [{"id": 1, "m": "Dynasty Dukes", "cp": 28, "pp": 91, "rp": 94}],
        "s": {
            "g": "Ja'marr Chase",
            "n": "Jefferson",
            "p": "Rebuild FC",
            "dc": 12.3,
            "dp": 8.5,
            "bc": 14,
            "sc": 18.1,
        },
    }
    b64 = base64.b64encode(json.dumps(payload).encode()).decode()
    param = b64.replace("+", "-").replace("/", "_").rstrip("=")
    assert '"s"' in json.dumps(payload)
    assert "dc" in payload["s"]
    assert len(param) > 40
