"""
Dynasty functions — rankings, trade values, trade finder, trade value chart,
dynasty dashboard, tier list, power rankings, roster value/grade, pick values,
auction values.
"""

import logging
import math
from collections import defaultdict
from bisect import bisect_left, bisect_right

from ..db import get_db

logger = logging.getLogger("razzle.live_data.dynasty")
from .core import (
    _cached, _CACHE_TTL_STABLE,
    _current_nfl_season, _current_draft_year,
    compute_trade_value, _production_value, _age_value, _scarcity_value,
    _pick_value, _assign_tier, _TIER_LABELS, _tv_tier, _TV_TIER_LABELS,
    _roster_grade, _competing_status,
)


# ---------------------------------------------------------------------------
# Trade Value Model
# ---------------------------------------------------------------------------

def _fetch_trade_values_uncached(player_ids):
    """Return trade values for a list of player IDs."""
    if not player_ids:
        return []

    with get_db() as conn:

        # Get latest season
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        latest_season = row[0] if row and row[0] else _current_nfl_season()

        placeholders = ",".join(["?"] * len(player_ids))

        # Fetch player bio + season PPR PPG
        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            LEFT JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.player_id IN ({placeholders})
            GROUP BY p.player_id
        """
        params = [latest_season] + list(player_ids)
        rows = conn.execute(query, params).fetchall()

        results = []
        for r in rows:
            pid = r[0]
            name = r[1] or "Unknown"
            pos = r[2] or "WR"
            team = r[3] or "FA"
            age = r[4]
            total_ppr = r[5] or 0
            games = r[6] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0

            prod_score = round(_production_value(ppg, pos), 1)
            age_score = round(_age_value(age, pos), 1)
            scarcity_score = round(_scarcity_value(pos), 1)
            trade_value = compute_trade_value(ppg, age, pos)

            results.append({
                "player_id": pid,
                "full_name": name,
                "position": pos,
                "team": team,
                "age": age,
                "ppg": ppg,
                "games": games,
                "trade_value": trade_value,
                "components": {
                    "production": prod_score,
                    "age": age_score,
                    "scarcity": scarcity_score,
                },
            })

        return results



def fetch_trade_values(player_ids):
    _key = "fetch_trade_values:" + ":".join(sorted(str(x) for x in player_ids))
    return _cached(_key, lambda: _fetch_trade_values_uncached(player_ids=player_ids))

def _fetch_pick_values_uncached(year=None, rounds=4, teams=12):
    """Return trade values for all dynasty draft picks."""
    if year is None:
        year = _current_draft_year()
    picks = []
    for rd in range(1, rounds + 1):
        for pk in range(1, teams + 1):
            overall = (rd - 1) * teams + pk
            label = f"{year} {rd}.{pk:02d}"
            picks.append({
                "pick_label": label,
                "year": year,
                "round": rd,
                "pick": pk,
                "overall": overall,
                "trade_value": _pick_value(overall),
            })
    return picks



def fetch_pick_values(year=None, rounds=4, teams=12):
    if year is None:
        year = _current_draft_year()
    return _cached(f"fetch_pick_values:{year}:{rounds}:{teams}", lambda: _fetch_pick_values_uncached(year=year, rounds=rounds, teams=teams))

def _fetch_roster_value_uncached(player_ids):
    """Compute roster-level dynasty value analysis."""
    players = fetch_trade_values(player_ids)
    if not players:
        return {
            "players": [],
            "total_value": 0,
            "positional_totals": {},
            "average_age": 0,
            "grade": "F",
            "competing_status": "rebuilding",
        }

    total_value = sum(p["trade_value"] for p in players)

    pos_totals = {}
    pos_counts = {}
    ages = []
    for p in players:
        pos = p["position"]
        pos_totals[pos] = pos_totals.get(pos, 0) + p["trade_value"]
        pos_counts[pos] = pos_counts.get(pos, 0) + 1
        if p["age"]:
            ages.append(p["age"])

    avg_age = round(sum(ages) / len(ages), 1) if ages else 0

    return {
        "players": players,
        "total_value": round(total_value, 1),
        "positional_totals": pos_totals,
        "positional_counts": pos_counts,
        "average_age": avg_age,
        "grade": _roster_grade(total_value),
        "competing_status": _competing_status(avg_age, total_value),
    }



def fetch_roster_value(player_ids):
    _key = "fetch_roster_value:" + ":".join(sorted(str(x) for x in player_ids))
    return _cached(_key, lambda: _fetch_roster_value_uncached(player_ids=player_ids))

def _fetch_dynasty_rankings_uncached(season=None, position=None, limit=200):
    """Return top dynasty-relevant players ranked by dynasty value with tiers."""
    limit = max(1, min(300, limit))
    with get_db() as conn:

        available_seasons = [r[0] for r in conn.execute(
            "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
        ).fetchall()]

        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            latest_season = row[0] if row and row[0] else _current_nfl_season()
        else:
            latest_season = season

        pos_filter = ""
        params = [latest_season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 3
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, params).fetchall()

        results = []
        for r in rows:
            pid = r[0]
            name = r[1] or "Unknown"
            pos = r[2] or "WR"
            team = r[3] or "FA"
            age = r[4]
            headshot = r[5] or ""
            total_ppr = r[6] or 0
            games = r[7] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0

            trade_value = compute_trade_value(ppg, age, pos)
            tier = _assign_tier(trade_value)

            results.append({
                "player_id": pid,
                "full_name": name,
                "position": pos,
                "team": team,
                "age": age,
                "headshot_url": headshot,
                "ppg": ppg,
                "games": games,
                "dynasty_value": trade_value,
                "tier": tier,
                "tier_label": _TIER_LABELS[tier],
            })

        # Sort by dynasty value descending
        results.sort(key=lambda x: x["dynasty_value"], reverse=True)
        results = results[:limit]

        # Group by tier for convenience
        tiers = {}
        for p in results:
            t = p["tier"]
            if t not in tiers:
                tiers[t] = {"tier": t, "label": _TIER_LABELS[t], "players": []}
            tiers[t]["players"].append(p)

        return {
            "players": results,
            "tiers": [tiers[t] for t in sorted(tiers.keys())],
            "total": len(results),
            "season": latest_season,
            "available_seasons": available_seasons,
        }


# ---------------------------------------------------------------------------
# Trade Value Chart
# ---------------------------------------------------------------------------


def fetch_dynasty_rankings(season=None, position=None, limit=200):
    return _cached(f"fetch_dynasty_rankings:{season}:{position}:{limit}", lambda: _fetch_dynasty_rankings_uncached(season=season, position=position, limit=limit))


def _fetch_dynasty_history_uncached(position=None, limit=20, player_ids=None):
    """Return dynasty value progression for top players across all seasons."""
    limit = max(1, min(50, limit))
    with get_db() as conn:
        available_seasons = [r[0] for r in conn.execute(
            "SELECT DISTINCT season FROM player_week_stats ORDER BY season ASC"
        ).fetchall()]

        if not available_seasons:
            return {"players": [], "seasons": []}

        latest = available_seasons[-1]

        if player_ids:
            # Fetch specific players by ID
            placeholders = ",".join(["?"] * len(player_ids))
            top_players = conn.execute(f"""
                SELECT p.player_id, p.full_name, p.position, p.team, p.headshot_url,
                       0 as ppg
                FROM players p
                WHERE p.player_id IN ({placeholders})
            """, player_ids).fetchall()
        else:
            # Get top players from latest season
            pos_filter = ""
            params = [latest]
            if position and position.upper() in ("QB", "RB", "WR", "TE"):
                pos_filter = "AND p.position = ?"
                params.append(position.upper())

            top_query = f"""
                SELECT p.player_id, p.full_name, p.position, p.team, p.headshot_url,
                       SUM(s.fantasy_points_ppr) / COUNT(DISTINCT s.week) as ppg
                FROM players p
                JOIN player_week_stats s ON s.player_id = p.player_id AND s.season = ?
                WHERE p.position IN ('QB','RB','WR','TE')
                  AND p.fantasy_relevant = 1
                  {pos_filter}
                GROUP BY p.player_id
                HAVING COUNT(DISTINCT s.week) >= 3
                ORDER BY ppg DESC
                LIMIT ?
            """
            params.append(limit)
            top_players = conn.execute(top_query, params).fetchall()

        player_ids = [r[0] for r in top_players]
        if not player_ids:
            return {"players": [], "seasons": available_seasons}

        player_info = {}
        for r in top_players:
            player_info[r[0]] = {
                "player_id": r[0], "full_name": r[1], "position": r[2],
                "team": r[3], "headshot_url": r[4] or "",
            }

        # Get PPG per season for each player
        placeholders = ",".join(["?"] * len(player_ids))
        history_query = f"""
            SELECT s.player_id, s.season,
                   SUM(s.fantasy_points_ppr) / COUNT(DISTINCT s.week) as ppg,
                   COUNT(DISTINCT s.week) as games
            FROM player_week_stats s
            WHERE s.player_id IN ({placeholders})
            GROUP BY s.player_id, s.season
            HAVING games >= 3
            ORDER BY s.season ASC
        """
        rows = conn.execute(history_query, player_ids).fetchall()

        # Build per-player history
        player_history = {}
        for r in rows:
            pid, season, ppg, games = r[0], r[1], r[2] or 0, r[3] or 0
            if pid not in player_history:
                player_history[pid] = {}
            age_in_season = None
            info = player_info.get(pid, {})
            pos = info.get("position", "WR")
            tv = compute_trade_value(round(ppg, 2), age_in_season, pos)
            player_history[pid][season] = {
                "season": season, "ppg": round(ppg, 2),
                "games": games, "trade_value": tv
            }

        results = []
        for pid in player_ids:
            info = player_info[pid]
            seasons_data = []
            for s in available_seasons:
                if s in player_history.get(pid, {}):
                    seasons_data.append(player_history[pid][s])
                else:
                    seasons_data.append(None)
            info["history"] = seasons_data
            results.append(info)

        return {
            "players": results,
            "seasons": available_seasons,
        }


def fetch_dynasty_history(position=None, limit=20, player_ids=None):
    if player_ids:
        key = f"fetch_dynasty_history:ids:{','.join(sorted(player_ids[:5]))}"
        return _cached(key, lambda: _fetch_dynasty_history_uncached(player_ids=player_ids))
    return _cached(f"fetch_dynasty_history:{position}:{limit}", lambda: _fetch_dynasty_history_uncached(position=position, limit=limit))


def _fetch_trade_value_chart_uncached(season=None, position=None, limit=150):
    """Return all fantasy-relevant players ranked by trade value with component breakdown."""
    limit = max(1, min(300, limit))
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, params).fetchall()

        results = []
        for r in rows:
            pid = r[0]
            name = r[1] or "Unknown"
            pos = r[2] or "WR"
            team = r[3] or "FA"
            age = r[4]
            headshot = r[5] or ""
            total_ppr = r[6] or 0
            games = r[7] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0

            prod_score = round(_production_value(ppg, pos), 1)
            age_score = round(_age_value(age, pos), 1)
            scarcity_score = round(_scarcity_value(pos), 1)
            tv = compute_trade_value(ppg, age, pos)
            tier = _tv_tier(tv)

            results.append({
                "player_id": pid,
                "full_name": name,
                "position": pos,
                "team": team,
                "age": age,
                "headshot_url": headshot,
                "ppg": ppg,
                "games": games,
                "trade_value": tv,
                "production_score": prod_score,
                "age_score": age_score,
                "scarcity_score": scarcity_score,
                "tier": tier,
                "tier_label": _TV_TIER_LABELS[tier],
            })

        results.sort(key=lambda x: x["trade_value"], reverse=True)
        results = results[:limit]

        for i, p in enumerate(results):
            p["rank"] = i + 1

        return {
            "season": season,
            "available_seasons": available_seasons,
            "players": results,
            "total": len(results),
        }


# ---------------------------------------------------------------------------
# Trade Finder
# ---------------------------------------------------------------------------


def fetch_trade_value_chart(season=None, position=None, limit=150):
    return _cached(f"fetch_trade_value_chart:{season}:{position}:{limit}", lambda: _fetch_trade_value_chart_uncached(season=season, position=position, limit=limit))

def _fetch_trade_finder_uncached(player_id, season=None):
    """Given a player, find equal-value trade targets plus buy-low/sell-high opportunities."""

    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        # Get all fantasy-relevant players with trade values
        rows = conn.execute("""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """, [season]).fetchall()

        if not rows:
            return {"error": "No data available", "season": season, "available_seasons": available_seasons}

        # Build player map with trade values
        all_players = []
        selected = None
        for r in rows:
            pid = r[0]
            name = r[1] or "Unknown"
            pos = r[2] or "WR"
            team = r[3] or "FA"
            age = r[4]
            headshot = r[5] or ""
            total_ppr = r[6] or 0
            games = r[7] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0

            tv = compute_trade_value(ppg, age, pos)
            tier = _tv_tier(tv)
            prod_score = round(_production_value(ppg, pos), 1)
            age_score = round(_age_value(age, pos), 1)
            scarcity_score = round(_scarcity_value(pos), 1)

            p = {
                "player_id": pid,
                "full_name": name,
                "position": pos,
                "team": team,
                "age": age,
                "headshot_url": headshot,
                "ppg": ppg,
                "games": games,
                "trade_value": tv,
                "production_score": prod_score,
                "age_score": age_score,
                "scarcity_score": scarcity_score,
                "tier": tier,
                "tier_label": _TV_TIER_LABELS[tier],
            }
            all_players.append(p)
            if pid == player_id:
                selected = dict(p)

        if not selected:
            # Look up basic player info for a helpful error message
            basic = conn.execute("""
                SELECT p.player_id, p.full_name, p.position, p.team, p.headshot_url,
                       COALESCE(SUM(s.fantasy_points_ppr), 0) as total,
                       COUNT(DISTINCT s.week) as gp
                FROM players p
                LEFT JOIN player_week_stats s ON s.player_id = p.player_id AND s.season = ?
                WHERE p.player_id = ?
                GROUP BY p.player_id
            """, [season, player_id]).fetchone()
            if basic and basic[1]:
                gp = basic[6] or 0
                ppg = round(basic[5] / gp, 1) if gp > 0 else 0
                return {
                    "error": "not_enough_data",
                    "message": f"{basic[1]} doesn't qualify — needs 4+ games and 2+ PPG (has {gp} GP, {ppg} PPG)",
                    "player_name": basic[1],
                    "position": basic[2],
                    "team": basic[3],
                    "headshot_url": basic[4] or "",
                    "games": gp,
                    "ppg": ppg,
                    "season": season,
                    "available_seasons": available_seasons,
                }
            return {"error": "Player not found in database", "season": season, "available_seasons": available_seasons}

        # Compute stock scores for all players (simplified — PPO/CoV/SOS/PPG percentiles)
        weekly_rows = conn.execute("""
            SELECT s.player_id, s.fantasy_points_ppr, s.targets, s.carries
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB','RB','WR','TE')
            ORDER BY s.player_id
        """, [season]).fetchall()

        weekly_data = defaultdict(list)
        opp_data = defaultdict(lambda: {"total_ppr": 0, "opps": 0})
        for wr in weekly_rows:
            wpid, wppg, wtgt, wcar = wr[0], wr[1] or 0, wr[2] or 0, wr[3] or 0
            weekly_data[wpid].append(wppg)
            opp_data[wpid]["total_ppr"] += wppg
            opp_data[wpid]["opps"] += wtgt + wcar

        # Build PPO and CoV for stock scoring
        ppo_vals = {}
        cov_vals = {}
        ppg_vals = {}
        for p in all_players:
            pid = p["player_id"]
            weeks = weekly_data.get(pid, [])
            opps = opp_data.get(pid, {}).get("opps", 0)
            total = opp_data.get(pid, {}).get("total_ppr", 0)
            ppo = round(total / opps, 2) if opps > 0 else 0
            ppo_vals[pid] = ppo

            if len(weeks) >= 3:
                mean = sum(weeks) / len(weeks)
                variance = sum((x - mean) ** 2 for x in weeks) / max(1, len(weeks) - 1)
                std = math.sqrt(variance)
                cov = (std / mean * 100) if mean > 0 else 999
            else:
                cov = 999
            cov_vals[pid] = cov
            ppg_vals[pid] = p["ppg"]

        # Pre-sort for efficient percentile ranking
        ppo_sorted = sorted(ppo_vals.values())
        cov_sorted = sorted(cov_vals.values())  # ascending — lower CoV is better
        ppg_sorted = sorted(ppg_vals.values())
        n_players = len(all_players)

        def pct_rank(sorted_asc, value, total):
            """Percentile: fraction of values below this value."""
            if total == 0:
                return 50
            return round(bisect_left(sorted_asc, value) / total * 100)

        def pct_rank_inv(sorted_asc, value, total):
            """Inverted percentile: fraction of values above this value (lower = better)."""
            if total == 0:
                return 50
            above = total - bisect_right(sorted_asc, value)
            return round(above / total * 100)

        # Assign stock data to all players
        player_map = {}
        for p in all_players:
            pid = p["player_id"]
            ppo_pct = pct_rank(ppo_sorted, ppo_vals.get(pid, 0), n_players)
            cov_pct = pct_rank_inv(cov_sorted, cov_vals.get(pid, 999), n_players)
            ppg_pct = pct_rank(ppg_sorted, ppg_vals.get(pid, 0), n_players)
            # Stock score: 3-factor simplified model (excludes SOS to avoid heavy
            # defense grid query). Stock watch uses 4-factor with SOS at 25% each.
            # Here we weight PPO/CoV/PPG at ~33% each — directionally similar.
            stock_score = round(ppo_pct * 0.33 + cov_pct * 0.33 + ppg_pct * 0.34)
            stock_delta = stock_score - round(ppg_pct)
            p["stock_score"] = stock_score
            p["stock_delta"] = stock_delta
            if stock_delta > 5:
                p["stock_trend"] = "rising"
            elif stock_delta < -5:
                p["stock_trend"] = "falling"
            else:
                p["stock_trend"] = "stable"
            player_map[pid] = p

        sel_tv = selected["trade_value"]
        selected_full = player_map.get(player_id, selected)

        # Find targets
        VALUE_RANGE = 8  # +/- points for equal value
        equal_targets = []
        buy_low = []
        sell_high = []

        for p in all_players:
            if p["player_id"] == player_id:
                continue
            diff = round(p["trade_value"] - sel_tv, 1)
            p_copy = dict(p)
            p_copy["value_diff"] = diff

            # Equal value: within +/- VALUE_RANGE
            is_equal = abs(diff) <= VALUE_RANGE
            if is_equal:
                equal_targets.append(p_copy)

            # Buy low: higher trade value but falling stock — exclude equal-value dupes
            if not is_equal and diff > 0 and diff <= 15 and p.get("stock_trend") == "falling":
                buy_low.append(p_copy)

            # Sell high: lower trade value but rising stock — exclude equal-value dupes
            if not is_equal and diff < 0 and diff >= -15 and p.get("stock_trend") == "rising":
                sell_high.append(p_copy)

        # Sort
        equal_targets.sort(key=lambda x: abs(x["value_diff"]))
        buy_low.sort(key=lambda x: x["stock_delta"])  # most negative delta first
        sell_high.sort(key=lambda x: x["stock_delta"], reverse=True)  # most positive delta first

        return {
            "season": season,
            "available_seasons": available_seasons,
            "selected_player": selected_full,
            "equal_targets": equal_targets[:25],
            "buy_low": buy_low[:15],
            "sell_high": sell_high[:15],
        }


# ---------------------------------------------------------------------------
# Roster Builder — Grade a hypothetical dynasty roster
# ---------------------------------------------------------------------------


def fetch_trade_finder(player_id, season=None):
    return _cached(f"fetch_trade_finder:{player_id}:{season}", lambda: _fetch_trade_finder_uncached(player_id=player_id, season=season))

def _fetch_roster_grade_uncached(player_ids, season=None):
    """Grade a set of player IDs as a dynasty roster.

    Returns overall grade (A+ to F), dimension scores, and per-player details.
    Dimensions: trade_value (avg), vorp (avg), age_balance, positional_depth.
    """
    if not player_ids:
        return {"error": "No players provided", "overall_grade": "F", "overall_score": 0}

    # Cap at 25 roster slots
    player_ids = list(player_ids)[:25]

    with get_db() as conn:
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        latest_season = season or (row[0] if row and row[0] else _current_nfl_season())

        placeholders = ",".join(["?"] * len(player_ids))
        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            LEFT JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.player_id IN ({placeholders})
            GROUP BY p.player_id
        """
        params = [latest_season] + player_ids
        rows = conn.execute(query, params).fetchall()

        if not rows:
            return {"error": "No players found", "overall_grade": "F", "overall_score": 0}

        # Build player details
        players = []
        for r in rows:
            games = r[7] or 0
            total_ppr = r[6] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0
            pos = r[2] or "WR"
            age = r[4] or 25
            tv = compute_trade_value(ppg, age, pos)

            # Compute VORP using standard thresholds
            repl_ppg = {
                "QB": 14.5, "RB": 8.0, "WR": 8.5, "TE": 7.0
            }.get(pos, 8.0)
            vorp = round(ppg - repl_ppg, 2)

            players.append({
                "player_id": r[0],
                "full_name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "age": age,
                "headshot_url": r[5] or "",
                "ppg": ppg,
                "games": games,
                "trade_value": tv,
                "vorp": vorp,
            })

        # --- Dimension 1: Trade Value (avg of all players, scaled to 0-100) ---
        avg_tv = sum(p["trade_value"] for p in players) / len(players)
        # Good rosters avg ~45-55 trade value; scale so 50 = 75 score
        tv_score = min(100, max(0, avg_tv * 1.5))

        # --- Dimension 2: VORP (sum, more positive = better) ---
        total_vorp = sum(p["vorp"] for p in players)
        # Good rosters have ~30-60 total VORP; scale
        vorp_score = min(100, max(0, 50 + total_vorp * 1.2))

        # --- Dimension 3: Age Balance (penalize all-old or all-young) ---
        ages = [p["age"] for p in players if p["age"]]
        if ages:
            avg_age = sum(ages) / len(ages)
            # Ideal avg age is ~25-26 for dynasty
            age_dev = abs(avg_age - 25.5)
            age_score = max(0, 100 - age_dev * 12)
            # Bonus for age diversity (std dev)
            if len(ages) > 1:
                age_std = math.sqrt(sum((a - avg_age) ** 2 for a in ages) / len(ages))
                # Some diversity is good (std ~3-4), too much or too little is bad
                diversity_bonus = max(0, 15 - abs(age_std - 3.5) * 5)
                age_score = min(100, age_score + diversity_bonus)
        else:
            age_score = 50

        # --- Dimension 4: Positional Depth ---
        pos_counts = {}
        for p in players:
            pos_counts[p["position"]] = pos_counts.get(p["position"], 0) + 1

        # Ideal dynasty roster: 1-2 QB, 5-7 RB, 6-8 WR, 2-3 TE
        ideal = {"QB": 2, "RB": 6, "WR": 7, "TE": 2}
        depth_score = 100
        for pos, ideal_count in ideal.items():
            actual = pos_counts.get(pos, 0)
            diff = abs(actual - ideal_count)
            depth_score -= diff * 8  # -8 per player off from ideal
        # Penalize missing positions heavily
        for pos in ("QB", "RB", "WR", "TE"):
            if pos_counts.get(pos, 0) == 0:
                depth_score -= 15
        depth_score = max(0, min(100, depth_score))

        # --- Overall Score (weighted) ---
        overall_score = round(
            tv_score * 0.35 + vorp_score * 0.25 + age_score * 0.20 + depth_score * 0.20
        )
        overall_score = max(0, min(100, overall_score))

        # Grade mapping
        grade_thresholds = [
            (95, "A+"), (90, "A"), (85, "A-"),
            (80, "B+"), (75, "B"), (70, "B-"),
            (65, "C+"), (60, "C"), (55, "C-"),
            (50, "D+"), (45, "D"), (40, "D-"),
        ]
        overall_grade = "F"
        for threshold, grade in grade_thresholds:
            if overall_score >= threshold:
                overall_grade = grade
                break

        # Position summary
        position_summary = {}
        for pos in ("QB", "RB", "WR", "TE"):
            pos_players = [p for p in players if p["position"] == pos]
            position_summary[pos] = {
                "count": len(pos_players),
                "avg_trade_value": round(sum(p["trade_value"] for p in pos_players) / len(pos_players), 1) if pos_players else 0,
                "total_vorp": round(sum(p["vorp"] for p in pos_players), 1),
            }

        total_trade_value = round(sum(p["trade_value"] for p in players), 1)

        return {
            "overall_grade": overall_grade,
            "overall_score": overall_score,
            "total_trade_value": total_trade_value,
            "player_count": len(players),
            "dimensions": {
                "trade_value": round(tv_score, 1),
                "vorp": round(vorp_score, 1),
                "age_balance": round(age_score, 1),
                "positional_depth": round(depth_score, 1),
            },
            "position_summary": position_summary,
            "players": sorted(players, key=lambda x: x["trade_value"], reverse=True),
        }


