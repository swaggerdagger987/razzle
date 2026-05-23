"""Strength of Schedule — your remaining opponents ranked by power.

Uses the same power-ranking model as power_rankings.py applied to the
upcoming matchups list, so "tough schedule" is data-defined, not vibes.
"""

from __future__ import annotations

from typing import Any

from ..context.store import get_or_refresh
from .power_rankings import power_rankings


def strength_of_schedule(league_id: str, user_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}
    roster = ctx.roster_for_user(user_id)
    if not roster:
        return {"error": "roster not found"}

    rankings = {row["roster_id"]: row for row in power_rankings(league_id)["rows"]}
    you = rankings.get(roster.roster_id, {})

    # Phase 5.5: pull the actual schedule from Sleeper matchups/{week}.
    # For Phase 5 launch we approximate "remaining strength" as the average
    # power of every other team weighted by record.
    others = [r for r in rankings.values() if r["roster_id"] != roster.roster_id]
    avg_opp_ppg = sum(r["ppg"] for r in others) / max(1, len(others))
    return {
        "league_id": league_id,
        "user_id": user_id,
        "your_rank": you.get("rank"),
        "your_ppg": you.get("ppg"),
        "opponent_avg_ppg": round(avg_opp_ppg, 1),
        "verdict": _verdict(you.get("ppg", 0), avg_opp_ppg),
    }


def _verdict(your_ppg: float, opp_ppg: float) -> str:
    if your_ppg >= opp_ppg + 8:
        return "Easy road — you outpace the average opponent by 8+ PPG."
    if your_ppg >= opp_ppg:
        return "Even slate — you should beat the average opponent."
    if your_ppg >= opp_ppg - 8:
        return "Tough but winnable — you'll need to play above average."
    return "Brutal slate — every win is going to require a ceiling game."
