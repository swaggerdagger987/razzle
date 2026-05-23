"""Monte Carlo — projection distributions per roster player."""

from __future__ import annotations

import random
import statistics
from collections import Counter
from datetime import datetime
from typing import Any

from ...db import get_db
from ..context.enrich import lookup_players
from ..context.store import get_or_refresh

_SCORING_COL = {
    "ppr": "fantasy_points_ppr",
    "half_ppr": "fantasy_points_half_ppr",
    "std": "fantasy_points_std",
    "standard": "fantasy_points_std",
}


def _current_season() -> int:
    now = datetime.now()
    return now.year if now.month >= 7 else now.year - 1


def _distribution(weeks: list[float]) -> dict[str, float]:
    if len(weeks) >= 2:
        mean = statistics.mean(weeks)
        stdev = statistics.stdev(weeks)
        return {
            "mean": round(mean, 2),
            "stddev": round(stdev, 2),
            "floor": round(min(weeks), 2),
            "ceiling": round(max(weeks), 2),
            "games": len(weeks),
        }
    if len(weeks) == 1:
        val = weeks[0]
        return {
            "mean": round(val, 2),
            "stddev": round(val * 0.3, 2),
            "floor": round(val * 0.5, 2),
            "ceiling": round(val * 1.5, 2),
            "games": 1,
        }
    return {"mean": 0.0, "stddev": 0.0, "floor": 0.0, "ceiling": 0.0, "games": 0}


def _weekly_stats_by_gsis(gsis_ids: list[str], scoring: str, season: int) -> dict[str, list[float]]:
    if not gsis_ids:
        return {}
    col = _SCORING_COL.get(scoring, "fantasy_points_ppr")
    placeholders = ",".join("?" * len(gsis_ids))
    query = f"""
        SELECT player_id, {col} as pts
        FROM player_week_stats
        WHERE player_id IN ({placeholders})
          AND season = ?
          AND season_type = 'regular'
          AND {col} IS NOT NULL
    """
    with get_db() as conn:
        rows = conn.execute(query, (*gsis_ids, season)).fetchall()

    out: dict[str, list[float]] = {gid: [] for gid in gsis_ids}
    for row in rows:
        gid = str(row["player_id"])
        if gid in out and row["pts"] is not None:
            out[gid].append(float(row["pts"]))
    return out


def _sample_score(mean: float, stddev: float, floor: float, ceiling: float) -> float:
    if mean <= 0:
        return 0.0
    if stddev <= 0:
        return mean
    z = random.gauss(0, 1)
    return max(floor, min(ceiling, mean + z * stddev))


def _championship_odds(
    by_roster: dict[int, list[dict[str, float]]],
    sims: int = 2000,
) -> dict[int, float]:
    """Sample roster totals; highest total wins each sim. Returns championship % per roster_id."""
    if not by_roster:
        return {}
    roster_ids = list(by_roster.keys())
    wins: Counter[int] = Counter()
    for _ in range(sims):
        totals = {
            rid: sum(
                _sample_score(p["mean"], p["stddev"], p["floor"], p["ceiling"])
                for p in players
                if p["mean"] > 0
            )
            for rid, players in by_roster.items()
        }
        winner = max(roster_ids, key=lambda rid: totals.get(rid, 0))
        wins[winner] += 1
    return {rid: round(wins[rid] / sims * 100, 1) for rid in roster_ids}


def monte_carlo_projections(league_id: str, scoring: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}

    sleeper_ids: list[str] = []
    for roster in ctx.rosters:
        sleeper_ids.extend(str(pid) for pid in roster.players)
    sleeper_ids = list(dict.fromkeys(sleeper_ids))

    lookup = lookup_players(sleeper_ids)
    gsis_by_sleeper: dict[str, str] = {}
    for sid, info in lookup.items():
        gsis = info.get("gsis_id")
        if gsis:
            gsis_by_sleeper[sid] = str(gsis)

    season = _current_season()
    weekly = _weekly_stats_by_gsis(list(gsis_by_sleeper.values()), scoring, season)

    projections: list[dict[str, Any]] = []
    by_roster: dict[int, list[dict[str, float]]] = {}
    manager_names: dict[int, str] = {}
    with_stats = 0
    for roster in ctx.rosters:
        owner = ctx.user_for_roster(roster.roster_id)
        team = (owner.team_name if owner else None) or (owner.display_name if owner else f"Team {roster.roster_id}")
        manager_names[roster.roster_id] = team
        by_roster.setdefault(roster.roster_id, [])
        for pid in roster.players:
            sid = str(pid)
            info = lookup.get(sid) or {}
            gsis = gsis_by_sleeper.get(sid)
            weeks = weekly.get(gsis, []) if gsis else []
            dist = _distribution(weeks)
            if dist["games"] > 0:
                with_stats += 1
            by_roster[roster.roster_id].append(dist)
            projections.append(
                {
                    "player_id": sid,
                    "name": info.get("name") or sid,
                    "position": info.get("position"),
                    "team": info.get("team"),
                    "roster_id": roster.roster_id,
                    "manager": team,
                    **dist,
                }
            )

    champ_pct = _championship_odds(by_roster)
    odds = sorted(
        [
            {
                "roster_id": rid,
                "manager": manager_names.get(rid, f"Team {rid}"),
                "championship_pct": champ_pct.get(rid, 0.0),
                "roster_power": round(
                    sum(p["mean"] for p in by_roster.get(rid, []) if p["mean"] > 0),
                    1,
                ),
            }
            for rid in by_roster
        ],
        key=lambda o: o["championship_pct"],
        reverse=True,
    )

    return {
        "league_id": league_id,
        "scoring": scoring,
        "season": season,
        "projections": projections,
        "players_with_stats": with_stats,
        "odds": odds,
        "simulations": 2000,
    }
