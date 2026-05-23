"""Situation Room fact sources.

Historian is the canonical fact-store for all agents. This module builds a
snapshot of "what's true right now" from free sources (Sleeper + ESPN RSS)
and serves it to every agent as injected context.

No paid APIs. No Twitter. Designed to degrade gracefully — if any source
fails, the snapshot is still returned with the other sources populated.
"""
from __future__ import annotations

import json
import logging
import time
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from typing import Any

logger = logging.getLogger("razzle.agent_facts")

_UA = "razzle/1.0 (+https://razzle.lol)"
_HTTP_TIMEOUT = 8

# TTLs are deliberately loose — Historian cares about "today," not "this minute."
_TTL_INJURIES = 30 * 60       # 30 min
_TTL_TRENDING = 15 * 60       # 15 min
_TTL_RSS = 15 * 60            # 15 min
_TTL_SLEEPER_USER = 24 * 60 * 60  # 24 hr (sleeper_user_id is stable)
_TTL_SLEEPER_LEAGUES = 60 * 60    # 1 hr
_TTL_SLEEPER_ROSTERS = 30 * 60    # 30 min

_cache: dict[str, tuple[float, Any]] = {}


def _cache_get(key: str, ttl: int):
    hit = _cache.get(key)
    if not hit:
        return None
    ts, val = hit
    if time.time() - ts > ttl:
        return None
    return val


def _cache_set(key: str, val):
    _cache[key] = (time.time(), val)


def _http_json(url: str) -> Any:
    req = urllib.request.Request(url, headers={"User-Agent": _UA})
    with urllib.request.urlopen(req, timeout=_HTTP_TIMEOUT) as resp:
        return json.loads(resp.read())


