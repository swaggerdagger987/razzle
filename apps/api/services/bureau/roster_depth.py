"""Roster Depth — count + tier players by position for a given roster."""

from __future__ import annotations

from typing import Any

from ..context.enrich import depth_by_position
from ..context.store import get_or_refresh


def roster_depth(league_id: str, user_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found", "league_id": league_id}
    roster = ctx.roster_for_user(user_id)
    if not roster:
        return {"error": "roster not found"}
    return {
        "user_id": user_id,
        "league_id": league_id,
        "depth": depth_by_position(roster.players),
        "starters": roster.starters,
        "total_players": len(roster.players),
    }
