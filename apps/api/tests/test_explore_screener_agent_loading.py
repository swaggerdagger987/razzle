"""Explore screener loading copy must route through @razzle/agents registry (H-04)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXPLORE_CLIENT = ROOT / "apps" / "web" / "components" / "explore" / "ExplorePageClient.tsx"


def test_explore_screener_uses_registry_loading_copy():
    src = EXPLORE_CLIENT.read_text(encoding="utf-8")
    assert 'universe === "college" ? "hawkeye" : "razzle"' in src
    assert "loadingCopyForAgent(exploreLoadingAgent)" in src
    assert '<LoadingState className="p-8" message={exploreLoadingCopy} />' in src
    assert ': "pulling film..."' not in src.split("exploreLoadingCopy")[0]