# ---------------------------------------------------------------------------
# Auction Value Calculator
# ---------------------------------------------------------------------------


def fetch_roster_grade(player_ids, season=None):
    _key = "fetch_roster_grade:" + ":".join(sorted(str(x) for x in player_ids)) + f":{season}"
    return _cached(_key, lambda: _fetch_roster_grade_uncached(player_ids=player_ids, season=season))

def _fetch_auction_values_uncached(season=None, budget=200, roster_size=15):
    """Convert trade values into auction dollar amounts for a given budget and roster size."""
    budget = max(50, min(500, budget))
    roster_size = max(8, min(25, roster_size))
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        query = """
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, [season]).fetchall()

        players = []
        for r in rows:
            pid = r[0]
            name = r[1] or "Unknown"
            pos = r[2] or "WR"
            team = r[3] or "FA"
            age = r[4]
            headshot = r[5] or ""
            total_ppr = r[6] or 0
            games = r[7] or 1
            ppg = round(total_ppr / games, 2)
            tv = compute_trade_value(ppg, age, pos)

            players.append({
                "player_id": pid,
                "full_name": name,
                "position": pos,
                "team": team,
                "age": age,
                "headshot_url": headshot,
                "ppg": ppg,
                "games": games,
                "trade_value": tv,
            })

        players.sort(key=lambda x: x["trade_value"], reverse=True)

        # Convert trade values to auction dollars
        # Top roster_size players should sum to approximately budget
        reserve = roster_size  # $1 per roster spot minimum
        allocatable = max(1, budget - reserve)
        # Use top N players' TV as denominator so a team's picks sum to budget
        top_n_tv = sum(p["trade_value"] for p in players[:roster_size]) or 1.0

        for i, p in enumerate(players):
            p["rank"] = i + 1
            # Dollar value = proportional share of allocatable budget
            raw_dollars = (p["trade_value"] / top_n_tv) * allocatable
            # Cap at budget, floor at $1
            p["auction_value"] = max(1, min(budget, round(raw_dollars)))
            # Value tier
            if p["auction_value"] >= 40:
                p["tier"] = "premium"
            elif p["auction_value"] >= 20:
                p["tier"] = "starter"
            elif p["auction_value"] >= 10:
                p["tier"] = "value"
            elif p["auction_value"] >= 5:
                p["tier"] = "bargain"
            else:
                p["tier"] = "dollar"

        # Position group summaries
        pos_totals = {}
        for pos in ("QB", "RB", "WR", "TE"):
            pos_players = [p for p in players if p["position"] == pos]
            pos_totals[pos] = {
                "count": len(pos_players),
                "total_value": sum(p["auction_value"] for p in pos_players),
                "avg_value": round(sum(p["auction_value"] for p in pos_players) / len(pos_players), 1) if pos_players else 0,
                "top_value": pos_players[0]["auction_value"] if pos_players else 0,
            }

        return {
            "season": season,
            "available_seasons": available_seasons,
            "budget": budget,
            "roster_size": roster_size,
            "players": players[:200],
            "position_totals": pos_totals,
        }


# ---------------------------------------------------------------------------
# Dynasty Dashboard — At-a-Glance Overview
# ---------------------------------------------------------------------------


def fetch_auction_values(season=None, budget=200, roster_size=15):
    return _cached(f"fetch_auction_values:{season}:{budget}:{roster_size}", lambda: _fetch_auction_values_uncached(season=season, budget=budget, roster_size=roster_size))

def _fetch_dynasty_dashboard_uncached(season=None):
    """Aggregated dynasty dashboard: risers, fallers, value picks, scarcity alerts."""
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        # Get all fantasy-relevant players with stats
        query = """
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, [season]).fetchall()

        # Build player list with all metrics
        players = []
        for r in rows:
            pos = r[2] or "WR"
            games = r[7] or 1
            ppg = round((r[6] or 0) / games, 2)
            age = r[4] or 25
            tv = compute_trade_value(ppg, age, pos)

            players.append({
                "player_id": r[0],
                "full_name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "age": age,
                "headshot_url": r[5] or "",
                "ppg": ppg,
                "games": games,
                "trade_value": tv,
            })

        # Rank by PPG and trade value
        players.sort(key=lambda x: x["ppg"], reverse=True)
        for i, p in enumerate(players):
            p["ppg_rank"] = i + 1

        players.sort(key=lambda x: x["trade_value"], reverse=True)
        for i, p in enumerate(players):
            p["tv_rank"] = i + 1
            p["rank_diff"] = p["ppg_rank"] - p["tv_rank"]

        # Risers: trade value much higher than PPG rank (undervalued by production age/scarcity boost)
        risers = sorted(
            [p for p in players if p["rank_diff"] > 5],
            key=lambda x: x["rank_diff"], reverse=True
        )[:8]

        # Fallers: PPG rank much higher than trade value rank (overvalued)
        fallers = sorted(
            [p for p in players if p["rank_diff"] < -5],
            key=lambda x: x["rank_diff"]
        )[:8]

        # Value picks: high trade value, young, good PPG
        value_picks = sorted(
            [p for p in players if p["age"] <= 26 and p["ppg"] >= 10 and p["trade_value"] >= 40],
            key=lambda x: x["trade_value"], reverse=True
        )[:8]

        # Position scarcity: top player PPG by position and drop-off
        pos_scarcity = {}
        for pos in ("QB", "RB", "WR", "TE"):
            pos_players = sorted(
                [p for p in players if p["position"] == pos],
                key=lambda x: x["ppg"], reverse=True
            )
            if len(pos_players) >= 2:
                top_ppg = pos_players[0]["ppg"]
                mid_idx = min(11, len(pos_players) - 1)
                mid_ppg = pos_players[mid_idx]["ppg"]
                drop = round(top_ppg - mid_ppg, 1)
                pos_scarcity[pos] = {
                    "top_player": pos_players[0]["full_name"],
                    "top_ppg": top_ppg,
                    "mid_player": pos_players[mid_idx]["full_name"],
                    "mid_ppg": mid_ppg,
                    "dropoff": drop,
                    "count": len(pos_players),
                }

        # League trends: avg age, avg PPG by position
        trends = {}
        for pos in ("QB", "RB", "WR", "TE"):
            pos_p = [p for p in players if p["position"] == pos]
            if pos_p:
                trends[pos] = {
                    "count": len(pos_p),
                    "avg_ppg": round(sum(p["ppg"] for p in pos_p) / len(pos_p), 1),
                    "avg_age": round(sum(p["age"] for p in pos_p) / len(pos_p), 1),
                    "avg_tv": round(sum(p["trade_value"] for p in pos_p) / len(pos_p), 1),
                }

        # Top 5 overall
        top5 = sorted(players, key=lambda x: x["trade_value"], reverse=True)[:5]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "total_players": len(players),
            "top5": top5,
            "risers": risers,
            "fallers": fallers,
            "value_picks": value_picks,
            "position_scarcity": pos_scarcity,
            "trends": trends,
        }


