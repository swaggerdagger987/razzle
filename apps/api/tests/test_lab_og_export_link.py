"""Lab OG export link matches Bureau chunky share pattern (Lab L5)."""

from pathlib import Path


def _export_link_source() -> str:
    root = Path(__file__).resolve().parents[3]
    return (root / "apps/web/components/lab/LabOgExportLink.tsx").read_text(encoding="utf-8")


def test_lab_og_export_link_uses_chunky_button_classes():
    source = _export_link_source()
    assert "btn-chunky active text-xs" in source
    assert "var(--orange)" in source
    assert "text-ink-medium underline" not in source
