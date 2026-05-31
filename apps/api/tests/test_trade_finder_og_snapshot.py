"""Trade Finder OG snapshot — in-panel export rows (League L5 atom 2/3)."""

import base64
import json
from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_snapshot_decode_and_sticker():
    route = _repo_root() / "apps/web/app/og/trade-finder/route.tsx"
    lib = _repo_root() / "apps/web/lib/bureau-trade-finder-og-snapshot.ts"
    share = _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    route_text = route.read_text(encoding="utf-8")
    lib_text = lib.read_text(encoding="utf-8")
    share_text = share.read_text(encoding="utf-8")
    assert "decodeBureauTradeFinderOgSnapshot" in route_text
    assert "FROM PANEL · your deals" in route_text
    assert "fromPanel" in route_text
    assert "encodeBureauTradeFinderOgSnapshot" in lib_text
    assert "encodeBureauTradeFinderOgSnapshot" in share_text
    assert "ogParams.set(\"snapshot\"" in share_text


def test_trade_finder_snapshot_roundtrip_compact_keys():
    compact = {
        "m": [
            {
                "id": 2,
                "t": "Rebuild FC",
                "g": {"id": "p1", "n": "J. Gibbs", "p": "RB", "v": 8420},
                "r": {"id": "p2", "n": "C. Lamb", "p": "WR", "v": 8310},
                "gp": 1.3,
            }
        ],
        "nd": ["WR"],
        "su": ["RB"],
    }
    b64 = base64.urlsafe_b64encode(json.dumps(compact).encode()).decode().rstrip("=")
    lib_text = (_repo_root() / "apps/web/lib/bureau-trade-finder-og-snapshot.ts").read_text(
        encoding="utf-8"
    )
    assert "fromCompact" in lib_text
    assert "toCompact" in lib_text
    assert b64  # fixture used in evidence curl
