"""Tests for bureau trade deadline pressure map."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from apps.api.services.bureau.pressure_map import _label, _pressure_score, pressure_map


def test_pressure_score_losing_record():
    assert _pressure_score(2, 8, 0, 0) >= 35


def test_pressure_score_winning_record():
    assert _pressure_score(8, 2, 0, 0) < 35


def test_label_tiers():
    assert _label(70) == "desperate"
    assert _label(40) == "motivated"
    assert _label(10) == "comfortable"


@patch("apps.api.services.bureau.pressure_map.get_or_refresh")
def test_pressure_map_sorted(mock_refresh):
    ctx = MagicMock()
    ctx.league_id = "L1"
    ctx.season = 2024
    ctx.transactions = []

    roster_a = MagicMock()
    roster_a.roster_id = 1
    roster_a.wins = 1
    roster_a.losses = 9
    roster_a.ties = 0

    roster_b = MagicMock()
    roster_b.roster_id = 2
    roster_b.wins = 9
    roster_b.losses = 1
    roster_b.ties = 0

    ctx.rosters = [roster_b, roster_a]
    user_a = MagicMock()
    user_a.team_name = "Desperate Dave"
    user_a.display_name = "dave"
    user_b = MagicMock()
    user_b.team_name = "Comfortable Kevin"
    user_b.display_name = "kevin"

    def user_for_roster(rid):
        return user_a if rid == 1 else user_b

    ctx.user_for_roster.side_effect = user_for_roster
    mock_refresh.return_value = ctx

    result = pressure_map("L1")

    assert result["rows"][0]["team"] == "Desperate Dave"
    assert result["rows"][0]["score"] > result["rows"][1]["score"]
    assert result["hero_manager"] == "Desperate Dave"
