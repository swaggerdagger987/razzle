"""Manager Profiles — behavioral archetypes from Sleeper transaction history.

Classifies each manager (panic seller, hoarder, aggressive, patient, steady)
and surfaces exploit-window copy for trade timing. Single-season MVP from
cached LeagueContext transactions — no multi-season chain this cycle.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from ..context.store import get_or_refresh

ARCHETYPES = ("PANIC SELLER", "AGGRESSIVE", "HOARDER", "PATIENT", "STEADY")

EXPLOIT_WINDOWS: dict[str, str] = {
    "PANIC SELLER": "Strike after back-to-back losses — this manager dumps starters in burst weeks.",
    "AGGRESSIVE": "Will overpay for win-now pieces. Send offers before the deadline.",
    "HOARDER": "Low trade volume — waivers and picks are the angle, not player-for-player deals.",
    "PATIENT": "Waits for value — need a lopsided offer to move them.",
    "STEADY": "Predictable rhythm — track their position adds for trade leverage.",
}


def _classify_archetype(stats: dict[str, Any]) -> str:
    total = stats["total"]
    moves = stats["moves_per_season"]
    panic_score = stats["panic_score"]
    adds = stats["adds"]
    drops = stats["drops"]

    if total >= 8 and panic_score > 50:
        return "PANIC SELLER"
    if moves >= 10 and drops > adds:
        return "AGGRESSIVE"
    if moves <= 3 and adds > drops + 2:
        return "HOARDER"
    if moves <= 4 and panic_score <= 10:
        return "PATIENT"
    return "STEADY"


def _tally_per_roster(transactions: list[dict[str, Any]]) -> dict[int, dict[str, Any]]:
    per: dict[int, dict[str, Any]] = defaultdict(
        lambda: {
            "trades": 0,
            "waivers": 0,
            "adds": 0,
            "drops": 0,
            "total": 0,
            "weekly": defaultdict(int),
        }
    )
    for t in transactions:
        if t.get("status") != "complete":
            continue
        txn_type = t.get("type")
        week = int(t.get("leg") or 0)
        roster_ids = [int(r) for r in (t.get("roster_ids") or [])]
        for rid in roster_ids:
            per[rid]["total"] += 1
            if week:
                per[rid]["weekly"][week] += 1
            if txn_type == "trade":
                per[rid]["trades"] += 1
            elif txn_type in ("waiver", "free_agent"):
                per[rid]["waivers"] += 1
        for rid_str, _ in (t.get("adds") or {}).items():
            per[int(rid_str)]["adds"] += 1
        for rid_str, _ in (t.get("drops") or {}).items():
            per[int(rid_str)]["drops"] += 1
    return per


def _panic_score(weekly: dict[int, int]) -> int:
    if not weekly:
        return 0
    panic_weeks = sum(1 for count in weekly.values() if count >= 3)
    return round(panic_weeks / len(weekly) * 100)


def manager_profiles(league_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found"}

    tallies = _tally_per_roster(ctx.transactions)
    rows = []
    for r in ctx.rosters:
        user = ctx.user_for_roster(r.roster_id)
        raw = tallies.get(r.roster_id, {})
        weekly = raw.get("weekly") or {}
        panic = _panic_score(dict(weekly))
        stats = {
            "trades": raw.get("trades", 0),
            "waivers": raw.get("waivers", 0),
            "adds": raw.get("adds", 0),
            "drops": raw.get("drops", 0),
            "total": raw.get("total", 0),
            "moves_per_season": float(raw.get("total", 0)),
            "panic_score": panic,
        }
        archetype = _classify_archetype(stats)
        rows.append(
            {
                "roster_id": r.roster_id,
                "team": (user.team_name if user else None)
                or (user.display_name if user else f"Team {r.roster_id}"),
                "record": f"{r.wins}-{r.losses}-{r.ties}",
                "archetype": archetype,
                "exploit_window": EXPLOIT_WINDOWS[archetype],
                "trades": stats["trades"],
                "moves_per_season": stats["moves_per_season"],
                "panic_score": panic,
            }
        )

    rows.sort(key=lambda x: (-x["panic_score"], -x["moves_per_season"]))
    hero = next((r for r in rows if r["archetype"] == "PANIC SELLER"), rows[0] if rows else None)
    return {
        "league_id": league_id,
        "season": ctx.season,
        "rows": rows,
        "hero_manager": hero["team"] if hero else None,
        "hero_archetype": hero["archetype"] if hero else None,
    }
