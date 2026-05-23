"""Smoke tests for panel/analytics API endpoints.

Each test verifies the endpoint returns 200 (or 500 with valid JSON error)
and doesn't crash or hang. Some endpoints require tables that may not
exist in every local DB build (e.g., player_season_stats).
"""

import pytest


def _assert_ok_or_handled_error(resp):
    """Accept 200 (success) or 500 with a JSON error body (graceful failure)."""
    assert resp.status_code in (200, 500), f"Unexpected status {resp.status_code}"
    data = resp.json()
    assert isinstance(data, dict)
    if resp.status_code == 500:
        assert "error" in data


# -- Analytics endpoints --

def test_stat_leaders(client):
    resp = client.get("/api/stat-leaders")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_positional_scarcity(client):
    resp = client.get("/api/positional-scarcity")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_breakout_candidates(client):
    resp = client.get("/api/breakout-candidates")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_buy_sell_candidates(client):
    resp = client.get("/api/buy-sell-candidates")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_aging_curves(client):
    resp = client.get("/api/aging-curves")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_weekly_heatmap(client):
    resp = client.get("/api/weekly-heatmap")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_usage_trends(client):
    resp = client.get("/api/usage-trends")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_air_yards(client):
    resp = client.get("/api/air-yards")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


# -- Dashboard endpoints --

def test_efficiency_rankings(client):
    resp = client.get("/api/efficiency-rankings")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_consistency_rankings(client):
    resp = client.get("/api/consistency-rankings")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_stock_watch(client):
    resp = client.get("/api/stock-watch")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_report_cards(client):
    resp = client.get("/api/report-cards")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_vorp(client):
    resp = client.get("/api/vorp")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_stat_correlations(client):
    resp = client.get("/api/stat-correlations")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


# -- Dynasty endpoints --

def test_trade_value_chart(client):
    resp = client.get("/api/trade-value-chart")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_dynasty_rankings(client):
    resp = client.get("/api/dynasty-rankings")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_dynasty_dashboard(client):
    resp = client.get("/api/dynasty-dashboard")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_tier_list(client):
    resp = client.get("/api/tier-list")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_dynasty_power_rankings(client):
    resp = client.get("/api/dynasty-power-rankings")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


# -- Tool endpoints --

def test_scoring_comparison(client):
    resp = client.get("/api/scoring-comparison")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_cheat_sheet(client):
    resp = client.get("/api/cheat-sheet")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_td_regression(client):
    resp = client.get("/api/td-regression")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_streaks(client):
    resp = client.get("/api/streaks")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_game_script(client):
    resp = client.get("/api/game-script")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_snap_efficiency(client):
    resp = client.get("/api/snap-efficiency")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_workload_monitor(client):
    resp = client.get("/api/workload-monitor")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


def test_garbage_time(client):
    resp = client.get("/api/garbage-time")
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)
