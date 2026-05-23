"""Join Sleeper player IDs to names, positions, and terminal.db stats."""

from __future__ import annotations

import logging
import time
from typing import Any

import httpx

from ...db import get_db

logger = logging.getLogger("razzle.context.enrich")

_SLEEPER_PLAYERS_URL = "https://api.sleeper.app/v1/players/nfl"
_ELITE_DYNASTY_VALUE = 7500.0
_sleeper_cache: tuple[float, dict[str, Any]] | None = None
_SLEEPER_TTL = 3600


def _sleeper_master() -> dict[str, Any]:
    global _sleeper_cache
    now = time.time()
    if _sleeper_cache and now - _sleeper_cache[0] < _SLEEPER_TTL:
        return _sleeper_cache[1]
    try:
        r = httpx.get(_SLEEPER_PLAYERS_URL, timeout=20.0, headers={"User-Agent": "razzle/2.0"})
        r.raise_for_status()
        data = r.json()
        _sleeper_cache = (now, data)
        return data
    except httpx.HTTPError:
        logger.exception("Sleeper player master fetch failed")
        return _sleeper_cache[1] if _sleeper_cache else {}


def lookup_players(sleeper_ids: list[str]) -> dict[str, dict[str, Any]]:
    """Map sleeper_id -> {name, position, team, age, gsis_id, terminal?}."""
    master = _sleeper_master()
    out: dict[str, dict[str, Any]] = {}
    gsis_ids: list[str] = []

    for sid in sleeper_ids:
        sp = master.get(sid) or {}
        gsis = sp.get("gsis_id")
        out[sid] = {
            "sleeper_id": sid,
            "name": sp.get("full_name") or f"{sp.get('first_name', '')} {sp.get('last_name', '')}".strip(),
            "position": sp.get("position"),
            "team": sp.get("team"),
            "age": sp.get("age"),
            "gsis_id": gsis,
        }
        if gsis:
            gsis_ids.append(str(gsis))

    if gsis_ids:
        try:
            with get_db() as conn:
                placeholders = ",".join("?" * len(gsis_ids))
                rows = conn.execute(
                    f"""
                    SELECT player_id, full_name, position, team, age, dynasty_value
                    FROM players
                    WHERE player_id IN ({placeholders})
                    """,
                    gsis_ids,
                ).fetchall()
            by_gsis = {str(r["player_id"]): dict(r) for r in rows}
            for info in out.values():
                gid = info.get("gsis_id")
                if gid and str(gid) in by_gsis:
                    info["terminal"] = by_gsis[str(gid)]
                    if not info.get("position"):
                        info["position"] = by_gsis[str(gid)].get("position")
        except Exception:  # noqa: BLE001
            logger.exception("terminal.db player join failed")

    return out


def depth_by_position(player_ids: list[str]) -> dict[str, dict[str, Any]]:
    """Count and tier roster players by fantasy position."""
    lookup = lookup_players(player_ids)
    depth = {
        pos: {"count": 0, "elite": 0, "starters": [], "depth": []}
        for pos in ("QB", "RB", "WR", "TE")
    }
    for sid, info in lookup.items():
        pos = info.get("position")
        if pos not in depth:
            continue
        depth[pos]["count"] += 1
        terminal = info.get("terminal") or {}
        dv = float(terminal.get("dynasty_value") or 0)
        if dv >= _ELITE_DYNASTY_VALUE:
            depth[pos]["elite"] += 1
        depth[pos]["depth"].append(
            {
                "player_id": sid,
                "name": info.get("name") or sid,
                "position": pos,
                "dynasty_value": round(dv, 1) if dv else None,
            }
        )
    return depth


def roster_young_skew(player_ids: list[str], *, max_age: int = 24) -> bool:
    """True when most rostered players with known age are 24 or younger."""
    lookup = lookup_players(player_ids)
    ages = [int(p["age"]) for p in lookup.values() if p.get("age") is not None]
    if len(ages) < 4:
        return False
    young = sum(1 for a in ages if a <= max_age)
    return young / len(ages) >= 0.55
