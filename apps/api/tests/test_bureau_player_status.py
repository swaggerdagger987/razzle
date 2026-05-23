"""Tests for bureau player league status."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from apps.api.services.bureau.player_status import player_league_status


def _mock_ctx(*, league_id: str = "L1", user_id: str = "U1", player_on_user: str | None = None):
    ctx = MagicMock()
    ctx.name = "Test League"
    my_roster = MagicMock()
    my_roster.roster_id = 1
    my_roster.players = [player_on_user] if player_on_user else []
    my_roster.starters = [player_on_user] if player_on_user else []
    ctx.roster_for_user.return_value = my_roster
    ctx.rosters = [my_roster]
    ctx.user_for_roster.return_value = MagicMock(team_name="My Team", display_name="owner")
    return ctx


@patch("apps.api.services.bureau.player_status.get_or_refresh")
@patch("apps.api.services.bureau.player_status.gsis_to_sleeper")
def test_player_on_your_roster(mock_gsis, mock_refresh):
    mock_refresh.return_value = _mock_ctx(player_on_user="12345")
    mock_gsis.return_value = "12345"

    result = player_league_status("L1", "U1", "00-0031234")

    assert result["status"] == "yours"
    assert result["starter"] is True


@patch("apps.api.services.bureau.player_status.get_or_refresh")
def test_league_unavailable(mock_refresh):
    mock_refresh.return_value = None
    result = player_league_status("L1", "U1", "12345")
    assert result["error"] == "league context unavailable"
