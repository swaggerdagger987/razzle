"""Tests for bureau scenario trade re-simulation."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from apps.api.services.bureau.scenario_trade import _swap_players, scenario_trade


def test_swap_players_exchanges_entries():
    by_roster = {
        1: [{"player_id": "a", "mean": 10.0}],
        2: [{"player_id": "b", "mean": 12.0}],
    }
    assert _swap_players(by_roster, 1, 2, "a", "b") is True
    assert by_roster[1][0]["player_id"] == "b"
    assert by_roster[2][0]["player_id"] == "a"


@patch("apps.api.services.bureau.scenario_trade._build_by_roster")
@patch("apps.api.services.bureau.scenario_trade.get_or_refresh")
def test_scenario_trade_returns_delta(mock_refresh, mock_build):
    ctx = MagicMock()
    me = MagicMock(roster_id=1)
    ctx.roster_for_user.return_value = me
    mock_refresh.return_value = ctx

    by_roster = {
        1: [{"player_id": "p1", "name": "Give", "mean": 10, "stddev": 2, "floor": 5, "ceiling": 15}],
        2: [{"player_id": "p2", "name": "Get", "mean": 14, "stddev": 2, "floor": 7, "ceiling": 20}],
    }
    mock_build.return_value = (by_roster, {1: "You", 2: "Partner"}, 6, 2, [])

    result = scenario_trade("L1", "u1", "p1", "p2", 2)

    assert result["give_name"] == "Give"
    assert result["get_name"] == "Get"
    assert "delta" in result
    assert "baseline" in result
    assert "scenario" in result
