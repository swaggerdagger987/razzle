"""Player league status — roster ownership for Player Sheet + agent context."""

from __future__ import annotations

from ..context.enrich import gsis_to_sleeper, lookup_players
from ..context.store import get_or_refresh


def player_league_status(league_id: str, user_id: str, player_id: str) -> dict:
    """Return whether a player (gsis or sleeper id) is on your roster, another team, or FA."""
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league context unavailable"}

    sleeper_id = player_id if _looks_like_sleeper_id(player_id) else gsis_to_sleeper(player_id)
    if not sleeper_id:
        return {
            "player_id": player_id,
            "status": "unknown",
            "message": "player not mapped to Sleeper — connect after sync",
        }

    my_roster = ctx.roster_for_user(user_id)
    if my_roster and sleeper_id in my_roster.players:
        starter = sleeper_id in (my_roster.starters or [])
        return {
            "player_id": player_id,
            "sleeper_id": sleeper_id,
            "status": "yours",
            "starter": starter,
            "team_name": _team_label(ctx, my_roster.roster_id),
            "league_name": ctx.name,
        }

    for roster in ctx.rosters:
        if sleeper_id in roster.players:
            owner = ctx.user_for_roster(roster.roster_id)
            return {
                "player_id": player_id,
                "sleeper_id": sleeper_id,
                "status": "owned",
                "team_name": (owner.team_name if owner else None)
                or (owner.display_name if owner else f"Team {roster.roster_id}"),
                "league_name": ctx.name,
            }

    info = lookup_players([sleeper_id]).get(sleeper_id) or {}
    return {
        "player_id": player_id,
        "sleeper_id": sleeper_id,
        "status": "fa",
        "name": info.get("name"),
        "league_name": ctx.name,
    }


def roster_status_line(league_id: str, user_id: str, player_id: str) -> str | None:
    """One-line markdown for agent prompts."""
    result = player_league_status(league_id, user_id, player_id)
    if result.get("error"):
        return None
    status = result.get("status")
    if status == "yours":
        role = "starter" if result.get("starter") else "bench"
        return f"- Roster: on YOUR team ({role}) in {result.get('league_name')}"
    if status == "owned":
        return f"- Roster: owned by {result.get('team_name')} in {result.get('league_name')}"
    if status == "fa":
        return f"- Roster: free agent in {result.get('league_name')}"
    return None


def _looks_like_sleeper_id(player_id: str) -> bool:
    return player_id.isdigit() and len(player_id) >= 4


def _team_label(ctx, roster_id: int) -> str:
    user = ctx.user_for_roster(roster_id)
    return (user.team_name if user else None) or (user.display_name if user else f"Team {roster_id}")
