"""Explore share toolbar must pass universe into OG preview + export URLs (Explore L5)."""

from __future__ import annotations

from pathlib import Path

COLLEGE_OG_GATE_C_PARAMS = (
    "universe=college&sort=total_yards&dir=desc&download=1&force_demo=1"
)


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _explore_share_source() -> str:
    root = _repo_root()
    return (root / "apps/web/components/explore/ExploreShareButton.tsx").read_text(
        encoding="utf-8"
    )


def _explore_og_route_source() -> str:
    return (_repo_root() / "apps/web/app/og/explore/route.tsx").read_text(encoding="utf-8")


def test_explore_share_og_params_include_universe():
    source = _explore_share_source()
    assert 'new URLSearchParams({ sort, dir })' in source
    assert 'universe === "college"' in source
    assert 'previewParams.set("universe", "college")' in source
    assert "/og/explore?" in source
    assert 'ogParams.set("download", "1")' in source


def test_explore_share_nfl_og_omits_default_universe():
    source = _explore_share_source()
    assert 'previewParams.set("universe", "nfl")' not in source


def test_explore_share_college_export_filename():
    source = _explore_share_source()
    assert 'universe === "college"' in source
    assert "razzle-college-screener.png" in source
    assert "razzle-explore.png" in source


def test_explore_og_college_demo_fallback_for_gate_c():
    """College OG must render demo rows when API empty — FACTORY-DOD Gate C."""
    source = _explore_og_route_source()
    assert "DEMO_COLLEGE_ROWS" in source
    assert "demoRowsForExplore" in source
    assert "SAMPLE" in source
    assert "force_demo" in source


def test_explore_og_gate_c_fixture_params_documented():
    assert "universe=college" in COLLEGE_OG_GATE_C_PARAMS
    assert "download=1" in COLLEGE_OG_GATE_C_PARAMS
    assert "force_demo=1" in COLLEGE_OG_GATE_C_PARAMS
