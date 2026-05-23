"""Power Rankings — beyond record. Uses points-for, points-against, and
luck-adjusted expected wins to rank teams the way the analytics community does.
"""

from __future__ import annotations

from typing import Any

from ..context.store import get_or_refresh


def power_rankings(league_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}
    rows = []
    for r in ctx.rosters:
        user = ctx.user_for_roster(r.roster_id)
        games_played = max(1, r.wins + r.losses + r.ties)
        ppg = r.points_for / games_played
        opp_ppg = r.points_against / games_played
        differential = ppg - opp_ppg
        # Luck index: actual wins minus pythagorean-expected wins (simple ratio form)
        if (r.points_for + r.points_against) > 0:
            exp_win_pct = (r.points_for ** 2.37) / (r.points_for ** 2.37 + r.points_against ** 2.37)
        else:
            exp_win_pct = 0.5
        expected_wins = round(exp_win_pct * games_played, 1)
        rows.append(
            {
                "roster_id": r.roster_id,
                "team": (user.team_name if user else None) or (user.display_name if user else f"Team {r.roster_id}"),
                "record": f"{r.wins}-{r.losses}-{r.ties}",
                "ppg": round(ppg, 1),
                "opp_ppg": round(opp_ppg, 1),
                "differential": round(differential, 1),
                "expected_wins": expected_wins,
                "luck": round(r.wins - expected_wins, 1),
            }
        )
    rows.sort(key=lambda x: (-x["differential"], -x["ppg"]))
    for i, row in enumerate(rows, 1):
        row["rank"] = i
    return {"league_id": league_id, "rows": rows}
