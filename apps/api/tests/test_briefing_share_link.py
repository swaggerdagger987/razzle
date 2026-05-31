"""Briefing share bar — copy-link contract for Room L5 GTM export atom."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_briefing_share_bar_copy_and_export():
    path = _repo_root() / "apps/web/components/room/BriefingShareBar.tsx"
    text = path.read_text(encoding="utf-8")
    assert "copy briefing link" in text
    assert "navigator.clipboard" in text
    assert "/og/briefing" in text
    assert 'exportParams.set("download", "1")' in text
    assert "previewPath" in text


def test_briefing_card_uses_share_bar():
    path = _repo_root() / "apps/web/components/room/BriefingCard.tsx"
    text = path.read_text(encoding="utf-8")
    assert "BriefingShareBar" in text
    assert "copy link" not in text
