"""College screener API tests."""

from __future__ import annotations


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
