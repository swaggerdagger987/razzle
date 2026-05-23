"""Tests for bureau league trade finder."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from apps.api.services.bureau.trade_finder import (
    _need_positions,
    _surplus_positions,
    _value_match,
    trade_finder,
)


def test_value_match_within_gap():
    give = {"dynasty_value": 8000}
    get = {"dynasty_value": 7600}
    assert _value_match(give, get) == (400.0, 5.0)


def test_value_match_rejects_wide_gap():
    give = {"dynasty_value": 8000}
    get = {"dynasty_value": 5000}
    assert _value_match(give, get) is None


def test_surplus_and_need_positions():
    by_pos = {
        "QB": [{"dynasty_value": 1}],
        "RB": [{"dynasty_value": i} for i in range(6)],
        "WR": [{"dynasty_value": i} for i in range(4)],
        "TE": [{"dynasty_value": 1}, {"dynasty_value": 2}],
    }
    assert "RB" in _surplus_positions(by_pos)
    assert "WR" in _need_positions(by_pos)


@patch("apps.api.services.bureau.trade_finder.lookup_players")
@patch("apps.api.services.bureau.trade_finder.get_or_refresh")
def test_trade_finder_returns_matches(mock_refresh, mock_lookup):
    ctx = MagicMock()
    ctx.league_id = "L1"
    ctx.season = 2024

    my = MagicMock()
    my.roster_id = 1
    my.players = ["p1", "p2", "p3"]

    opp = MagicMock()
    opp.roster_id = 2
    opp.players = ["p4", "p5"]

    ctx.rosters = [my, opp]
    ctx.roster_for_user.return_value = my
    user = MagicMock()
    user.team_name = "My Team"
    user.display_name = "me"
    opp_user = MagicMock()
    opp_user.team_name = "Their Team"
    opp_user.display_name = "them"
    ctx.users = [user]
    ctx.user_for_roster.side_effect = lambda rid: user if rid == 1 else opp_user
    mock_refresh.return_value = ctx

    mock_lookup.return_value = {
        "p1": {
            "name": "RB Depth",
            "position": "RB",
            "gsis_id": "g1",
            "terminal": {"dynasty_value": 5000},
        },
        "p2": {"name": "RB2", "position": "RB", "terminal": {"dynasty_value": 4800}},
        "p3": {"name": "RB3", "position": "RB", "terminal": {"dynasty_value": 4600}},
        "p4": {"name": "WR Need", "position": "WR", "terminal": {"dynasty_value": 5100}},
        "p5": {"name": "WR2", "position": "WR", "terminal": {"dynasty_value": 4900}},
    }

    result = trade_finder("L1", "u1")

    assert "matches" in result
    assert result["league_id"] == "L1"
