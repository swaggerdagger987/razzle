"""Lab staff sidebar — expanded labPanels registry (Lab L2, H-04)."""

from __future__ import annotations

import re
from pathlib import Path

REGISTRY_TS = (
    Path(__file__).resolve().parents[3] / "packages/agents/registry.ts"
)


def _lab_panels_for_agent(source: str, agent_id: str) -> str:
    pattern = rf'id: "{agent_id}"[\s\S]*?labPanels: \[([\s\S]*?)\]'
    match = re.search(pattern, source)
    return match.group(1) if match else ""


def test_specialist_lab_panels_include_launch10_adjacent_slugs():
    source = REGISTRY_TS.read_text(encoding="utf-8")
    assert "dynasty-comps" in _lab_panels_for_agent(source, "bones")
    assert "tradefinder" in _lab_panels_for_agent(source, "bones")
    assert "strengths" in _lab_panels_for_agent(source, "dolphin")
    assert "leaders" in _lab_panels_for_agent(source, "octo")
    assert "weeklyleaders" in _lab_panels_for_agent(source, "hawkeye")


def test_razzle_lab_panels_stays_minimal():
    source = REGISTRY_TS.read_text(encoding="utf-8")
    razzle_panels = _lab_panels_for_agent(source, "razzle")
    assert "dashboard" in razzle_panels
    assert "dynasty-comps" not in razzle_panels
    assert "breakouts" not in razzle_panels
