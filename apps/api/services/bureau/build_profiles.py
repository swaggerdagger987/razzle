"""Build Profiles — classify every team in the league by archetype."""

from __future__ import annotations

from typing import Any

from ..context.enrich import depth_by_position
from ..context.store import get_or_refresh
from .self_scout import _classify_build


def build_profiles(league_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}
    rows = []
    for r in ctx.rosters:
        user = ctx.user_for_roster(r.roster_id)
        depth = depth_by_position(r.players)
        build = _classify_build(depth, r.players)
        rows.append(
            {
                "roster_id": r.roster_id,
                "team": (user.team_name if user else None) or (user.display_name if user else f"Team {r.roster_id}"),
                "record": f"{r.wins}-{r.losses}-{r.ties}",
                "archetype": build["archetype"],
                "reasoning": build["reasoning"],
            }
        )
    return {"league_id": league_id, "rows": rows}
