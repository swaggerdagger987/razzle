"""Self-Scout — the Bureau's flagship feature."""

from __future__ import annotations

from typing import Any

from ..context.enrich import depth_by_position, roster_young_skew
from ..context.loader import LeagueContext
from ..context.store import get_or_refresh


def self_scout(league_id: str, user_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found", "league_id": league_id}

    roster = ctx.roster_for_user(user_id)
    if not roster:
        return {"error": "user not found in league", "user_id": user_id}

    depth = depth_by_position(roster.players)
    build = _classify_build(depth, roster.players)
    rank, total = _power_rank(ctx, roster.roster_id)
    flags = _vulnerability_flags(depth, roster)
    opponents = _how_opponents_see_you(depth, build, rank, total)

    user = next((u for u in ctx.users if u.user_id == user_id), None)
    return {
        "league": {"id": ctx.league_id, "name": ctx.name, "season": ctx.season},
        "team": {
            "user_id": user_id,
            "name": (user.team_name if user else None) or (user.display_name if user else "Your team"),
            "record": f"{roster.wins}-{roster.losses}-{roster.ties}",
            "points_for": round(roster.points_for, 1),
            "points_against": round(roster.points_against, 1),
        },
        "depth": depth,
        "build_profile": build,
        "power_rank": {"rank": rank, "total": total},
        "vulnerability_flags": flags,
        "how_opponents_see_you": opponents,
    }


def _classify_build(depth: dict[str, Any], all_players: list[str]) -> dict[str, str]:
    rb = depth.get("RB", {}).get("count", 0)
    wr = depth.get("WR", {}).get("count", 0)
    qb = depth.get("QB", {}).get("count", 0)
    elite_rb = depth.get("RB", {}).get("elite", 0)
    elite_wr = depth.get("WR", {}).get("elite", 0)

    if elite_rb >= 1 and rb <= 4 and wr >= 6:
        archetype, reasoning = "Hero RB", "One elite RB, deep WR corps. Banking on health at the top."
    elif elite_rb == 0 and wr >= 7:
        archetype, reasoning = "Zero RB", "WR-heavy, expecting RB hits via waivers + draft."
    elif elite_rb + elite_wr >= 3 and rb + wr <= 11:
        archetype, reasoning = "Stars & Scrubs", "Top-heavy roster, vulnerable to bye weeks and injuries."
    elif qb >= 2 and elite_rb + elite_wr >= 2:
        archetype, reasoning = "Win Now", "Built for a championship run this year."
    elif roster_young_skew(all_players):
        archetype, reasoning = "Youth Movement", "Building around 2nd/3rd year breakouts and rookies."
    else:
        archetype, reasoning = "Balanced", "Even distribution across positions — no glaring strength or hole."

    return {"archetype": archetype, "reasoning": reasoning}


def _power_rank(ctx: LeagueContext, roster_id: int) -> tuple[int, int]:
    ranked = sorted(ctx.rosters, key=lambda r: (-r.wins, -r.points_for))
    total = len(ranked)
    rank = next((i + 1 for i, r in enumerate(ranked) if r.roster_id == roster_id), total)
    return rank, total


def _vulnerability_flags(depth: dict[str, Any], roster) -> list[dict[str, str]]:
    flags = []
    for pos in ("QB", "RB", "WR", "TE"):
        d = depth.get(pos, {})
        if d.get("count", 0) <= (1 if pos in ("QB", "TE") else 2):
            flags.append(
                {
                    "severity": "warning",
                    "position": pos,
                    "message": f"Thin at {pos} — one injury here ends your week.",
                }
            )
    if roster.points_against > roster.points_for and roster.wins <= roster.losses:
        flags.append(
            {
                "severity": "info",
                "position": "schedule",
                "message": "Negative scoring margin AND losing record — you're not unlucky, you're outmatched.",
            }
        )
    return flags


def _how_opponents_see_you(depth: dict, build: dict, rank: int, total: int) -> str:
    archetype = build["archetype"]
    tier = "contender" if rank <= total // 3 else "play-in" if rank <= 2 * total // 3 else "seller"
    weak_pos = _weakest_position(depth)
    return (
        f"You're the {archetype} team in this league — a {tier}. "
        f"Opponents will target your {weak_pos} depth in trade talks and "
        f"start their RB2s against you when the matchup says they shouldn't."
    )


def _weakest_position(depth: dict) -> str:
    counts = {pos: depth.get(pos, {}).get("count", 0) for pos in ("QB", "RB", "WR", "TE")}
    return min(counts.items(), key=lambda x: x[1])[0]
