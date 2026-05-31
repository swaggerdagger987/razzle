"""Lab sidebar Staff Picks grouped by agent (Lab L2)."""

from __future__ import annotations

from pathlib import Path

from apps.api.tests.test_panel_upgrade_teaser import LAUNCH_10_STAFF_PICK_SLUGS

ROOT = Path(__file__).resolve().parents[3]
SIDEBAR_TS = ROOT / "apps/web/components/lab/LabSidebar.tsx"


def test_staff_picks_grouped_by_agent():
    source = SIDEBAR_TS.read_text(encoding="utf-8")
    assert "staffByAgent" in source
    assert "STAFF_AGENT_ORDER" in source
    assert "lab-sidebar-staff-banner" in source
    assert "lab-sidebar-agent-group" in source
    assert "hideOwnerAvatar" in source
    for slug in LAUNCH_10_STAFF_PICK_SLUGS:
        assert slug in source or "STAFF_PICKS" in source


def test_staff_banner_before_groups():
    source = SIDEBAR_TS.read_text(encoding="utf-8")
    banner = source.index("lab-sidebar-staff-banner")
    groups = source.index("lab-sidebar-staff-group")
    assert banner < groups
