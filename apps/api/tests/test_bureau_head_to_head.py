"""Tests for bureau head-to-head rivalry."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from apps.api.services.bureau.head_to_head import _default_opponent, _trade_fit, head_to_head


def test_default_opponent_skips_self():
    managers = [{"user_id": "u1", "team": "A"}, {"user_id": "u2", "team": "B"}]
    assert _default_opponent(managers, "u1") == "u2"
    assert _default_opponent(managers, "u2") == "u1"


def test_trade_fit_detects_gaps():
    my_depth = {
        "RB": {"count": 5},
        "WR": {"count": 2},
    }
    their_depth = {
        "RB": {"count": 2},
        "WR": {"count": 5},
    }
    fit = _trade_fit(my_depth, their_depth)
    assert "RB" in fit["you_could_offer"]
    assert "WR" in fit["you_could_target"]


@patch("apps.api.services.bureau.head_to_head.get_or_refresh")
def test_head_to_head_returns_managers_and_compare(mock_refresh):
    ctx = MagicMock()
    ctx.league_id = "L1"

    u1 = MagicMock(user_id="u1", display_name="You", team_name="Your Team")
    u2 = MagicMock(user_id="u2", display_name="Rival", team_name="Rival Team")
    ctx.users = [u1, u2]

    me = MagicMock(owner_id="u1", wins=5, losses=2, ties=0, points_for=900.0, players=["p1"])
    them = MagicMock(owner_id="u2", wins=3, losses=4, ties=0, points_for=700.0, players=["p2"])
    ctx.roster_for_user.side_effect = lambda uid: me if uid == "u1" else them if uid == "u2" else None

    mock_refresh.return_value = ctx

    with patch("apps.api.services.bureau.head_to_head.depth_by_position") as mock_depth:
        mock_depth.side_effect = lambda players: {
            "QB": {"count": 2},
            "RB": {"count": 3},
            "WR": {"count": 4},
            "TE": {"count": 1},
        }

        result = head_to_head("L1", "u1", opponent_user_id="u2")

    assert len(result["managers"]) == 2
    assert result["you"]["team"] == "Your Team"
    assert result["them"]["team"] == "Rival Team"
    assert len(result["position_compare"]) == 4
