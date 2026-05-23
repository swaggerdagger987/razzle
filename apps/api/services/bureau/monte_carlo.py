"""Monte Carlo — projection distributions per roster player.

Server returns mean/stddev/floor/ceiling per player; the browser runs
the 10k sim. This split is intentional:
- Distributions are cheap to compute server-side (one SQL pass).
- The sim is embarrassingly parallel and instant in JS Web Workers.
- Each "what-if I sit X / start Y" rerun is free for the user.
"""

from __future__ import annotations

from typing import Any

from ..context.store import get_or_refresh


def monte_carlo_projections(league_id: str, scoring: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}

    # Phase 5.5: join Sleeper player_ids on terminal.db projections table.
    # For Phase 5 ship, we return empty distributions so the frontend Monte
    # Carlo worker can wire against the shape end-to-end.
    projections = []
    for r in ctx.rosters:
        for pid in r.players:
            projections.append(
                {
                    "player_id": pid,
                    "roster_id": r.roster_id,
                    "mean": 0.0,
                    "stddev": 0.0,
                    "floor": 0.0,
                    "ceiling": 0.0,
                }
            )

    return {
        "league_id": league_id,
        "scoring": scoring,
        "projections": projections,
        "note": "Phase 5.5 wires real distributions from terminal.db.",
    }
