"""Lab sidebar Staff view — panels grouped by agent owner (hallway H-04)."""

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_lab_sidebar_staff_view_groups_by_agent():
    sidebar = _repo_root() / "apps/web/components/lab/LabSidebar.tsx"
    text = sidebar.read_text(encoding="utf-8")
    assert "STAFF_AGENT_ORDER" in text
    assert "staffByAgent" in text
    assert 'viewMode === "staff"' in text
    assert "lab-sidebar-view-toggle" in text
    assert "agentForPanel(panel.slug)" in text
    assert "staffByAgent.map" in text
    assert "/agents/${agent.avatar}.svg" in text
