"""Pressure Map OG Bones Room hallway — League L5 Bureau OG epic atom 1/3."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_pressure_map_og_bones_room_hallway():
    og = _repo_root() / "apps/web/app/og/pressure-map/route.tsx"
    in_product = _repo_root() / "apps/web/components/league/BureauPressureMap.tsx"
    og_text = og.read_text(encoding="utf-8")
    product_text = in_product.read_text(encoding="utf-8")
    assert "toRoom(" in og_text
    assert 'agentId: "bones"' in og_text
    assert 'panelSlug: "pressure-map"' in og_text
    assert "bonesPressureMapRoomQuestion" in og_text
    assert "ask ${bones.name}" in og_text
    assert "toLeague(" in og_text
    assert "made with 🐯 razzle.lol" in og_text
    assert "toRoom(" in product_text
    assert "ask Bones about" in product_text
