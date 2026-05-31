"""Bureau H2H ShareBar — preview + export OG contract (League L5 GTM)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_bureau_h2h_share_bar_preview_and_export():
    text = (_repo_root() / "apps/web/components/league/BureauH2HShareBar.tsx").read_text(
        encoding="utf-8"
    )
    assert "preview card" in text
    assert "export card" in text
    assert "previewParams" in text
    assert 'ogParams.set("download", "1")' in text
    assert "/og/head-to-head?" in text
