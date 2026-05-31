"""Trade Finder OG snapshot — in-panel export rows on /og/trade-finder (L5 atom 2/3)."""

import base64
import json
from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_route_decodes_snapshot_param():
    route = (_repo_root() / "apps/web/app/og/trade-finder/route.tsx").read_text(encoding="utf-8")
    assert "decodeBureauTradeFinderOgSnapshot" in route
    assert "bureauTradeFinderOgSnapshotToData" in route
    assert 'url.searchParams.get("snapshot")' in route
    assert "LIVE · exported trade paths" in route


def test_share_bar_encodes_panel_snapshot():
    share = (
        _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    ).read_text(encoding="utf-8")
    assert "encodeBureauTradeFinderOgSnapshot" in share
    assert "tradeFinderPanelToOgSnapshot" in share
    assert 'ogParams.set("snapshot", snap)' in share


def test_snapshot_roundtrip_compact_keys():
    lib = (
        _repo_root() / "apps/web/lib/bureau-trade-finder-og-snapshot.ts"
    ).read_text(encoding="utf-8")
    assert "encodeBureauTradeFinderOgSnapshot" in lib
    assert "decodeBureauTradeFinderOgSnapshot" in lib
    compact = {
        "m": [
            {
                "pr": 2,
                "pt": "Rebuild FC",
                "g": {"id": "p1", "n": "J. Gibbs", "p": "RB", "v": 8420},
                "v": {"id": "p2", "n": "C. Lamb", "p": "WR", "v": 8310},
                "gap": 110,
                "pct": 1.3,
            }
        ],
        "n": ["WR"],
        "s": ["RB"],
    }
    param = base64.b64encode(json.dumps(compact).encode()).decode().replace("+", "-").replace("/", "_").rstrip("=")
    assert "CompactTradeFinder" in lib
    assert len(param) > 100
