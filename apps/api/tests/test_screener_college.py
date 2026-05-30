"""College screener API tests."""

from __future__ import annotations

import pytest


def _has_terminal_db() -> bool:
    from apps.api.config import get_settings
    return get_settings().terminal_db_path.exists()


pytestmark = pytest.mark.skipif(not _has_terminal_db(), reason="terminal.db not present")


def test_college_screener_returns_universe(app_client):
    r = app_client.post(
        "/api/screener/query",
        json={
            "universe": "college",
            "limit": 10,
            "sort_key": "total_yards",
            "sort_direction": "desc",
        },
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["universe"] == "college"
    assert "items" in data
    assert "count" in data


def test_nfl_screener_default_universe(app_client):
    r = app_client.post("/api/screener/query", json={"limit": 5})
    assert r.status_code == 200, r.text
    assert r.json().get("universe", "nfl") == "nfl"
