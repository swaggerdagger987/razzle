"""Waiver Tendencies — who claims, who drops, and what archetypes each manager chases.

Identifies "the FAAB hoarder," "the panic-dropper," "the streaming-QB chaser,"
etc. Used to predict what waiver moves each opponent will make next.
"""

from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any

from ..context.store import get_or_refresh


def waiver_tendencies(league_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}
    per_roster = defaultdict(lambda: {"adds": 0, "drops": 0, "faab_spent": 0, "claim_attempts": 0})
    for t in ctx.transactions:
        if t.get("type") not in ("waiver", "free_agent"):
            continue
        for rid_str, _player in (t.get("adds") or {}).items():
            per_roster[int(rid_str)]["adds"] += 1
        for rid_str, _player in (t.get("drops") or {}).items():
            per_roster[int(rid_str)]["drops"] += 1
        bid = (t.get("settings") or {}).get("waiver_bid") or 0
        for rid in t.get("roster_ids") or []:
            per_roster[int(rid)]["claim_attempts"] += 1
            if t.get("status") == "complete":
                per_roster[int(rid)]["faab_spent"] += int(bid)

    rows = []
    for r in ctx.rosters:
        u = ctx.user_for_roster(r.roster_id)
        stats = per_roster.get(r.roster_id, {"adds": 0, "drops": 0, "faab_spent": 0, "claim_attempts": 0})
        rows.append(
            {
                "roster_id": r.roster_id,
                "team": (u.team_name if u else None) or (u.display_name if u else f"Team {r.roster_id}"),
                "adds": stats["adds"],
                "drops": stats["drops"],
                "faab_spent": stats["faab_spent"],
                "claim_attempts": stats["claim_attempts"],
                "archetype": _classify_waiver_style(stats),
            }
        )
    rows.sort(key=lambda x: -x["adds"])
    return {"league_id": league_id, "rows": rows}


def _classify_waiver_style(s: dict) -> str:
    adds = s["adds"]
    faab = s["faab_spent"]
    if adds >= 12 and faab <= 30:
        return "The Streamer (cheap, frequent)"
    if adds <= 4 and faab >= 100:
        return "The Hoarder (rare, expensive)"
    if adds >= 10 and faab >= 100:
        return "The Active Manager (aggressive on both axes)"
    if adds == 0:
        return "The Set-and-Forget"
    return "The Opportunist"
