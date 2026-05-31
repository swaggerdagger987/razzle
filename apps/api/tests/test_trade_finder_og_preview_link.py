"""Trade Finder share bar — OG preview link contract (League L5 GTM atom 3/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_trade_finder_share_bar_preview_and_export():
    path = _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    text = path.read_text(encoding="utf-8")
    assert "copy card link" in text
    assert "preview card" in text
    assert "previewPath" in text
    assert 'exportParams.set("download", "1")' in text
    assert "/og/trade-finder" in text
    assert "navigator.clipboard" in text


def test_trade_finder_share_bar_snapshot_on_preview():
    path = _repo_root() / "apps/web/components/league/BureauTradeFinderShareBar.tsx"
    text = path.read_text(encoding="utf-8")
    assert "encodeBureauTradeFinderOgSnapshot" in text
    assert 'params.set("snapshot"' in text
