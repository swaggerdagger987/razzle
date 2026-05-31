"""Bureau H2H OG snapshot — EXPORTED trust sticker (League L5 GTM epic atom 1/3)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_h2h_og_route_shows_exported_sticker_for_snapshot():
    route = _repo_root() / "apps/web/app/og/head-to-head/route.tsx"
    text = route.read_text(encoding="utf-8")
    assert 'searchParams.get("snapshot")' in text
    assert "decodeBureauH2HOgSnapshot" in text
    assert "EXPORTED · panel rivalry rows" in text
    assert "isSnapshot ?" in text


def test_h2h_share_bar_sets_snapshot_on_export():
    bar = _repo_root() / "apps/web/components/league/BureauH2HShareBar.tsx"
    text = bar.read_text(encoding="utf-8")
    assert "encodeBureauH2HOgSnapshot" in text
    assert 'ogParams.set("snapshot"' in text
