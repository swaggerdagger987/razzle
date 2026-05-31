"""Lab staff sidebar — labPanels registry covers catalog (Lab L2 atom 2)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CATALOG = ROOT / "packages/panels/catalog.ts"
REGISTRY = ROOT / "packages/agents/registry.ts"


def _catalog_slugs() -> set[str]:
    return set(re.findall(r'slug: "([^"]+)"', CATALOG.read_text(encoding="utf-8")))


def _lab_panel_owners() -> dict[str, str]:
    text = REGISTRY.read_text(encoding="utf-8")
    owners: dict[str, str] = {}
    for block in re.finditer(
        r'id: "(razzle|dolphin|hawkeye|bones|octo|atlas)".*?labPanels: \[(.*?)\]',
        text,
        re.S,
    ):
        agent_id = block.group(1)
        for slug in re.findall(r'"([^"]+)"', block.group(2)):
            owners[slug] = agent_id
    return owners


def test_launch10_panels_have_non_razzle_owner():
    owners = _lab_panel_owners()
    launch10 = {
        "weekly",
        "prospects",
        "rankings",
        "tradevalues",
        "breakouts",
        "gamelog",
        "efficiency",
        "aging",
        "buysell",
    }
    for slug in launch10:
        assert slug in owners
        assert owners[slug] != "razzle"
    assert owners["dashboard"] == "razzle"


def test_razzle_catch_all_under_cap():
    owners = _lab_panel_owners()
    catalog = _catalog_slugs()
    razzle_slugs = [s for s in catalog if owners.get(s) == "razzle"]
    assert len(razzle_slugs) <= 8, f"too many Razzle panels: {razzle_slugs}"


def test_catalog_panels_mostly_assigned():
    owners = _lab_panel_owners()
    catalog = _catalog_slugs()
    unassigned = catalog - set(owners)
    assert len(unassigned) == 0, f"unassigned: {sorted(unassigned)[:10]}"
    assert len(owners) >= 90
