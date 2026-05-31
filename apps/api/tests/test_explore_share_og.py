"""Guards Explore share URLs always carry universe for college OG parity."""

from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
SHARE = REPO / "apps/web/components/explore/ExploreShareButton.tsx"


def _source() -> str:
    return SHARE.read_text(encoding="utf-8")


def test_build_explore_share_params_includes_universe():
    src = _source()
    assert "buildExploreShareParams" in src
    assert 'new URLSearchParams({ universe, sort, dir })' in src


def test_copy_link_uses_canonical_explore_url_not_location_href():
    src = _source()
    assert "buildExplorePageUrl" in src
    assert "window.location.href" not in src


def test_og_export_params_include_universe():
    src = _source()
    assert "buildExploreShareParams(props)" in src
    assert 'ogParams.set("download", "1")' in src
