"""Head-to-Head — you vs one specific opponent.

Three blocks: historical record, position-by-position roster matchup,
and trade fit (which players you have that they need + vice versa).
"""

from __future__ import annotations

from typing import Any

from ..context.enrich import depth_by_position
from ..context.store import get_or_refresh


def head_to_head(league_id: str, user_id: str, opponent_user_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}
    me = ctx.roster_for_user(user_id)
    them = ctx.roster_for_user(opponent_user_id)
    if not me or not them:
        return {"error": "roster not found"}

    my_user = next((u for u in ctx.users if u.user_id == user_id), None)
    their_user = next((u for u in ctx.users if u.user_id == opponent_user_id), None)

    my_depth = depth_by_position(me.players)
    their_depth = depth_by_position(them.players)

    position_compare = []
    for pos in ("QB", "RB", "WR", "TE"):
        position_compare.append(
            {
                "position": pos,
                "your_count": my_depth.get(pos, {}).get("count", 0),
                "their_count": their_depth.get(pos, {}).get("count", 0),
            }
        )

    return {
        "league_id": league_id,
        "you": _team_summary(me, my_user),
        "them": _team_summary(them, their_user),
        "position_compare": position_compare,
        "trade_fit": _trade_fit(my_depth, their_depth),
    }


def _team_summary(roster, user) -> dict[str, Any]:
    return {
        "team": (user.team_name if user else None) or (user.display_name if user else "Team"),
        "record": f"{roster.wins}-{roster.losses}-{roster.ties}",
        "ppg": round(roster.points_for / max(1, roster.wins + roster.losses + roster.ties), 1),
    }


def _trade_fit(my_depth: dict, their_depth: dict) -> dict[str, list[str]]:
    """Phase 5.5: this gets real once we have player-level position lookup.

    For now we surface the structural gaps: positions where they're thin and
    you're deep (you should trade them a starter), and the reverse.
    """
    you_offer = []
    you_want = []
    for pos in ("QB", "RB", "WR", "TE"):
        mine = my_depth.get(pos, {}).get("count", 0)
        theirs = their_depth.get(pos, {}).get("count", 0)
        if mine - theirs >= 2:
            you_offer.append(pos)
        elif theirs - mine >= 2:
            you_want.append(pos)
    return {"you_could_offer": you_offer, "you_could_target": you_want}
