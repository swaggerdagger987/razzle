"""Scenario explorer — re-simulate odds after a hypothetical trade."""

from __future__ import annotations

import copy
from typing import Any

from ..context.store import get_or_refresh
from .monte_carlo import _build_by_roster, _league_odds


def _sim_dist(by_roster: dict[int, list[dict[str, Any]]]) -> dict[int, list[dict[str, float]]]:
    return {
        rid: [
            {"mean": p["mean"], "stddev": p["stddev"], "floor": p["floor"], "ceiling": p["ceiling"]}
            for p in players
        ]
        for rid, players in by_roster.items()
    }


def _swap_players(
    by_roster: dict[int, list[dict[str, Any]]],
    my_roster_id: int,
    partner_roster_id: int,
    give_player_id: str,
    get_player_id: str,
) -> bool:
    mine = by_roster.get(my_roster_id) or []
    theirs = by_roster.get(partner_roster_id) or []
    give_idx = next((i for i, p in enumerate(mine) if p["player_id"] == give_player_id), None)
    get_idx = next((i for i, p in enumerate(theirs) if p["player_id"] == get_player_id), None)
    if give_idx is None or get_idx is None:
        return False
    mine[give_idx], theirs[get_idx] = theirs[get_idx], mine[give_idx]
    return True


def scenario_trade(
    league_id: str,
    user_id: str,
    give_player_id: str,
    get_player_id: str,
    partner_roster_id: int,
    scoring: str = "half_ppr",
) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}

    me = ctx.roster_for_user(user_id)
    if not me:
        return {"error": "roster not found"}

    by_roster, manager_names, playoff_spots, _, _ = _build_by_roster(ctx, scoring)
    baseline_champ, baseline_playoff = _league_odds(_sim_dist(by_roster), playoff_spots)

    scenario_roster = copy.deepcopy(by_roster)
    if not _swap_players(scenario_roster, me.roster_id, partner_roster_id, give_player_id, get_player_id):
        return {"error": "players not on expected rosters"}

    scenario_champ, scenario_playoff = _league_odds(_sim_dist(scenario_roster), playoff_spots)

    my_rid = me.roster_id
    give_name = next((p["name"] for p in by_roster[my_rid] if p["player_id"] == give_player_id), give_player_id)
    get_name = next(
        (p["name"] for p in by_roster[partner_roster_id] if p["player_id"] == get_player_id),
        get_player_id,
    )

    return {
        "league_id": league_id,
        "give_player_id": give_player_id,
        "get_player_id": get_player_id,
        "give_name": give_name,
        "get_name": get_name,
        "partner_roster_id": partner_roster_id,
        "partner_team": manager_names.get(partner_roster_id, f"Team {partner_roster_id}"),
        "baseline": {
            "championship_pct": baseline_champ.get(my_rid, 0.0),
            "playoff_pct": baseline_playoff.get(my_rid, 0.0),
        },
        "scenario": {
            "championship_pct": scenario_champ.get(my_rid, 0.0),
            "playoff_pct": scenario_playoff.get(my_rid, 0.0),
        },
        "delta": {
            "championship_pct": round(scenario_champ.get(my_rid, 0.0) - baseline_champ.get(my_rid, 0.0), 1),
            "playoff_pct": round(scenario_playoff.get(my_rid, 0.0) - baseline_playoff.get(my_rid, 0.0), 1),
        },
        "simulations": 2000,
    }
