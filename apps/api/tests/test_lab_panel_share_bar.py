"""Lab panel share bar — GTM copy/preview/export contract."""

from __future__ import annotations

from pathlib import Path


def _read(rel: str) -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / rel).read_text(encoding="utf-8")


def test_lab_panel_share_bar_has_copy_preview_export():
    source = _read("apps/web/components/lab/LabPanelShareBar.tsx")
    assert "copy panel link" in source or "copyLabel" in source
    assert "preview card" in source
    assert "export card" in source
    assert "encodeOgSnapshot" in source
    assert "toLab" in source


def test_dynasty_rankings_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/DynastyRankingsRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy rankings link" in renderer
    assert "snapshotRows={ogSnapshotRows}" in renderer


def test_breakouts_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/BreakoutsRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy breakouts link" in renderer
    assert "<LabOgExportLink" not in renderer


def test_buysell_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/BuySellRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy buy/sell link" in renderer
    assert "<LabOgExportLink" not in renderer


def test_weekly_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/WeeklyHeatmapRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy weekly link" in renderer
    assert "<LabOgExportLink" not in renderer


def test_gamelog_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/GamelogRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy gamelog link" in renderer
    assert "playerId=" in renderer
    assert "<LabOgExportLink" not in renderer


def test_efficiency_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/EfficiencyRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy efficiency link" in renderer
    assert "<LabOgExportLink" not in renderer


def test_aging_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/AgingCurvesRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy aging link" in renderer
    assert "<LabOgExportLink" not in renderer


def test_tradevalues_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/TradeValuesRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy trade values link" in renderer
    assert "<LabOgExportLink" not in renderer


def test_prospects_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/ProspectsRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy prospects link" in renderer
    assert "<LabOgExportLink" not in renderer


def test_dynasty_dashboard_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/DynastyDashboardRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy dashboard link" in renderer
    assert "<LabOgExportLink" not in renderer


def test_dynasty_comps_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/DynastyCompsRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy dynasty comps link" in renderer
    assert "<LabOgExportLink" not in renderer


def test_dashboard_renderer_uses_share_bar():
    renderer = _read("apps/web/components/lab/renderers/DashboardRenderer.tsx")
    assert "LabPanelShareBar" in renderer
    assert "copy dynasty comps link" in renderer
    assert "<LabOgExportLink" not in renderer
