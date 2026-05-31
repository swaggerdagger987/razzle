"""Trade Finder OG watermark — League hallway deep link + LIVE/SAMPLE stickers (L5 atom 1/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_watermark_hallway_band():
    path = _repo_root() / "apps/web/app/og/trade-finder/route.tsx"
    text = path.read_text(encoding="utf-8")
    assert "Always-on watermark band" in text
    assert "toLeague(" in text
    assert 'background: "#d97757"' in text
    assert "LIVE · Sleeper trade paths" in text
    assert "SAMPLE · demo trade rows" in text
    assert "resolveApiOrigin" in text


def test_trade_finder_og_snapshot_from_panel():
    route = _repo_root() / "apps/web/app/og/trade-finder/route.tsx"
    lib = _repo_root() / "apps/web/lib/bureau-trade-finder-og-snapshot.ts"
    share = _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    route_text = route.read_text(encoding="utf-8")
    lib_text = lib.read_text(encoding="utf-8")
    share_text = share.read_text(encoding="utf-8")
    assert "decodeBureauTradeFinderOgSnapshot" in route_text
    assert "FROM PANEL · exported trades" in route_text
    assert "encodeBureauTradeFinderOgSnapshot" in lib_text
    assert 'ogParams.set("snapshot"' in share_text
