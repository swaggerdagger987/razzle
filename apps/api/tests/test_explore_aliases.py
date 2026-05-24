"""Explore API aliases — keep namespaced frontend contracts stable."""

from __future__ import annotations

from apps.api.routers import explore as explore_router


def test_explore_query_alias_uses_screener_contract(app_client, monkeypatch):
    def fake_run_screener(body):
        assert body.limit == 3
        assert body.universe == "college"
        return {
            "items": [],
            "count": 0,
            "season": body.season,
            "universe": body.universe,
        }

    monkeypatch.setattr(explore_router, "run_screener", fake_run_screener)

    r = app_client.post(
        "/api/explore/query",
        json={"limit": 3, "universe": "college", "sort_key": "total_yards"},
    )

    assert r.status_code == 200, r.text
    assert r.json() == {
        "items": [],
        "count": 0,
        "season": 0,
        "universe": "college",
    }


def test_explore_filter_options_alias(app_client, monkeypatch):
    monkeypatch.setattr(
        explore_router,
        "get_filter_options",
        lambda: {"positions": ["QB"], "teams": ["CIN"], "seasons": [2024]},
    )

    r = app_client.get("/api/explore/filter-options")

    assert r.status_code == 200, r.text
    assert r.json() == {"positions": ["QB"], "teams": ["CIN"], "seasons": [2024]}
