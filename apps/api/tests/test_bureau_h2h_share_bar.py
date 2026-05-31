"""Bureau H2H share bar — contract guard for GTM preview export atom."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_bureau_h2h_share_bar_preview_and_export_links():
    share = _repo_root() / "apps/web/components/league/BureauH2HShareBar.tsx"
    text = share.read_text(encoding="utf-8")
    assert "/og/head-to-head" in text
    assert "preview card" in text
    assert "export card" in text
    assert "previewParams" in text
    assert "previewPath" in text
    assert "exportParams" in text
    assert 'exportParams.set("download", "1")' in text
    assert "target=\"_blank\"" in text
    assert "copy card link" in text
    assert "navigator.clipboard" in text


def test_bureau_h2h_copy_link_targets_og_preview():
    share = _repo_root() / "apps/web/components/league/BureauH2HShareBar.tsx"
    text = share.read_text(encoding="utf-8")
    assert 'const previewPath = `/og/head-to-head?' in text
    assert "}, [previewPath]);" in text
    assert "rivalryPath" not in text


def test_bureau_head_to_head_wires_share_bar():
    h2h = _repo_root() / "apps/web/components/league/BureauHeadToHead.tsx"
    assert "BureauH2HShareBar" in h2h.read_text(encoding="utf-8")
