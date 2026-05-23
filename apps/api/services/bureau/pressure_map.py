"""Pressure Map — trade deadline desperation scores per manager.

Single-season MVP from roster record + transaction panic bursts.
Ported from legacy computePressureScores — no multi-season chain.
"""

from __future__ import annotations

from typing import Any

from ..context.store import get_or_refresh
from .manager_profiles import _panic_score, _tally_per_roster


def _pressure_score(wins: int, losses: int, trades: int, panic_pct: int) -> int:
    score = 0
    total = wins + losses
    if total > 0:
        win_pct = wins / total
        if win_pct < 0.35:
            score += 35
        elif win_pct < 0.45:
            score += 25
        elif win_pct < 0.50:
            score += 15
        elif win_pct >= 0.65:
            score -= 10
    score += min(20, round(panic_pct * 0.2))
    if trades >= 5:
        score += 10
    return max(0, min(100, score))


def _label(score: int) -> str:
    if score >= 60:
        return "desperate"
    if score >= 35:
        return "motivated"
    return "comfortable"


def pressure_map(league_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}

    tallies = _tally_per_roster(ctx.transactions)
    rows = []
    for r in ctx.rosters:
        user = ctx.user_for_roster(r.roster_id)
        raw = tallies.get(r.roster_id, {})
        weekly = dict(raw.get("weekly") or {})
        panic_pct = _panic_score(weekly)
        trades = int(raw.get("trades", 0))
        score = _pressure_score(r.wins, r.losses, trades, panic_pct)
        rows.append(
            {
                "roster_id": r.roster_id,
                "team": (user.team_name if user else None)
                or (user.display_name if user else f"Team {r.roster_id}"),
                "record": f"{r.wins}-{r.losses}-{r.ties}",
                "score": score,
                "label": _label(score),
                "trades": trades,
                "panic_score": panic_pct,
            }
        )

    rows.sort(key=lambda x: -x["score"])
    hero = rows[0] if rows else None
    return {
        "league_id": league_id,
        "season": ctx.season,
        "rows": rows,
        "hero_manager": hero["team"] if hero else None,
        "hero_score": hero["score"] if hero else None,
    }
