"""Lab staff desk registry — launch-10 and coverage guards."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REGISTRY_TS = ROOT / "packages/agents/registry.ts"

LAUNCH_10 = [
    "weekly",
    "prospects",
    "rankings",
    "tradevalues",
    "breakouts",
    "gamelog",
    "efficiency",
    "aging",
    "buysell",
    "monte-carlo",
]

# Panels that may stay on Razzle (cross-room / ops).
RAZZLE_OK = {"dashboard", "screener", "faab"}


def _parse_lab_panel_owners() -> dict[str, str]:
    text = REGISTRY_TS.read_text(encoding="utf-8")
    owners: dict[str, str] = {}
    current_agent: str | None = None
    for line in text.splitlines():
        m_id = re.search(r'id:\s*"(\w+)"', line)
        if m_id and "labPanels" not in line:
            current_agent = m_id.group(1)
        m_panels = re.search(r'labPanels:\s*\[([^\]]*)\]', line)
        if m_panels and current_agent:
            slugs = re.findall(r'"([^"]+)"', m_panels.group(1))
            for slug in slugs:
                owners[slug] = current_agent
        if line.strip().startswith("labPanels:") and "[" in line and "]" not in line:
            continue
    # Multi-line labPanels blocks
    for block in re.finditer(
        r'id:\s*"(\w+)"[\s\S]*?labPanels:\s*\[([\s\S]*?)\]',
        text,
    ):
        agent_id = block.group(1)
        for slug in re.findall(r'"([^"]+)"', block.group(2)):
            owners[slug] = agent_id
    return owners


def test_registry_file_exists():
    assert REGISTRY_TS.is_file()


def test_launch_10_mapped_to_specialists():
    owners = _parse_lab_panel_owners()
    for slug in LAUNCH_10:
        assert slug in owners, f"{slug} missing from labPanels"
        assert owners[slug] != "razzle", f"{slug} should not fall through to Razzle desk"


def test_staff_registry_covers_majority_of_catalog():
    owners = _parse_lab_panel_owners()
    catalog = ROOT / "packages/panels/catalog.ts"
    slugs = set(re.findall(r'slug:\s*"([^"]+)"', catalog.read_text(encoding="utf-8")))
    assigned = sum(1 for s in slugs if owners.get(s) and owners[s] != "razzle")
    # Staff desks should own well over half the catalog (Razzle keeps ops panels only).
    assert assigned >= 55, f"only {assigned}/{len(slugs)} panels on specialist desks"


def test_no_duplicate_panel_slug_across_agents():
    owners = _parse_lab_panel_owners()
    by_slug: dict[str, list[str]] = {}
    for slug, agent in owners.items():
        by_slug.setdefault(slug, []).append(agent)
    dupes = {s: a for s, a in by_slug.items() if len(a) > 1}
    assert not dupes, f"duplicate labPanels entries: {dupes}"
