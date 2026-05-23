"""Tests for bureau manager behavioral profiles."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from apps.api.services.bureau.manager_profiles import _classify_archetype, manager_profiles


def test_classify_panic_seller():
    tag = _classify_archetype(
        {"total": 12, "moves_per_season": 12.0, "panic_score": 60, "adds": 5, "drops": 7}
    )
    assert tag == "PANIC SELLER"


def test_classify_hoarder():
    tag = _classify_archetype(
        {"total": 4, "moves_per_season": 3.0, "panic_score": 0, "adds": 6, "drops": 2}
    )
    assert tag == "HOARDER"


@patch("apps.api.services.bureau.manager_profiles.get_or_refresh")
def test_manager_profiles_returns_archetypes(mock_refresh):
    ctx = MagicMock()
    ctx.league_id = "L1"
    ctx.season = 2024
    ctx.transactions = [
        {
            "type": "trade",
            "status": "complete",
            "leg": 3,
            "roster_ids": [1],
            "adds": {"1": "p1"},
            "drops": {"1": "p2"},
        },
        {
            "type": "waiver",
            "status": "complete",
            "leg": 3,
            "roster_ids": [1],
            "adds": {"1": "p3"},
            "drops": {},
        },
        {
            "type": "waiver",
            "status": "complete",
            "leg": 3,
            "roster_ids": [1],
            "adds": {"1": "p4"},
            "drops": {},
        },
    ]
    roster = MagicMock()
    roster.roster_id = 1
    roster.wins = 4
    roster.losses = 2
    roster.ties = 0
    ctx.rosters = [roster]
    user = MagicMock()
    user.team_name = "Panic Squad"
    user.display_name = "owner"
    ctx.user_for_roster.return_value = user
    mock_refresh.return_value = ctx

    result = manager_profiles("L1")

    assert result["rows"][0]["team"] == "Panic Squad"
    assert result["rows"][0]["archetype"] in ("PANIC SELLER", "AGGRESSIVE", "PATIENT", "STEADY", "HOARDER")
    assert result["rows"][0]["exploit_window"]
