"""Trade Network — who trades with whom, how often, and at what value flow.

Surfaces collusion patterns ("these two managers trade every week") and
trade partners ("this manager only deals when they're winning the value
exchange"). Used by Self-Scout to flag opponents whose offers are likely fair.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from ..context.store import get_or_refresh


def trade_network(league_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}
    edges: dict[tuple[int, int], int] = defaultdict(int)
    for t in ctx.transactions:
        if t.get("type") != "trade" or t.get("status") != "complete":
            continue
        roster_ids = sorted(int(r) for r in (t.get("roster_ids") or []))
        for i, a in enumerate(roster_ids):
            for b in roster_ids[i + 1 :]:
                edges[(a, b)] += 1

    nodes = []
    for r in ctx.rosters:
        user = ctx.user_for_roster(r.roster_id)
        nodes.append(
            {
                "roster_id": r.roster_id,
                "team": (user.team_name if user else None) or (user.display_name if user else f"Team {r.roster_id}"),
            }
        )
    edges_out = [
        {"source": a, "target": b, "trades": count} for (a, b), count in edges.items()
    ]
    edges_out.sort(key=lambda e: -e["trades"])
    return {"league_id": league_id, "nodes": nodes, "edges": edges_out}
