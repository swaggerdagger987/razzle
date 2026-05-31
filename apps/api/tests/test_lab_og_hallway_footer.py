"""Lab panel OG — hallway deep link in terracotta footer (Lab L5)."""

from pathlib import Path


def _route_source() -> str:
    return (
        Path(__file__).resolve().parents[3]
        / "apps/web/app/og/[panel]/route.tsx"
    ).read_text(encoding="utf-8")


def test_panel_og_lab_watermark_uses_to_lab():
    source = _route_source()
    assert "function labOgWatermarkLink" in source
    assert "toLab(" in source
    assert "leadName" in source
    assert "${labLink} · open in Lab" in source
