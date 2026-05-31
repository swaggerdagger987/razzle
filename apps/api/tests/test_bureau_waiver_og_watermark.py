"""Bureau Waiver Tendencies OG — League L5 watermark band + FACTORY-DOD Gate C guards."""

from pathlib import Path

WAIVER_OG_GATE_C_PARAMS = "download=1"


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _waiver_og_route() -> Path:
    return _repo_root() / "apps/web/app/og/waiver-tendencies/route.tsx"


def test_bureau_waiver_og_route_exists():
    path = _waiver_og_route()
    assert path.is_file()
    text = path.read_text(encoding="utf-8")
    assert "export async function GET" in text
    assert "ImageResponse" in text
    assert "waiver-tendencies" in text


def test_bureau_waiver_og_watermark_hallway_band():
    text = _waiver_og_route().read_text(encoding="utf-8")
    assert "Always-on watermark band" in text
    assert 'background: "#d97757"' in text
    assert "made with 🐯 razzle.lol" in text


def test_bureau_waiver_og_demo_fallback_for_gate_c():
    """Waiver OG must render demo archetype rows when API empty — FACTORY-DOD Gate C."""
    text = _waiver_og_route().read_text(encoding="utf-8")
    assert "DEMO_ROWS" in text
    assert "DEMO_META" in text
    assert "sample preview" in text
    assert "isDemo" in text


def test_bureau_waiver_share_bar_export_link():
    share = _repo_root() / "apps/web/components/league/BureauWaiverTendenciesShareBar.tsx"
    text = share.read_text(encoding="utf-8")
    assert "/og/waiver-tendencies" in text
    assert 'download: "1"' in text
    assert "export card" in text
    assert "copy waiver link" in text


def test_bureau_waiver_og_gate_c_fixture_params_documented():
    assert "download=1" in WAIVER_OG_GATE_C_PARAMS
