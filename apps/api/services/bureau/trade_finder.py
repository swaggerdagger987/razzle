"""Trade Finder — league-specific value-matched trade suggestions.

Matches dynasty values across rosters using position need/surplus from
Sleeper rosters + terminal.db dynasty_value. Complements pressure-map
(desperation) and trade-network (partnership history).
"""

from __future__ import annotations

from typing import Any

from ..context.enrich import lookup_players
from ..context.store import get_or_refresh

POSITIONS = ("QB", "RB", "WR", "TE")
IDEAL_COUNT = {"QB": 2, "RB": 5, "WR": 6, "TE": 2}
MIN_NEED = {"QB": 1, "RB": 4, "WR": 5, "TE": 1}
VALUE_GAP_MAX = 0.25
MAX_MATCHES = 15


def _enrich_by_position(player_ids: list[str], lookup: dict[str, dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    out: dict[str, list[dict[str, Any]]] = {pos: [] for pos in POSITIONS}
    for sid in player_ids:
        info = lookup.get(sid)
        if not info:
            continue
        pos = info.get("position")
        if pos not in out:
            continue
        terminal = info.get("terminal") or {}
        dv = float(terminal.get("dynasty_value") or 0)
        if dv <= 0:
            continue
        out[pos].append(
            {
                "player_id": sid,
                "gsis_id": info.get("gsis_id") or sid,
                "name": info.get("name") or sid,
                "position": pos,
                "dynasty_value": round(dv, 1),
            }
        )
    for pos in POSITIONS:
        out[pos].sort(key=lambda p: -p["dynasty_value"])
    return out


def _surplus_positions(by_pos: dict[str, list[dict[str, Any]]]) -> list[str]:
    return [pos for pos in POSITIONS if len(by_pos[pos]) > IDEAL_COUNT[pos]]


def _need_positions(by_pos: dict[str, list[dict[str, Any]]]) -> list[str]:
    return [pos for pos in POSITIONS if len(by_pos[pos]) < MIN_NEED[pos]]


def _tradable_assets(by_pos: dict[str, list[dict[str, Any]]], surplus_pos: list[str]) -> list[dict[str, Any]]:
    assets: list[dict[str, Any]] = []
    for pos in surplus_pos:
        depth = by_pos[pos][IDEAL_COUNT[pos] :]
        assets.extend(depth)
    return assets


def _value_match(give: dict[str, Any], get: dict[str, Any]) -> tuple[float, float] | None:
    gap = abs(give["dynasty_value"] - get["dynasty_value"])
    base = max(give["dynasty_value"], get["dynasty_value"], 1.0)
    pct = gap / base
    if pct > VALUE_GAP_MAX:
        return None
    return round(gap, 1), round(pct * 100, 1)


def trade_finder(league_id: str, user_id: str) -> dict[str, Any]:
    ctx = get_or_refresh(league_id)
    if not ctx:
        return {"error": "league not found", "league_id": league_id}

    my_roster = ctx.roster_for_user(user_id)
    if not my_roster:
        return {"error": "user not found in league", "user_id": user_id}

    all_ids = list({pid for r in ctx.rosters for pid in r.players})
    lookup = lookup_players(all_ids)

    my_by_pos = _enrich_by_position(my_roster.players, lookup)
    my_surplus_pos = _surplus_positions(my_by_pos)
    my_need_pos = _need_positions(my_by_pos)
    my_assets = _tradable_assets(my_by_pos, my_surplus_pos)

    matches: list[dict[str, Any]] = []
    for opp in ctx.rosters:
        if opp.roster_id == my_roster.roster_id:
            continue
        opp_by_pos = _enrich_by_position(opp.players, lookup)
        user = ctx.user_for_roster(opp.roster_id)
        team = (user.team_name if user else None) or (user.display_name if user else f"Team {opp.roster_id}")

        for give in my_assets:
            give_pos = give["position"]
            opp_wants = len(opp_by_pos[give_pos]) < MIN_NEED[give_pos]
            if not opp_wants and len(opp_by_pos[give_pos]) <= IDEAL_COUNT[give_pos]:
                continue

            for need_pos in my_need_pos:
                for get_p in opp_by_pos[need_pos]:
                    if len(opp_by_pos[need_pos]) <= MIN_NEED[need_pos] and get_p is opp_by_pos[need_pos][0]:
                        continue
                    matched = _value_match(give, get_p)
                    if not matched:
                        continue
                    gap, gap_pct = matched
                    matches.append(
                        {
                            "partner_roster_id": opp.roster_id,
                            "partner_team": team,
                            "give": give,
                            "get": get_p,
                            "value_gap": gap,
                            "gap_pct": gap_pct,
                        }
                    )

    matches.sort(key=lambda m: (m["gap_pct"], -m["give"]["dynasty_value"]))
    trimmed = matches[:MAX_MATCHES]
    hero = trimmed[0] if trimmed else None

    user = next((u for u in ctx.users if u.user_id == user_id), None)
    return {
        "league_id": league_id,
        "season": ctx.season,
        "team": (user.team_name if user else None) or (user.display_name if user else "Your team"),
        "needs": my_need_pos,
        "surplus": my_surplus_pos,
        "matches": trimmed,
        "hero_match": hero,
    }
