"""Tests for bureau self-scout depth grades."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from apps.api.services.bureau.self_scout import self_scout


def _mock_ctx(*, league_id: str = "L1", user_id: str = "U1"):
    ctx = MagicMock()
    ctx.league_id = league_id
    ctx.name = "Dynasty League"
    ctx.season = 2024
    ctx.users = [MagicMock(user_id=user_id, team_name="My Squad", display_name="owner")]
    roster = MagicMock()
    roster.roster_id = 1
    roster.user_id = user_id
    roster.wins = 5
    roster.losses = 3
    roster.ties = 0
    roster.points_for = 1200.0
    roster.points_against = 1100.0
    roster.players = ["p1", "p2", "p3"]
    ctx.roster_for_user.return_value = roster
    ctx.rosters = [roster]
    return ctx


@patch("apps.api.services.bureau.self_scout.depth_by_position")
@patch("apps.api.services.bureau.self_scout.get_or_refresh")
def test_self_scout_returns_depth_block(mock_refresh, mock_depth):
    mock_refresh.return_value = _mock_ctx()
    mock_depth.return_value = {
        "QB": {"count": 2, "elite": 1, "depth": [{"player_id": "p1", "name": "QB1", "position": "QB", "dynasty_value": 80}]},
        "RB": {"count": 4, "elite": 2, "depth": []},
        "WR": {"count": 5, "elite": 1, "depth": []},
        "TE": {"count": 1, "elite": 0, "depth": []},
    }

    result = self_scout("L1", "U1")

    assert result["depth"]["RB"]["elite"] == 2
    assert result["build_profile"]["archetype"]
    assert result["power_rank"]["rank"] == 1
    assert isinstance(result["vulnerability_flags"], list)


@patch("apps.api.services.bureau.self_scout.get_or_refresh")
def test_self_scout_missing_user(mock_refresh):
    ctx = _mock_ctx()
    ctx.roster_for_user.return_value = None
    mock_refresh.return_value = ctx

    result = self_scout("L1", "missing")

    assert result["error"] == "user not found in league"
