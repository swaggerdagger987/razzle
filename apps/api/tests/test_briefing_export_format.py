"""Briefing export formatter — mirrors apps/web/lib/format-briefing-export.ts."""

from __future__ import annotations

import re
from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def test_format_briefing_export_ts_exports_function() -> None:
    path = _repo_root() / "apps/web/lib/format-briefing-export.ts"
    text = path.read_text(encoding="utf-8")
    assert "export function formatBriefingForExport" in text
    assert "*${urgency}*" in text or "urgency" in text
    assert "Situation Room" in text


def test_briefing_card_has_copy_button() -> None:
    path = _repo_root() / "apps/web/components/room/BriefingCard.tsx"
    text = path.read_text(encoding="utf-8")
    assert "copy for Slack/Reddit" in text
    assert "formatBriefingForExport" in text
    assert re.search(r"navigator\.clipboard\.writeText", text)