# ---------------------------------------------------------------------------
# Dynasty Tier List
# ---------------------------------------------------------------------------

_TIER_BREAKS = [
    (80, "S", "Elite — untouchable dynasty cornerstones"),
    (65, "A", "Blue Chip — premium assets with staying power"),
    (50, "B", "Solid — reliable starters with upside"),
    (35, "C", "Flex — startable but replaceable"),
    (20, "D", "Depth — roster filler with some value"),
    (0, "F", "Cut Bait — minimal dynasty value"),
]


def fetch_dynasty_dashboard(season=None):
    return _cached(f"fetch_dynasty_dashboard:{season}", lambda: _fetch_dynasty_dashboard_uncached(season=season))

def _fetch_tier_list_uncached(season=None, position=None):
    """Return players grouped into S/A/B/C/D/F tiers by trade value."""
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, params).fetchall()

        tiers = {t[1]: {"tier": t[1], "label": t[2], "min_tv": t[0], "players": []} for t in _TIER_BREAKS}
        tier_order = [t[1] for t in _TIER_BREAKS]

        # Adjust age for historical seasons: DB stores current age, so subtract years elapsed
        current_year = _current_nfl_season()
        age_offset = current_year - season if season and season < current_year else 0

        for r in rows:
            pos = r[2] or "WR"
            games = r[7] or 1
            ppg = round((r[6] or 0) / games, 2)
            age = (r[4] or 25) - age_offset
            tv = compute_trade_value(ppg, age, pos)

            tier_key = "F"
            for threshold, key, _ in _TIER_BREAKS:
                if tv >= threshold:
                    tier_key = key
                    break

            tiers[tier_key]["players"].append({
                "player_id": r[0],
                "full_name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "age": age,
                "headshot_url": r[5] or "",
                "ppg": ppg,
                "trade_value": tv,
            })

        for t in tier_order:
            tiers[t]["players"].sort(key=lambda x: x["trade_value"], reverse=True)
            for i, p in enumerate(tiers[t]["players"]):
                p["tier_rank"] = i + 1

        result_tiers = [tiers[t] for t in tier_order]
        total = sum(len(t["players"]) for t in result_tiers)

        return {
            "season": season,
            "available_seasons": available_seasons,
            "position": position or "ALL",
            "total_players": total,
            "tiers": result_tiers,
        }


