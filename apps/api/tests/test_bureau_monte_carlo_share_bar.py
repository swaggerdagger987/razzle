"""Bureau Monte Carlo share bar — contract guard for GTM preview export atom."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_bureau_monte_carlo_share_bar_preview_and_export_links():
    share = _repo_root() / "apps/web/components/league/BureauMonteCarloShareBar.tsx"
    text = share.read_text(encoding="utf-8")
    assert "/og/monte-carlo" in text
    assert "preview card" in text
    assert "export card" in text
    assert "previewParams" in text
    assert "previewPath" in text
    assert "exportParams" in text
    assert 'exportParams.set("download", "1")' in text
    assert 'target="_blank"' in text
    assert "copy sim link" in text
    assert "navigator.clipboard" in text


def test_bureau_monte_carlo_wires_share_bar():
    mc = _repo_root() / "apps/web/components/league/BureauMonteCarlo.tsx"
    assert "BureauMonteCarloShareBar" in mc.read_text(encoding="utf-8")
