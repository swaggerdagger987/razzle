"""Screener snapshot tests — catch upstream data drift in CI.

Why this exists: V1 had a recurring problem where nflverse would publish
a stat correction (e.g. Bijan Robinson 2023 rushing yards) and we'd find
out via a Reddit screenshot. These tests pin the top-N rows of a few
canonical queries so a silent upstream shift triggers a CI red.

Run with `pytest --snapshot-update` after a known-good data refresh.

Note: these tests skip cleanly if terminal.db isn't present, so CI
without the data file still passes.
"""

from __future__ import annotations

import pytest


def _has_terminal_db() -> bool:
    from apps.api.config import get_settings
    return get_settings().terminal_db_path.exists()


pytestmark = pytest.mark.skipif(not _has_terminal_db(), reason="terminal.db not present")


def test_top_qbs_match_snapshot(app_client, snapshot):
    """Top 5 QBs by PPR points last full season — should be stable."""
    r = app_client.post(
        "/api/screener/query",
        json={
            "positions": ["QB"],
            "limit": 5,
            "sort_key": "fantasy_points_ppr",
            "sort_direction": "desc",
            "min_gp": 10,
        },
    )
    assert r.status_code == 200
    items = r.json()["items"]
    summary = [(p["full_name"], round(p["fantasy_points_ppr"], 1)) for p in items]
    assert summary == snapshot


def test_dynasty_top_30_match_snapshot(app_client, snapshot):
    r = app_client.get("/api/dynasty-rankings?limit=30")
    assert r.status_code == 200
    items = r.json()["players"][:30]
    summary = [(p.get("full_name"), p.get("position"), round(float(p.get("dynasty_value", 0)), 1)) for p in items]
    assert summary == snapshot