def _http_text(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": _UA})
    with urllib.request.urlopen(req, timeout=_HTTP_TIMEOUT) as resp:
        return resp.read().decode("utf-8", errors="replace")


# ── Sleeper player master (cached, large — ~5MB JSON) ────────────

def _load_sleeper_players() -> dict:
    key = "sleeper:players"
    cached = _cache_get(key, _TTL_INJURIES)
    if cached is not None:
        return cached
    try:
        data = _http_json("https://api.sleeper.app/v1/players/nfl")
        _cache_set(key, data)
        return data
    except Exception:
        logger.exception("Failed to fetch Sleeper player master")
        return _cache.get(key, (0, {}))[1] or {}


def injury_report(limit: int = 40) -> list[dict]:
    """Players flagged with an injury designation right now.

    Returns a list sorted by severity (Out > Doubtful > Questionable).
    """
    players = _load_sleeper_players()
    severity = {
        "Out": 0, "IR": 0, "PUP": 0, "NFI": 0, "Suspended": 0,
        "Doubtful": 1,
        "Questionable": 2,
    }
    rows = []
    for p in players.values():
        status = p.get("injury_status")
        if not status or status not in severity:
            continue
        # Only offensive fantasy-relevant positions
        pos = p.get("position")
        if pos not in ("QB", "RB", "WR", "TE", "K"):
            continue
        if not p.get("team"):
            continue
        rows.append({
            "name": p.get("full_name") or f"{p.get('first_name','')} {p.get('last_name','')}".strip(),
            "pos": pos,
            "team": p.get("team"),
            "status": status,
            "body_part": p.get("injury_body_part") or "",
            "notes": (p.get("injury_notes") or "")[:140],
            "_sev": severity[status],
        })
    rows.sort(key=lambda r: (r["_sev"], r["pos"], r["name"]))
    for r in rows:
        r.pop("_sev", None)
    return rows[:limit]


def trending(kind: str = "add", limit: int = 20, lookback_hours: int = 24) -> list[dict]:
    """Top trending adds or drops on Sleeper across all leagues."""
    assert kind in ("add", "drop")
    key = f"sleeper:trending:{kind}:{lookback_hours}:{limit}"
    cached = _cache_get(key, _TTL_TRENDING)
    if cached is not None:
        return cached
    try:
        url = f"https://api.sleeper.app/v1/players/nfl/trending/{kind}?lookback_hours={lookback_hours}&limit={limit}"
        raw = _http_json(url)
        players = _load_sleeper_players()
        out = []
        for row in raw:
            pid = row.get("player_id")
            p = players.get(pid) or {}
            out.append({
                "name": p.get("full_name") or pid,
                "pos": p.get("position"),
                "team": p.get("team"),
                "count": row.get("count", 0),
            })
        _cache_set(key, out)
        return out
    except Exception:
        logger.exception("Sleeper trending %s failed", kind)
        return []


# ── ESPN NFL news RSS ────────────────────────────────────────────

def espn_news(limit: int = 12) -> list[dict]:
    key = f"espn:news:{limit}"
    cached = _cache_get(key, _TTL_RSS)
    if cached is not None:
        return cached
    try:
        xml_text = _http_text("https://www.espn.com/espn/rss/nfl/news")
        root = ET.fromstring(xml_text)
        items = []
        for item in root.iter("item"):
            title = (item.findtext("title") or "").strip()
            desc = (item.findtext("description") or "").strip()
            pub = (item.findtext("pubDate") or "").strip()
            # strip CDATA/HTML-ish residue
            desc = desc.replace("<![CDATA[", "").replace("]]>", "")
            if title:
                items.append({"title": title, "summary": desc[:240], "pub": pub})
            if len(items) >= limit:
                break
        _cache_set(key, items)
        return items
    except Exception:
        logger.exception("ESPN RSS failed")
        return []


# ── Per-user Sleeper league + roster ─────────────────────────────

def _sleeper_user_id(username: str) -> str | None:
    key = f"sleeper:user:{username.lower()}"
    cached = _cache_get(key, _TTL_SLEEPER_USER)
    if cached is not None:
        return cached
    try:
        data = _http_json(f"https://api.sleeper.app/v1/user/{username}")
        uid = data.get("user_id") if data else None
        if uid:
            _cache_set(key, uid)
        return uid
    except Exception:
        logger.warning("Sleeper user lookup failed for %s", username)
        return None


def _current_nfl_season() -> int:
    import datetime
    now = datetime.datetime.utcnow()
    # NFL league year flips around March; before March use prior year.
    return now.year if now.month >= 3 else now.year - 1


# ── Low-level Sleeper fetchers (all cached) ──────────────────────

def _fetch_league(league_id: str) -> dict:
    key = f"sleeper:league:{league_id}"
    cached = _cache_get(key, _TTL_SLEEPER_LEAGUES)
    if cached is not None:
        return cached
    try:
        data = _http_json(f"https://api.sleeper.app/v1/league/{league_id}") or {}
        _cache_set(key, data)
        return data
    except Exception:
        logger.exception("Fetch league %s failed", league_id)
        return {}


def _fetch_league_users(league_id: str) -> list:
    key = f"sleeper:league_users:{league_id}"
    cached = _cache_get(key, _TTL_SLEEPER_LEAGUES)
    if cached is not None:
        return cached
    try:
        data = _http_json(f"https://api.sleeper.app/v1/league/{league_id}/users") or []
        _cache_set(key, data)
        return data
    except Exception:
        logger.exception("Fetch league users %s failed", league_id)
        return []


def _fetch_rosters(league_id: str) -> list:
    key = f"sleeper:rosters:{league_id}"
    cached = _cache_get(key, _TTL_SLEEPER_ROSTERS)
    if cached is not None:
        return cached
    try:
        data = _http_json(f"https://api.sleeper.app/v1/league/{league_id}/rosters") or []
        _cache_set(key, data)
        return data
    except Exception:
        logger.exception("Fetch rosters %s failed", league_id)
        return []


def _fetch_traded_picks(league_id: str) -> list:
    key = f"sleeper:traded_picks:{league_id}"
    cached = _cache_get(key, _TTL_SLEEPER_LEAGUES)
    if cached is not None:
        return cached
    try:
        data = _http_json(f"https://api.sleeper.app/v1/league/{league_id}/traded_picks") or []
        _cache_set(key, data)
        return data
    except Exception:
        logger.exception("Fetch traded_picks %s failed", league_id)
        return []


def _fetch_transactions_round(league_id: str, round_num: int) -> list:
    key = f"sleeper:txns:{league_id}:{round_num}"
    cached = _cache_get(key, _TTL_SLEEPER_ROSTERS)
    if cached is not None:
        return cached
    try:
        data = _http_json(
            f"https://api.sleeper.app/v1/league/{league_id}/transactions/{round_num}"
        ) or []
        _cache_set(key, data)
        return data
    except Exception:
        return []


def _fetch_recent_transactions(league_id: str, max_rounds: int = 18) -> list:
    """Scan all weeks (0-18), merge and sort by status_updated desc."""
    all_txns: list = []
    for r in range(0, max_rounds + 1):
        all_txns.extend(_fetch_transactions_round(league_id, r) or [])
    all_txns.sort(key=lambda t: t.get("status_updated", 0), reverse=True)
    return all_txns


# ── Derived / decoded facts ──────────────────────────────────────

_SCORING_KEYS_OF_INTEREST = [
    ("rec", "PPR"),
    ("bonus_rec_te", "TE prem"),
    ("pass_td", "PassTD"),
    ("rush_td", "RushTD"),
    ("rec_td", "RecTD"),
    ("pass_int", "INT"),
    ("fum_lost", "FumLost"),
    ("bonus_rec_yd_100", "100rec yds"),
    ("bonus_rush_yd_100", "100rush yds"),
    ("bonus_pass_yd_300", "300pass yds"),
]


def _summarize_scoring(league: dict) -> dict:
    ss = league.get("scoring_settings") or {}
    out = {}
    for key, label in _SCORING_KEYS_OF_INTEREST:
        if key in ss:
            out[label] = ss[key]
    return out


def _roster_positions(league: dict) -> list:
    return [p for p in (league.get("roster_positions") or []) if p]


def _build_user_map(league_users: list) -> dict:
    """user_id → display_name."""
    return {
        u.get("user_id"): (u.get("display_name") or u.get("username") or u.get("user_id"))
        for u in (league_users or [])
        if u.get("user_id")
    }


def _build_roster_owner_map(rosters: list) -> dict:
    """roster_id → owner user_id."""
    return {r.get("roster_id"): r.get("owner_id") for r in (rosters or []) if r.get("roster_id")}


def all_teams_summary(league_id: str) -> list:
    """Full league roster with owner names, records, and top players per team."""
    rosters = _fetch_rosters(league_id)
    users = _fetch_league_users(league_id)
    user_by_id = _build_user_map(users)
    players = _load_sleeper_players()

    teams = []
    for r in rosters:
        settings = r.get("settings") or {}
        owner_id = r.get("owner_id")
        name = user_by_id.get(owner_id, owner_id) or "—"
        pts_for = (settings.get("fpts") or 0) + (settings.get("fpts_decimal") or 0) / 100.0
        # Keep only top 5 names per team to control prompt size; priority by pos.
        roster_names = []
        for pid in (r.get("players") or [])[:25]:
            p = players.get(pid) or {}
            roster_names.append(f"{p.get('position','?')} {p.get('full_name') or pid}")
        teams.append({
            "roster_id": r.get("roster_id"),
            "owner": name,
            "wins": settings.get("wins", 0),
            "losses": settings.get("losses", 0),
            "ties": settings.get("ties", 0),
            "pts_for": round(pts_for, 1),
            "roster": roster_names,
        })
    # Sort by wins desc, then pts_for desc = standings
    teams.sort(key=lambda t: (-t["wins"], -t["pts_for"]))
    return teams


def my_draft_picks(
    league_id: str, my_roster_id: int, seasons_ahead: int = 3
) -> dict:
    """Compute draft picks the user currently owns vs. traded away.

    Returns {acquired: [...], traded_away: [...], note: str}.
    """
    traded = _fetch_traded_picks(league_id) or []
    users = _fetch_league_users(league_id)
    rosters = _fetch_rosters(league_id)
    user_by_id = _build_user_map(users)
    roster_owner = _build_roster_owner_map(rosters)

    acquired = []
    traded_away = []
    current_season = _current_nfl_season()
    future = {current_season + i for i in range(0, seasons_ahead + 1)}

    for pk in traded:
        season = pk.get("season")
        try:
            season_int = int(season)
        except (TypeError, ValueError):
            continue
        if season_int not in future:
            continue
        rd = pk.get("round")
        original_roster_id = pk.get("roster_id")
        original_owner = user_by_id.get(roster_owner.get(original_roster_id))
        current_owner_roster = pk.get("owner_id")
        if current_owner_roster == my_roster_id and original_roster_id != my_roster_id:
            # Acquired from someone else
            acquired.append({
                "season": season_int,
                "round": rd,
                "from": original_owner or "?",
            })
        elif current_owner_roster != my_roster_id and original_roster_id == my_roster_id:
            # Mine originally, now someone else's
            new_owner = user_by_id.get(roster_owner.get(current_owner_roster))
            traded_away.append({
                "season": season_int,
                "round": rd,
                "to": new_owner or "?",
            })
    acquired.sort(key=lambda x: (x["season"], x["round"]))
    traded_away.sort(key=lambda x: (x["season"], x["round"]))
    return {
        "acquired": acquired,
        "traded_away": traded_away,
        "note": (
            "Default: you own your own pick in every round of every future rookie "
            "draft unless listed under 'traded_away' above. Picks you acquired via "
            "trade are listed under 'acquired'."
        ),
    }


def recent_transactions(league_id: str, limit: int = 15) -> list:
    """Decoded recent transactions: trades + FAAB waivers (adds/drops with names)."""
    txns = _fetch_recent_transactions(league_id)
    users = _fetch_league_users(league_id)
    rosters = _fetch_rosters(league_id)
    user_by_id = _build_user_map(users)
    roster_owner = _build_roster_owner_map(rosters)
    players = _load_sleeper_players()

    def pname(pid: str) -> str:
        p = players.get(pid) or {}
        return p.get("full_name") or pid

    def rname(rid) -> str:
        return user_by_id.get(roster_owner.get(rid), f"roster{rid}")

    out = []
    for t in txns:
        status = t.get("status")
        ttype = t.get("type")
        # Keep trades + completed waivers with real FAAB bids; skip failed/drops
        if status != "complete":
            continue
        if ttype == "trade":
            legs = []
            roster_ids = t.get("roster_ids") or []
            adds = t.get("adds") or {}
            dpicks = t.get("draft_picks") or []
            per_roster: dict = {rid: {"got_players": [], "got_picks": []} for rid in roster_ids}
            for pid, rid in adds.items():
                if rid in per_roster:
                    per_roster[rid]["got_players"].append(pname(pid))
            for pk in dpicks:
                new_rid = pk.get("owner_id")
                if new_rid in per_roster:
                    per_roster[new_rid]["got_picks"].append(
                        f"{pk.get('season')} R{pk.get('round')}"
                    )
            for rid, got in per_roster.items():
                parts = got["got_players"] + got["got_picks"]
                legs.append(f"{rname(rid)} got: {', '.join(parts) if parts else '—'}")
            out.append({
                "type": "trade",
                "status_updated": t.get("status_updated"),
                "summary": " | ".join(legs),
            })
        elif ttype == "waiver":
            faab = (t.get("settings") or {}).get("waiver_bid", 0) or 0
            if faab < 3:  # skip $0/$1 junk claims
                continue
            roster_ids = t.get("roster_ids") or []
            rid = roster_ids[0] if roster_ids else None
            adds = list((t.get("adds") or {}).keys())
            drops = list((t.get("drops") or {}).keys())
            if not adds:
                continue
            out.append({
                "type": "waiver",
                "status_updated": t.get("status_updated"),
                "summary": (
                    f"{rname(rid)} ${faab} waiver: +{pname(adds[0])}"
                    + (f", -{pname(drops[0])}" if drops else "")
                ),
            })
        if len(out) >= limit:
            break
    return out


def previous_seasons_history(league_id: str, max_depth: int = 2) -> list:
    """Walk `previous_league_id` chain to pull final standings from prior seasons."""
    out = []
    cur_id = league_id
    for _ in range(max_depth):
        league = _fetch_league(cur_id)
        if not league:
            break
        prev_id = league.get("previous_league_id")
        if not prev_id or prev_id in (None, "0", 0):
            break
        prev_league = _fetch_league(prev_id)
        if not prev_league:
            break
        prev_rosters = _fetch_rosters(prev_id)
        prev_users = _fetch_league_users(prev_id)
        user_by_id = _build_user_map(prev_users)
        standings = []
        for r in prev_rosters:
            s = r.get("settings") or {}
            name = user_by_id.get(r.get("owner_id"), r.get("owner_id")) or "—"
            pts = (s.get("fpts") or 0) + (s.get("fpts_decimal") or 0) / 100.0
            standings.append({
                "owner": name,
                "wins": s.get("wins", 0),
                "losses": s.get("losses", 0),
                "ties": s.get("ties", 0),
                "pts_for": round(pts, 1),
            })
        standings.sort(key=lambda t: (-t["wins"], -t["pts_for"]))
        out.append({
            "season": prev_league.get("season"),
            "name": prev_league.get("name"),
            "standings": standings,
        })
        cur_id = prev_id
    return out


# ── Main composer ────────────────────────────────────────────────

def user_sleeper_context(username: str) -> dict:
    """Full per-user Sleeper context for primary dynasty league."""
    if not username:
        return {}
    out: dict = {"username": username}
    uid = _sleeper_user_id(username)
    if not uid:
        return out
    out["sleeper_user_id"] = uid
    season = _current_nfl_season()

    leagues_key = f"sleeper:leagues:{uid}:{season}"
    leagues = _cache_get(leagues_key, _TTL_SLEEPER_LEAGUES)
    if leagues is None:
        try:
            leagues = _http_json(
                f"https://api.sleeper.app/v1/user/{uid}/leagues/nfl/{season}"
            ) or []
            _cache_set(leagues_key, leagues)
        except Exception:
            leagues = []
    if not leagues:
        return out

    out["leagues"] = [
        {"league_id": lg.get("league_id"), "name": lg.get("name"),
         "total_rosters": lg.get("total_rosters"), "status": lg.get("status")}
        for lg in leagues[:5]
    ]

    # Primary league = the first one; do full deep-pull
    primary = leagues[0]
    league_id = primary.get("league_id")
    if not league_id:
        return out

    league = _fetch_league(league_id) or primary
    rosters = _fetch_rosters(league_id)
    my_roster = next((r for r in rosters if r.get("owner_id") == uid), None)
    if not my_roster:
        return out

    players = _load_sleeper_players()

    # My roster (with taxi + IR annotated)
    taxi_ids = set(my_roster.get("taxi") or [])
    ir_ids = set(my_roster.get("reserve") or [])
    roster_players = []
    for pid in (my_roster.get("players") or []):
        p = players.get(pid) or {}
        slot = "TAXI" if pid in taxi_ids else ("IR" if pid in ir_ids else "")
        roster_players.append({
            "name": p.get("full_name") or pid,
            "pos": p.get("position"),
            "team": p.get("team"),
            "age": p.get("age"),
            "injury_status": p.get("injury_status") or "",
            "slot": slot,
        })

    s = my_roster.get("settings") or {}
    my_pts_for = (s.get("fpts") or 0) + (s.get("fpts_decimal") or 0) / 100.0

    out["primary_league"] = {
        "league_id": league_id,
        "name": league.get("name") or primary.get("name"),
        "total_rosters": league.get("total_rosters"),
        "roster_positions": _roster_positions(league),
        "scoring": _summarize_scoring(league),
        "status": league.get("status"),
        "season": league.get("season"),
        "record": {
            "wins": s.get("wins", 0),
            "losses": s.get("losses", 0),
            "ties": s.get("ties", 0),
            "pts_for": round(my_pts_for, 1),
        },
    }
    out["roster"] = roster_players
    out["standings"] = all_teams_summary(league_id)
    out["draft_picks"] = my_draft_picks(league_id, my_roster.get("roster_id"))
    out["recent_transactions"] = recent_transactions(league_id)
    out["history"] = previous_seasons_history(league_id)
    return out


# ── Snapshot composer ────────────────────────────────────────────

def build_snapshot() -> dict:
    """League-wide, user-agnostic facts snapshot."""
    return {
        "generated_at": int(time.time()),
        "injuries": injury_report(),
        "trending_adds": trending("add"),
        "trending_drops": trending("drop"),
        "news": espn_news(),
    }


# ── Prompt-ready formatting ──────────────────────────────────────

def format_for_prompt(snap: dict, compact: bool = False) -> str:
    """Render the snapshot as markdown suitable for system-prompt injection.

    compact=True keeps only the top items per section (for non-Historian agents).
    """
    lines: list[str] = []
    lines.append("# LIVE FACTS SNAPSHOT")
    lines.append("Source: Sleeper + ESPN. Treat this as authoritative for current state.")
    lines.append("")

    inj = snap.get("injuries") or []
    if inj:
        lines.append("## Injury report")
        show = inj[:8] if compact else inj[:30]
        for r in show:
            bp = f" ({r['body_part']})" if r.get("body_part") else ""
            lines.append(f"- {r['status']:<12} {r['pos']:<2} {r['team']:<3} {r['name']}{bp}")
        lines.append("")

    adds = snap.get("trending_adds") or []
    if adds:
        lines.append("## Trending adds (last 24h)")
        show = adds[:8] if compact else adds[:20]
        for r in show:
            lines.append(f"- {r.get('count','?'):>6} {r.get('pos') or '?':<3} {r.get('team') or '':<3} {r['name']}")
        lines.append("")

    drops = snap.get("trending_drops") or []
    if drops and not compact:
        lines.append("## Trending drops (last 24h)")
        for r in drops[:15]:
            lines.append(f"- {r.get('count','?'):>6} {r.get('pos') or '?':<3} {r.get('team') or '':<3} {r['name']}")
        lines.append("")

    news = snap.get("news") or []
    if news:
        lines.append("## Latest NFL news (ESPN)")
        show = news[:5] if compact else news[:12]
        for r in show:
            lines.append(f"- {r['title']}")
            if r.get("summary") and not compact:
                lines.append(f"  {r['summary']}")
        lines.append("")

    return "\n".join(lines)


def format_user_context(ctx: dict) -> str:
    """Render per-user Sleeper context as markdown for prompt injection.

    Emits one section per concept so agents can reference specifics:
    - LEAGUE SETUP (scoring, roster slots, size)
    - YOUR ROSTER (with TAXI/IR slots + ages)
    - STANDINGS (all teams, sorted)
    - YOUR DRAFT PICKS (acquired + traded-away)
    - RECENT TRANSACTIONS (trades + notable waivers)
    - PRIOR SEASONS (from previous_league_id chain)
    """
    if not ctx or not ctx.get("username"):
        return ""
    primary = ctx.get("primary_league") or {}
    if not primary:
        # User is linked but has no active league this season
        return f"# USER CONTEXT\nSleeper username: {ctx['username']}\n(no active leagues this season)"

    lines: list[str] = ["# USER CONTEXT"]
    lines.append(f"Sleeper username: **{ctx['username']}**")

    # ── League setup ────────────────────────────────────────
    lines.append("")
    lines.append("## League setup")
    lines.append(f"Name: {primary.get('name','?')}")
    lines.append(f"Season: {primary.get('season','?')} | Status: {primary.get('status','?')} | Teams: {primary.get('total_rosters','?')}")
    rp = primary.get("roster_positions") or []
    if rp:
        # Collapse BN repetitions for readability
        from collections import Counter
        counts = Counter(rp)
        slot_parts = []
        for slot in ["QB", "RB", "WR", "TE", "FLEX", "SUPER_FLEX", "WRRB_FLEX", "REC_FLEX", "K", "DEF", "IDP_FLEX", "DL", "LB", "DB", "BN", "TAXI", "IR"]:
            if slot in counts:
                slot_parts.append(f"{slot}×{counts[slot]}")
        lines.append(f"Roster: {', '.join(slot_parts)}")
    scoring = primary.get("scoring") or {}
    if scoring:
        lines.append("Scoring: " + ", ".join(f"{k}={v}" for k, v in scoring.items()))
    rec = primary.get("record") or {}
    lines.append(
        f"Your record: {rec.get('wins',0)}-{rec.get('losses',0)}"
        + (f"-{rec['ties']}" if rec.get("ties") else "")
        + f" | PF: {rec.get('pts_for',0)}"
    )

    # ── Your roster ─────────────────────────────────────────
    roster = ctx.get("roster") or []
    if roster:
        lines.append("")
        lines.append("## Your roster")
        for p in roster:
            slot = f" [{p['slot']}]" if p.get("slot") else ""
            inj = f" ({p['injury_status']})" if p.get("injury_status") else ""
            age = f" age {p['age']}" if p.get("age") is not None else ""
            lines.append(f"- {p.get('pos','?'):<3} {p.get('team','') or '':<3} {p['name']}{age}{slot}{inj}")

    # ── Standings ───────────────────────────────────────────
    standings = ctx.get("standings") or []
    if standings:
        lines.append("")
        lines.append("## League standings")
        for i, t in enumerate(standings, 1):
            rec = f"{t['wins']}-{t['losses']}" + (f"-{t['ties']}" if t.get("ties") else "")
            lines.append(f"{i:>2}. {t['owner']:<20} {rec:<7} PF {t['pts_for']}")

    # ── Draft picks ─────────────────────────────────────────
    picks = ctx.get("draft_picks") or {}
    acq = picks.get("acquired") or []
    gave = picks.get("traded_away") or []
    if acq or gave or picks.get("note"):
        lines.append("")
        lines.append("## Your draft picks")
        if acq:
            lines.append("Acquired from trades:")
            for pk in acq:
                lines.append(f"- {pk['season']} Round {pk['round']} (from {pk['from']})")
        if gave:
            lines.append("Traded away:")
            for pk in gave:
                lines.append(f"- {pk['season']} Round {pk['round']} (to {pk['to']})")
        if not acq and not gave:
            lines.append("No traded rookie picks on record.")
        if picks.get("note"):
            lines.append(f"_Note: {picks['note']}_")

    # ── Recent transactions ─────────────────────────────────
    txns = ctx.get("recent_transactions") or []
    if txns:
        lines.append("")
        lines.append("## Recent league transactions")
        for t in txns[:12]:
            tag = "TRADE" if t.get("type") == "trade" else "WAIVER"
            lines.append(f"- {tag}: {t.get('summary','')}")

    # ── Prior seasons ───────────────────────────────────────
    history = ctx.get("history") or []
    if history:
        lines.append("")
        lines.append("## Prior seasons (multi-year dynasty history)")
        for h in history:
            lines.append(f"### {h.get('season','?')} final standings — {h.get('name','?')}")
            for i, t in enumerate((h.get("standings") or [])[:12], 1):
                rec = f"{t['wins']}-{t['losses']}" + (f"-{t['ties']}" if t.get("ties") else "")
                lines.append(f"{i:>2}. {t['owner']:<20} {rec:<7} PF {t['pts_for']}")

    leagues = ctx.get("leagues") or []
    if len(leagues) > 1:
        lines.append("")
        lines.append(f"_Other leagues: {len(leagues)-1} more on Sleeper; not shown._")

    return "\n".join(lines)
