"""Briefing OG route — contract guard for Room L5 export atom."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_briefing_og_route_exists():
    path = _repo_root() / "apps/web/app/og/briefing/route.tsx"
    assert path.is_file()
    text = path.read_text(encoding="utf-8")
    assert "export async function GET" in text
    assert "DEMO" in text
    assert "ImageResponse" in text


def test_briefing_card_export_link():
    path = _repo_root() / "apps/web/components/room/BriefingCard.tsx"
    text = path.read_text(encoding="utf-8")
    assert "/og/briefing" in text
    assert "export card" in text
