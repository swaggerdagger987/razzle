"""Trade Finder OG snapshot — in-panel export rows encode/decode (League L5 atom 2/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_snapshot_encode_decode_lib():
    lib = _repo_root() / "apps/web/lib/bureau-trade-finder-og-snapshot.ts"
    text = lib.read_text(encoding="utf-8")
    assert "encodeBureauTradeFinderOgSnapshot" in text
    assert "decodeBureauTradeFinderOgSnapshot" in text
    assert "bureauTradeFinderOgSnapshotToData" in text


def test_trade_finder_og_route_reads_snapshot_param():
    route = _repo_root() / "apps/web/app/og/trade-finder/route.tsx"
    text = route.read_text(encoding="utf-8")
    assert 'searchParams.get("snapshot")' in text
    assert "decodeBureauTradeFinderOgSnapshot" in text
    assert "EXPORTED · panel trade rows" in text


def test_trade_finder_share_bar_sets_snapshot():
    bar = _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    text = bar.read_text(encoding="utf-8")
    assert "encodeBureauTradeFinderOgSnapshot" in text
    assert 'ogParams.set("snapshot"' in text
