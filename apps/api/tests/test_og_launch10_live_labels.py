"""Launch-10 OG panel-native LIVE + SAMPLE label strings (Lab L5)."""

from __future__ import annotations

from pathlib import Path

# Matches switch-based launch10Live* on route.tsx (base PR #1050).
LAUNCH_10_LIVE_SNIPPETS = [
    "live RPS board",
    "live dynasty values",
    "live game log",
    "live PPO board",
    "live roster grades",
    "LIVE · game log",
    "LIVE · roster grades",
]

LAUNCH_10_DEMO_SNIPPETS = [
    "demo game log",
    "demo PPO board",
    "demo aging curve",
    "demo buy/sell board",
    "demo roster grades",
    "SAMPLE · game log",
    "SAMPLE · roster grades",
]


def _og_route_source() -> str:
    path = Path(__file__).resolve().parents[2] / "web" / "app" / "og" / "[panel]" / "route.tsx"
    return path.read_text(encoding="utf-8")


def test_launch10_live_switch_covers_all_ten():
    source = _og_route_source()
    assert "function launch10LiveBlurbSuffix" in source
    assert 'case "dashboard":' in source
    for snippet in LAUNCH_10_LIVE_SNIPPETS:
        assert snippet in source


def test_launch10_demo_gamelog_five_panel_native():
    source = _og_route_source()
    for snippet in LAUNCH_10_DEMO_SNIPPETS:
        assert snippet in source
    assert 'if (slug === "gamelog") return " · demo game log"' in source
