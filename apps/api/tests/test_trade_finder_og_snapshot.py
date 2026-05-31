"""Trade Finder OG snapshot param — in-panel export rows (League L5 atom 2/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_og_snapshot_encode_decode_lib():
    lib = (_repo_root() / "apps/web/lib/bureau-trade-finder-og-snapshot.ts").read_text(
        encoding="utf-8"
    )
    assert "encodeBureauTradeFinderOgSnapshot" in lib
    assert "decodeBureauTradeFinderOgSnapshot" in lib
    assert 'snapshot` query param on `/og/trade-finder`' in lib


def test_trade_finder_route_reads_snapshot_param():
    route = (_repo_root() / "apps/web/app/og/trade-finder/route.tsx").read_text(encoding="utf-8")
    assert "decodeBureauTradeFinderOgSnapshot" in route
    assert 'url.searchParams.get("snapshot")' in route
    assert "fromPanel" in route


def test_trade_finder_share_bar_passes_snapshot():
    bar = (
        _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    ).read_text(encoding="utf-8")
    assert "encodeBureauTradeFinderOgSnapshot" in bar
    assert 'ogParams.set("snapshot", snap)' in bar