# ---------------------------------------------------------------------------
# Dynasty Power Rankings — Team-level dynasty value
# ---------------------------------------------------------------------------


def fetch_tier_list(season=None, position=None):
    return _cached(f"fetch_tier_list:{season}:{position}", lambda: _fetch_tier_list_uncached(season=season, position=position))

def _fetch_dynasty_power_rankings_uncached(season=None):
    """Rank all 32 NFL teams by total dynasty roster value (sum of player trade values)."""
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        # Get all fantasy-relevant players with PPG for trade value calc
        rows = conn.execute("""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.team IS NOT NULL AND p.team != '' AND p.team != 'FA'
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """, [season]).fetchall()

        # Build per-team data
        teams = {}
        for r in rows:
            pid, name, pos, team, age, total_ppr, games = r
            if not team:
                continue
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0
            tv = compute_trade_value(ppg, age, pos)

            if team not in teams:
                teams[team] = {"team": team, "qb": [], "rb": [], "wr": [], "te": [],
                               "total_value": 0, "players": []}

            player_obj = {
                "player_id": pid,
                "full_name": name or "Unknown",
                "position": pos or "WR",
                "age": age,
                "ppg": ppg,
                "trade_value": tv,
            }
            teams[team]["players"].append(player_obj)
            teams[team]["total_value"] += tv
            group_key = (pos or "WR").lower()
            if group_key in teams[team]:
                teams[team][group_key].append(player_obj)

        # Compute positional group values and top players per team
        result_teams = []
        for t_key, t_data in teams.items():
            qb_val = round(sum(p["trade_value"] for p in t_data["qb"]), 1)
            rb_val = round(sum(p["trade_value"] for p in t_data["rb"]), 1)
            wr_val = round(sum(p["trade_value"] for p in t_data["wr"]), 1)
            te_val = round(sum(p["trade_value"] for p in t_data["te"]), 1)
            total = round(qb_val + rb_val + wr_val + te_val, 1)

            # Top 3 players by trade value
            top3 = sorted(t_data["players"], key=lambda x: x["trade_value"], reverse=True)[:3]

            result_teams.append({
                "team": t_key,
                "total_value": total,
                "qb_value": qb_val,
                "rb_value": rb_val,
                "wr_value": wr_val,
                "te_value": te_val,
                "player_count": len(t_data["players"]),
                "top_players": [{
                    "player_id": p["player_id"],
                    "full_name": p["full_name"],
                    "position": p["position"],
                    "trade_value": p["trade_value"],
                    "ppg": p["ppg"],
                    "age": p["age"],
                } for p in top3],
            })

        result_teams.sort(key=lambda x: x["total_value"], reverse=True)
        for i, t in enumerate(result_teams):
            t["rank"] = i + 1

        # Compute league average for comparison
        avg_value = round(sum(t["total_value"] for t in result_teams) / max(len(result_teams), 1), 1)

        return {
            "season": season,
            "available_seasons": available_seasons,
            "teams": result_teams,
            "league_average": avg_value,
            "total_teams": len(result_teams),
        }


def fetch_dynasty_power_rankings(season=None):
    return _cached(f"fetch_dynasty_power_rankings:{season}", lambda: _fetch_dynasty_power_rankings_uncached(season=season))
