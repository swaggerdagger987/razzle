"""
live_data.dashboards -- efficiency, consistency, SOS, stock watch,
opportunity share, report cards, awards, VORP, stat correlations.
"""

import logging
import math
from collections import defaultdict

from ..db import get_db
from .core import FANTASY_POSITIONS, _cached, _CACHE_TTL_STABLE, _current_nfl_season, _safe_int

logger = logging.getLogger("razzle.live_data.dashboards")

_EFFICIENCY_ANNOTATIONS = [
    "does more with less",
    "ruthlessly efficient",
    "every touch counts",
    "the definition of productive",
    "maximum output, minimum waste",
    "quality over quantity",
    "the efficient engine",
    "always moving the chains",
    "no wasted motion",
    "elite touch efficiency",
]

_VOLUME_ANNOTATIONS = [
    "the workhorse",
    "bellcow workload",
    "carries the offense",
    "volume is king",
    "opportunity monster",
    "the focal point",
    "featured weapon",
    "snap-eating machine",
    "the engine room",
    "fed early and often",
]


def fetch_efficiency_rankings(season=None, position=None, limit=30, week=None):
    """Return efficiency rankings: most efficient and volume kings."""
    def _query():
        with get_db() as conn:
            # Determine season + available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            _season = season if season else (available_seasons[0] if available_seasons else _current_nfl_season())

            pos_filter = ""
            week_filter = ""
            params = [_season]
            if position and position.upper() in ("QB", "RB", "WR", "TE"):
                pos_filter = "AND p.position = ?"
                params.append(position.upper())
            _week = _safe_int(week)
            if _week > 0:
                week_filter = "AND s.week = ?"
                params.append(_week)

            query = f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team,
                    p.headshot_url,
                    ROUND(SUM(s.fantasy_points_ppr), 1) as total_ppr,
                    COUNT(DISTINCT s.week) as games,
                    SUM(s.targets) as targets,
                    SUM(s.carries) as carries,
                    SUM(s.receptions) as receptions,
                    SUM(s.receiving_yards) as receiving_yards,
                    SUM(s.rushing_yards) as rushing_yards,
                    SUM(s.receiving_air_yards) as receiving_air_yards,
                    SUM(s.receiving_yards_after_catch) as yac,
                    SUM(s.receiving_tds) as rec_tds,
                    SUM(s.rushing_tds) as rush_tds,
                    SUM(s.passing_tds) as pass_tds,
                    SUM(s.attempts) as pass_attempts
                FROM players p
                JOIN player_week_stats s
                    ON s.player_id = p.player_id AND s.season = ?
                WHERE p.position IN ('QB','RB','WR','TE')
                  AND p.fantasy_relevant = 1
                  AND s.season_type = 'regular'
                  {pos_filter}
                  {week_filter}
                GROUP BY p.player_id
                HAVING games >= 4
                ORDER BY total_ppr DESC
                LIMIT 500
            """
            rows = conn.execute(query, params).fetchall()

            if not rows:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "most_efficient": [],
                    "volume_kings": [],
                }

            players = []
            for r in rows:
                pid = r[0]
                games = r[6] or 1
                total_ppr = r[5] or 0
                targets = r[7] or 0
                carries = r[8] or 0
                receptions = r[9] or 0
                rec_yards = r[10] or 0
                rush_yards = r[11] or 0
                air_yards = r[12] or 0
                yac = r[13] or 0
                rec_tds = r[14] or 0
                rush_tds = r[15] or 0
                pass_tds = r[16] or 0
                pass_attempts = r[17] or 0
                pos = r[2] or "RB"

                # Opportunities: QBs use pass attempts + carries; others use targets + carries
                if pos == "QB":
                    opportunities = pass_attempts + carries
                else:
                    opportunities = targets + carries
                touches = receptions + carries
                total_yards = rec_yards + rush_yards
                total_tds = rec_tds + rush_tds + pass_tds

                # Skip players with too few opportunities (position-specific)
                opp_min = {"QB": 50, "RB": 50, "WR": 40, "TE": 20}.get(pos, 50)
                if opportunities < opp_min:
                    continue

                ppg = round(total_ppr / games, 2)
                ppo = round(total_ppr / opportunities, 2) if opportunities > 0 else 0
                ypt = round(total_yards / touches, 2) if touches > 0 else 0
                catch_rate = round(receptions / targets * 100, 1) if targets > 0 else 0
                yac_per_rec = round(yac / receptions, 2) if receptions > 0 else 0
                # TD rate: QBs use passing TDs / pass attempts; others use total TDs / touches
                if pos == "QB":
                    td_rate = round(pass_tds / pass_attempts * 100, 1) if pass_attempts > 0 else 0
                else:
                    td_rate = round(total_tds / touches * 100, 1) if touches > 0 else 0

                players.append({
                    "player_id": pid,
                    "name": r[1] or "Unknown",
                    "position": pos,
                    "team": r[3] or "FA",
                    "headshot_url": r[4] or "",
                    "ppg": ppg,
                    "games": games,
                    "opportunities": opportunities,
                    "touches": touches,
                    "ppo": ppo,
                    "yards_per_touch": ypt,
                    "catch_rate": catch_rate,
                    "yac_per_rec": yac_per_rec,
                    "td_rate": td_rate,
                    "total_tds": total_tds,
                })

            # Compute PPO percentile for efficiency grade
            ppo_values = sorted([p["ppo"] for p in players])
            n = len(ppo_values)
            for p in players:
                if n == 0:
                    p["grade"] = "C"
                    continue
                rank = sum(1 for v in ppo_values if v < p["ppo"])
                percentile = rank / n * 100
                if percentile >= 95:
                    p["grade"] = "A+"
                elif percentile >= 85:
                    p["grade"] = "A"
                elif percentile >= 70:
                    p["grade"] = "B"
                elif percentile >= 45:
                    p["grade"] = "C"
                elif percentile >= 25:
                    p["grade"] = "D"
                else:
                    p["grade"] = "F"

            # Most Efficient: highest PPO
            most_efficient = sorted(players, key=lambda x: x["ppo"], reverse=True)[:limit]
            for i, p in enumerate(most_efficient):
                p["annotation"] = _EFFICIENCY_ANNOTATIONS[i % len(_EFFICIENCY_ANNOTATIONS)]

            # Volume Kings: most opportunities (with grade for context)
            volume_kings = sorted(players, key=lambda x: x["opportunities"], reverse=True)[:limit]
            for i, p in enumerate(volume_kings):
                p["annotation"] = _VOLUME_ANNOTATIONS[i % len(_VOLUME_ANNOTATIONS)]

            return {
                "season": _season,
                "available_seasons": available_seasons,
                "most_efficient": most_efficient,
                "volume_kings": volume_kings,
            }

    return _cached(f"efficiency_rankings:{season}:{position}:{limit}:{week}", _query)


# ---------------------------------------------------------------------------
# Consistency Rankings
# ---------------------------------------------------------------------------

_ROCK_SOLID_ANNOTATIONS = [
    "metronome", "bankable", "set-and-forget", "steady Eddie",
    "reliable as gravity", "floor merchant", "plug and play",
    "boring in the best way", "autopilot", "old faithful",
    "cash money", "no-drama zone", "Swiss watch", "rock of ages",
    "comfort blanket", "ironclad", "steady hand", "safe harbor",
]

_WILD_CARD_ANNOTATIONS = [
    "buckle up", "boom or bust", "volatility king", "rollercoaster",
    "white-knuckle ride", "high variance", "feast or famine",
    "chaos merchant", "gambler's delight", "ceiling chaser",
    "weekly coin flip", "heart attack starter", "spicy lineup play",
    "start at your own risk", "living on the edge", "the wild card",
]


def fetch_consistency_rankings(season=None, position=None, limit=30, week=None):
    """Return consistency rankings: rock solid (low CoV) and wild cards (high CoV)."""
    def _query():


        with get_db() as conn:
            # Determine season + available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            _season = season if season else (available_seasons[0] if available_seasons else _current_nfl_season())

            pos_filter = ""
            week_filter = ""
            params = [_season]
            if position and position.upper() in ("QB", "RB", "WR", "TE"):
                pos_filter = "AND p.position = ?"
                params.append(position.upper())
            _week = _safe_int(week)
            if _week > 0:
                week_filter = "AND s.week = ?"
                params.append(_week)

            # Get weekly fantasy points per player
            query = f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team,
                    p.headshot_url,
                    s.fantasy_points_ppr, s.week
                FROM players p
                JOIN player_week_stats s
                    ON s.player_id = p.player_id AND s.season = ?
                WHERE p.position IN ('QB','RB','WR','TE')
                  AND p.fantasy_relevant = 1
                  AND s.season_type = 'regular'
                  {pos_filter}
                  {week_filter}
                ORDER BY p.player_id, s.week
            """
            rows = conn.execute(query, params).fetchall()

            if not rows:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "rock_solid": [],
                    "wild_cards": [],
                }

            # Group weekly scores by player

            player_info = {}
            player_weeks = defaultdict(list)
            for r in rows:
                pid = r[0]
                if pid not in player_info:
                    player_info[pid] = {
                        "player_id": pid,
                        "name": r[1] or "Unknown",
                        "position": r[2] or "RB",
                        "team": r[3] or "FA",
                        "headshot_url": r[4] or "",
                    }
                pts = r[5] or 0
                player_weeks[pid].append(pts)

            # Compute stats for players with >= 6 games
            players = []
            for pid, weeks in player_weeks.items():
                if len(weeks) < 6:
                    continue

                info = player_info[pid]
                n = len(weeks)
                mean = sum(weeks) / n
                if mean < 2:
                    continue  # Skip very low scorers (irrelevant)

                variance = sum((w - mean) ** 2 for w in weeks) / (n - 1)
                stddev = math.sqrt(variance)
                cov = round(stddev / mean, 3) if mean > 0 else 0

                # Floor (10th percentile) and ceiling (90th percentile)
                sorted_weeks = sorted(weeks)
                floor_idx = max(0, int(n * 0.1))
                ceil_idx = min(n - 1, int(n * 0.9))
                floor_val = round(sorted_weeks[floor_idx], 1)
                ceil_val = round(sorted_weeks[ceil_idx], 1)
                score_range = round(ceil_val - floor_val, 1)

                players.append({
                    **info,
                    "ppg": round(mean, 2),
                    "stddev": round(stddev, 2),
                    "cov": cov,
                    "floor": floor_val,
                    "ceiling": ceil_val,
                    "range": score_range,
                    "games": n,
                })

            # Grade by INVERSE CoV percentile (lower CoV = better grade)
            cov_values = sorted([p["cov"] for p in players])
            total = len(cov_values)
            for p in players:
                if total == 0:
                    p["grade"] = "C"
                    continue
                # Lower CoV = more consistent = higher percentile
                rank = sum(1 for v in cov_values if v > p["cov"])
                percentile = rank / total * 100
                if percentile >= 95:
                    p["grade"] = "A+"
                elif percentile >= 85:
                    p["grade"] = "A"
                elif percentile >= 70:
                    p["grade"] = "B"
                elif percentile >= 45:
                    p["grade"] = "C"
                elif percentile >= 25:
                    p["grade"] = "D"
                else:
                    p["grade"] = "F"

            # Rock Solid: lowest CoV (most consistent)
            rock_solid = sorted(players, key=lambda x: x["cov"])[:limit]
            for i, p in enumerate(rock_solid):
                p["annotation"] = _ROCK_SOLID_ANNOTATIONS[i % len(_ROCK_SOLID_ANNOTATIONS)]

            # Wild Cards: highest CoV (most volatile)
            wild_cards = sorted(players, key=lambda x: x["cov"], reverse=True)[:limit]
            for i, p in enumerate(wild_cards):
                p["annotation"] = _WILD_CARD_ANNOTATIONS[i % len(_WILD_CARD_ANNOTATIONS)]

            return {
                "season": _season,
                "available_seasons": available_seasons,
                "rock_solid": rock_solid,
                "wild_cards": wild_cards,
            }

    return _cached(f"consistency_rankings:{season}:{position}:{limit}:{week}", _query)


# ---------------------------------------------------------------------------
# Strength of Schedule
# ---------------------------------------------------------------------------

_SOS_SUPPRESSED_ANNOTATIONS = [
    "elite despite the gauntlet",
    "schedule-proof stud",
    "numbers held up vs the toughest",
    "buy low window closing",
    "did this vs killers every week",
    "imagine this on a soft schedule",
    "undervalued because of SOS",
    "the real deal",
    "proven against the best",
    "schedule gets easier — watch out",
]

_SOS_INFLATED_ANNOTATIONS = [
    "padded stats alert",
    "soft schedule did the heavy lifting",
    "sell high before reality hits",
    "regression coming",
    "cupcake schedule inflated these",
    "numbers won't repeat",
    "schedule-dependent production",
    "beneficiary of easy matchups",
    "don't trust these numbers",
    "buyer beware",
]


def fetch_strength_of_schedule(season=None, position=None, limit=30):
    """Compute per-player strength of schedule using opponent PPG-allowed-by-position.

    For each player, look at every opponent they faced, compute the avg PPG that
    defense allows at the player's position, then compare actual PPG to schedule
    difficulty.  Split into schedule_suppressed (hardest SOS) and schedule_inflated
    (easiest SOS).
    """
    def _query():
        with get_db() as conn:
            row = conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            _season = season if season else (available_seasons[0] if available_seasons else _current_nfl_season())

            # Step 1: Build defense PPG-allowed-by-position grid for this season
            def_rows = conn.execute("""
                SELECT s.opponent_team, p.position,
                       ROUND(COALESCE(SUM(s.fantasy_points_ppr), 0), 1) as total_ppr,
                       COUNT(DISTINCT s.week) as games
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
                GROUP BY s.opponent_team, p.position
            """, [_season]).fetchall()

            # defense_ppg[team][position] = avg PPG allowed
            defense_ppg = {}
            for r in def_rows:
                team, pos, total, games = r[0], r[1], r[2], r[3]
                if games <= 0:
                    continue
                if team not in defense_ppg:
                    defense_ppg[team] = {}
                defense_ppg[team][pos] = round(total / games, 2)

            # League average PPG allowed per position
            league_avg = {}
            for pos in ("QB", "RB", "WR", "TE"):
                vals = [defense_ppg[t][pos] for t in defense_ppg if pos in defense_ppg[t]]
                league_avg[pos] = sum(vals) / len(vals) if vals else 0

            # Step 2: Get per-player weekly data (opponent per week)
            pos_filter = ""
            params = [_season]
            if position and position.upper() in FANTASY_POSITIONS:
                pos_filter = "AND p.position = ?"
                params.append(position.upper())

            player_rows = conn.execute(f"""
                SELECT s.player_id, p.full_name, p.position, p.headshot_url,
                       s.opponent_team, s.fantasy_points_ppr, s.week,
                       s.team
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND p.fantasy_relevant = 1
                  AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
                  {pos_filter}
                ORDER BY s.player_id, s.week
            """, params).fetchall()

            if not player_rows:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "schedule_suppressed": [],
                    "schedule_inflated": [],
                }

            # Step 3: Aggregate per player

            player_agg = defaultdict(lambda: {
                "opp_ppg_list": [], "total_pts": 0, "games": 0, "team": "",
            })
            player_info = {}

            for r in player_rows:
                pid = r[0]
                name, pos, headshot, opp = r[1], r[2], r[3], r[4]
                pts, week, team = r[5] or 0, r[6], r[7] or ""

                if pid not in player_info:
                    player_info[pid] = {
                        "player_id": pid,
                        "name": name,
                        "position": pos,
                        "headshot_url": headshot,
                    }

                opp_allows = defense_ppg.get(opp, {}).get(pos, league_avg.get(pos, 0))
                d = player_agg[pid]
                d["opp_ppg_list"].append(opp_allows)
                d["total_pts"] += pts
                d["games"] += 1
                d["team"] = team  # last team seen

            # Step 4: Compute metrics per player
            players = []
            for pid, d in player_agg.items():
                games = d["games"]
                if games < 6:
                    continue
                ppg = round(d["total_pts"] / games, 1)
                if ppg < 2:
                    continue

                avg_opp_ppg = round(sum(d["opp_ppg_list"]) / (len(d["opp_ppg_list"]) or 1), 1)
                info = player_info[pid]
                pos = info["position"]

                # sos_delta: positive = harder schedule (opponents allow LESS than avg)
                sos_delta = round(league_avg.get(pos, 0) - avg_opp_ppg, 1)

                players.append({
                    "player_id": pid,
                    "name": info["name"],
                    "position": pos,
                    "headshot_url": info["headshot_url"],
                    "team": d["team"],
                    "ppg": ppg,
                    "avg_opp_ppg": avg_opp_ppg,
                    "sos_delta": sos_delta,
                    "games": games,
                })

            if not players:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "schedule_suppressed": [],
                    "schedule_inflated": [],
                }

            # Step 5: Rank by schedule difficulty (sos_delta desc = hardest schedule)
            players.sort(key=lambda x: x["sos_delta"], reverse=True)
            for i, p in enumerate(players):
                p["sos_rank"] = i + 1

            # Grade by schedule difficulty percentile (A+ = hardest schedule)
            total = len(players)
            for i, p in enumerate(players):
                percentile = ((total - 1 - i) / max(total - 1, 1)) * 100
                if percentile >= 95:
                    p["grade"] = "A+"
                elif percentile >= 85:
                    p["grade"] = "A"
                elif percentile >= 70:
                    p["grade"] = "B"
                elif percentile >= 45:
                    p["grade"] = "C"
                elif percentile >= 25:
                    p["grade"] = "D"
                else:
                    p["grade"] = "F"

            # Schedule Suppressed: hardest schedule (highest sos_delta)
            suppressed = [p for p in players if p["sos_delta"] > 0]
            suppressed = sorted(suppressed, key=lambda x: x["sos_delta"], reverse=True)[:limit]
            for i, p in enumerate(suppressed):
                p["annotation"] = _SOS_SUPPRESSED_ANNOTATIONS[i % len(_SOS_SUPPRESSED_ANNOTATIONS)]

            # Schedule Inflated: easiest schedule (most negative sos_delta)
            inflated = [p for p in players if p["sos_delta"] < 0]
            inflated = sorted(inflated, key=lambda x: x["sos_delta"])[:limit]
            for i, p in enumerate(inflated):
                p["annotation"] = _SOS_INFLATED_ANNOTATIONS[i % len(_SOS_INFLATED_ANNOTATIONS)]

            return {
                "season": _season,
                "available_seasons": available_seasons,
                "schedule_suppressed": suppressed,
                "schedule_inflated": inflated,
            }

    return _cached(f"strength_of_schedule:{season}:{position}:{limit}", _query)


# ---------------------------------------------------------------------------
# Phase 87: Dynasty Stock Watch
# ---------------------------------------------------------------------------

_RISING_ANNOTATIONS = [
    "buy window open",
    "metrics say undervalued",
    "stock price climbing",
    "the data backs the hype",
    "quietly outperforming",
    "sleeper alert",
    "the numbers don't lie",
    "upside not priced in",
    "production exceeds perception",
    "dynasty steal",
]

_FALLING_ANNOTATIONS = [
    "sell window closing",
    "metrics say overvalued",
    "stock price dropping",
    "production doesn't match price",
    "quietly underperforming",
    "red flags in the data",
    "regression candidate",
    "buy the name, not the stats",
    "perception exceeds production",
    "dynasty fade",
]


def fetch_stock_watch(season=None, position=None, limit=30):
    """Composite dynasty stock watch — blends efficiency, consistency, SOS, and PPG
    into a 0-100 stock score.  Rising = undervalued (stock > PPG rank).
    Falling = overvalued (stock < PPG rank)."""
    def _query():



        with get_db() as conn:
            row = conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            _season = season if season else (available_seasons[0] if available_seasons else _current_nfl_season())

            pos_filter = ""
            params = [_season]
            if position and position.upper() in FANTASY_POSITIONS:
                pos_filter = "AND p.position = ?"
                params.append(position.upper())

            # ---- Gather weekly data per player ----
            rows = conn.execute(f"""
                SELECT s.player_id, p.full_name, p.position, p.team,
                       p.headshot_url, p.age,
                       s.fantasy_points_ppr, s.targets, s.carries,
                       s.attempts,
                       s.opponent_team, s.week
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND p.fantasy_relevant = 1
                  AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
                  {pos_filter}
                ORDER BY s.player_id, s.week
            """, params).fetchall()

            if not rows:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "rising": [],
                    "falling": [],
                }

            # ---- Build defense PPG-allowed grid for SOS ----
            def_rows = conn.execute("""
                SELECT s.opponent_team, p.position,
                       ROUND(COALESCE(SUM(s.fantasy_points_ppr), 0), 1) as total_ppr,
                       COUNT(DISTINCT s.week) as games
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
                GROUP BY s.opponent_team, p.position
            """, [_season]).fetchall()

            defense_ppg = {}
            for r in def_rows:
                team, pos, total, games = r[0], r[1], r[2], r[3]
                if games <= 0:
                    continue
                if team not in defense_ppg:
                    defense_ppg[team] = {}
                defense_ppg[team][pos] = round(total / games, 2)

            league_avg = {}
            for pos in ("QB", "RB", "WR", "TE"):
                vals = [defense_ppg[t][pos] for t in defense_ppg if pos in defense_ppg[t]]
                league_avg[pos] = sum(vals) / len(vals) if vals else 0

            # ---- Aggregate per player ----
            player_info = {}
            player_weeks = defaultdict(list)  # weekly fantasy pts
            player_opps = defaultdict(lambda: {"targets": 0, "carries": 0, "attempts": 0, "total_pts": 0, "games": 0})
            player_sos = defaultdict(list)  # opp ppg allowed per week

            for r in rows:
                pid = r[0]
                if pid not in player_info:
                    player_info[pid] = {
                        "player_id": pid,
                        "name": r[1] or "Unknown",
                        "position": r[2] or "RB",
                        "team": r[3] or "FA",
                        "headshot_url": r[4] or "",
                        "age": r[5],
                    }

                pts = r[6] or 0
                targets = r[7] or 0
                carries = r[8] or 0
                attempts = r[9] or 0
                opp = r[10] or ""
                pos = r[2] or "RB"

                player_weeks[pid].append(pts)
                d = player_opps[pid]
                d["targets"] += targets
                d["carries"] += carries
                d["attempts"] += attempts
                d["total_pts"] += pts
                d["games"] += 1

                opp_allows = defense_ppg.get(opp, {}).get(pos, league_avg.get(pos, 0))
                player_sos[pid].append(opp_allows)

            # ---- Compute metrics per player (min 8 games, position PPG floor) ----
            MIN_PPG = {"QB": 10, "RB": 5, "WR": 5, "TE": 3}
            players = []
            for pid, weeks in player_weeks.items():
                n = len(weeks)
                if n < 8:
                    continue
                info = player_info[pid]
                opps_d = player_opps[pid]
                total_pts = opps_d["total_pts"]
                games = opps_d["games"]
                ppg = round(total_pts / games, 2) if games > 0 else 0
                pos = info["position"]
                if ppg < MIN_PPG.get(pos, 5):
                    continue

                # Efficiency: PPO — QBs use pass attempts + carries
                if pos == "QB":
                    opportunities = opps_d["attempts"] + opps_d["carries"]
                else:
                    opportunities = opps_d["targets"] + opps_d["carries"]
                opp_threshold = {"QB": 50, "RB": 50, "WR": 40, "TE": 20}.get(pos, 50)
                ppo = round(total_pts / opportunities, 2) if opportunities > opp_threshold else None

                # Consistency: CoV
                mean = sum(weeks) / n
                variance = sum((w - mean) ** 2 for w in weeks) / (n - 1) if n > 1 else 0
                stddev = math.sqrt(variance)
                cov = round(stddev / mean, 3) if mean > 0 else None

                # SOS: avg opp ppg allowed
                sos_list = player_sos[pid]
                avg_opp_ppg = sum(sos_list) / len(sos_list) if sos_list else 0
                pos = info["position"]
                sos_delta = round(league_avg.get(pos, 0) - avg_opp_ppg, 1)

                players.append({
                    **info,
                    "ppg": ppg,
                    "games": games,
                    "ppo": ppo,
                    "cov": cov,
                    "sos_delta": sos_delta,
                })

            if not players:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "rising": [],
                    "falling": [],
                }

            # ---- Compute percentiles for each metric ----
            # PPG percentile
            ppg_sorted = sorted([p["ppg"] for p in players])
            n_total = len(ppg_sorted)

            # PPO percentile (only players with enough opps)
            ppo_vals = sorted([p["ppo"] for p in players if p["ppo"] is not None])
            n_ppo = len(ppo_vals)

            # Inverse CoV percentile (lower CoV = higher percentile)
            cov_vals = sorted([p["cov"] for p in players if p["cov"] is not None])
            n_cov = len(cov_vals)

            # SOS delta percentile (higher delta = harder schedule = higher percentile)
            sos_sorted = sorted([p["sos_delta"] for p in players])
            n_sos = len(sos_sorted)

            def percentile_rank(val, sorted_vals, count):
                if count == 0:
                    return 50
                rank = sum(1 for v in sorted_vals if v < val)
                return round(rank / count * 100, 1)

            def grade_from_percentile(pct):
                if pct >= 95:
                    return "A+"
                elif pct >= 85:
                    return "A"
                elif pct >= 70:
                    return "B"
                elif pct >= 45:
                    return "C"
                elif pct >= 25:
                    return "D"
                return "F"

            for p in players:
                ppg_pct = percentile_rank(p["ppg"], ppg_sorted, n_total)
                ppo_pct = percentile_rank(p["ppo"], ppo_vals, n_ppo) if p["ppo"] is not None else 50
                # Inverse CoV: lower CoV = better, so count values ABOVE
                cov_pct = (sum(1 for v in cov_vals if v > p["cov"]) / n_cov * 100) if p["cov"] is not None and n_cov > 0 else 50
                sos_pct = percentile_rank(p["sos_delta"], sos_sorted, n_sos)

                # Composite stock score: 25% each
                stock_score = round(ppo_pct * 0.25 + cov_pct * 0.25 + sos_pct * 0.25 + ppg_pct * 0.25)

                p["stock_score"] = stock_score
                p["ppg_pct"] = round(ppg_pct)
                p["efficiency_grade"] = grade_from_percentile(ppo_pct)
                p["consistency_grade"] = grade_from_percentile(cov_pct)
                p["sos_grade"] = grade_from_percentile(sos_pct)
                # Stock delta: positive = undervalued (stock > production rank)
                p["stock_delta"] = stock_score - round(ppg_pct)

            # ---- Split into rising (undervalued) and falling (overvalued) ----
            rising = sorted(
                [p for p in players if p["stock_delta"] > 0],
                key=lambda x: x["stock_delta"], reverse=True
            )[:limit]
            for i, p in enumerate(rising):
                p["annotation"] = _RISING_ANNOTATIONS[i % len(_RISING_ANNOTATIONS)]

            falling = sorted(
                [p for p in players if p["stock_delta"] < 0],
                key=lambda x: x["stock_delta"]
            )[:limit]
            for i, p in enumerate(falling):
                p["annotation"] = _FALLING_ANNOTATIONS[i % len(_FALLING_ANNOTATIONS)]

            return {
                "season": _season,
                "available_seasons": available_seasons,
                "rising": rising,
                "falling": falling,
            }

    return _cached(f"stock_watch:{season}:{position}:{limit}", _query)


# ---------------------------------------------------------------------------
# Opportunity Share & Dominator Rating
# ---------------------------------------------------------------------------

_ALPHA_ANNOTATIONS = [
    "the bellcow", "volume king", "carries the load",
    "target hog", "workload monster", "focal point",
    "run-game anchor", "snap machine", "every-down back",
    "route-tree monopoly",
]

_DOMINATOR_ANNOTATIONS = [
    "receiving alpha", "production dominator", "stat magnet",
    "yards vacuum", "TD machine", "target conversion king",
    "yardage engine", "reception monster", "air-game anchor",
    "route assassin",
]


def fetch_opportunity_share(season=None, position=None, limit=30, week=None):
    """Return opportunity share leaders (alpha dogs) and dominator rating leaders.

    Opportunity Share = (player targets + carries) / (team targets + carries) * 100
    Dominator Rating = ((player rec yards / team rec yards) + (player rec TDs / team rec TDs)) / 2 * 100
    For RB/QB: Rush Dominator = (player rush yards / team rush yards) * 100
    """
    def _query():


        with get_db() as conn:
            row = conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            _season = season if season else (available_seasons[0] if available_seasons else _current_nfl_season())

            pos_filter = ""
            week_filter = ""
            params = [_season]
            if position and position.upper() in FANTASY_POSITIONS:
                pos_filter = "AND p.position = ?"
                params.append(position.upper())
            _week = _safe_int(week)
            if _week > 0:
                week_filter = "AND s.week = ?"
                params.append(_week)

            # Gather per-player season totals
            rows = conn.execute(f"""
                SELECT s.player_id, p.full_name, p.position, p.team,
                       p.headshot_url, p.age,
                       COALESCE(SUM(s.targets), 0) as total_targets,
                       COALESCE(SUM(s.carries), 0) as total_carries,
                       COALESCE(SUM(s.receiving_yards), 0) as total_rec_yards,
                       COALESCE(SUM(s.receiving_tds), 0) as total_rec_tds,
                       COALESCE(SUM(s.rushing_yards), 0) as total_rush_yards,
                       COALESCE(SUM(s.rushing_tds), 0) as total_rush_tds,
                       ROUND(COALESCE(SUM(s.fantasy_points_ppr), 0), 1) as total_pts,
                       COUNT(DISTINCT s.week) as games
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND p.fantasy_relevant = 1
                  {pos_filter}
                  {week_filter}
                GROUP BY s.player_id
            """, params).fetchall()

            if not rows:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "alpha_dogs": [],
                    "dominators": [],
                }

            # Build team totals from ALL positions (unfiltered) for correct opp_share
            team_totals = defaultdict(lambda: {
                "targets": 0, "carries": 0,
                "rec_yards": 0, "rec_tds": 0,
                "rush_yards": 0, "rush_tds": 0,
            })
            tt_week_filter = "AND s.week = ?" if _week > 0 else ""
            tt_params = [_season, _week] if _week > 0 else [_season]
            tt_rows = conn.execute(f"""
                SELECT s.team,
                       COALESCE(SUM(s.targets), 0),
                       COALESCE(SUM(s.carries), 0),
                       COALESCE(SUM(s.receiving_yards), 0),
                       COALESCE(SUM(s.receiving_tds), 0),
                       COALESCE(SUM(s.rushing_yards), 0),
                       COALESCE(SUM(s.rushing_tds), 0)
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  {tt_week_filter}
                GROUP BY s.team
            """, tt_params).fetchall()
            for tr in tt_rows:
                t = team_totals[tr[0] or "FA"]
                t["targets"] = tr[1]
                t["carries"] = tr[2]
                t["rec_yards"] = tr[3]
                t["rec_tds"] = tr[4]
                t["rush_yards"] = tr[5]
                t["rush_tds"] = tr[6]

            players = []
            for r in rows:
                team = r[3] or "FA"
                targets = r[6]
                carries = r[7]
                rec_yards = r[8]
                rec_tds = r[9]
                rush_yards = r[10]
                rush_tds = r[11]
                total_pts = r[12]
                games = r[13]

                players.append({
                    "player_id": r[0],
                    "name": r[1] or "Unknown",
                    "position": r[2] or "RB",
                    "team": team,
                    "headshot_url": r[4] or "",
                    "age": r[5],
                    "targets": targets,
                    "carries": carries,
                    "rec_yards": rec_yards,
                    "rec_tds": rec_tds,
                    "rush_yards": rush_yards,
                    "rush_tds": rush_tds,
                    "total_pts": total_pts,
                    "games": games,
                })

            # Compute opportunity share and dominator rating per player
            for p in players:
                team = p["team"]
                t = team_totals[team]
                games = p["games"]
                ppg = round(p["total_pts"] / games, 2) if games > 0 else 0
                p["ppg"] = ppg

                total_opps = p["targets"] + p["carries"]
                p["total_opps"] = total_opps
                p["targets_per_game"] = round(p["targets"] / games, 1) if games > 0 else 0
                p["carries_per_game"] = round(p["carries"] / games, 1) if games > 0 else 0

                # Opportunity share
                team_opps = t["targets"] + t["carries"]
                p["opp_share"] = round(total_opps / team_opps * 100, 1) if team_opps > 0 else 0

                # Compute all shares for every player
                rec_yd_share = (p["rec_yards"] / t["rec_yards"] * 100) if t["rec_yards"] > 0 else 0
                rec_td_share = (p["rec_tds"] / t["rec_tds"] * 100) if t["rec_tds"] > 0 else 0
                rush_share = (p["rush_yards"] / t["rush_yards"] * 100) if t["rush_yards"] > 0 else 0
                p["rec_yd_share"] = round(rec_yd_share, 1)
                p["rec_td_share"] = round(rec_td_share, 1)
                p["rush_share"] = round(rush_share, 1)

                # Dominator rating (WR/TE: receiving; RB/QB: rushing)
                pos = p["position"]
                if pos in ("WR", "TE"):
                    p["dominator_rating"] = round((rec_yd_share + rec_td_share) / 2, 1)
                else:
                    p["dominator_rating"] = round(rush_share, 1)

            # Filter: min 30 opportunities, min 4 games
            filtered = [p for p in players if p["total_opps"] >= 30 and p["games"] >= 4]

            # Alpha Dogs: highest opportunity share
            alpha_dogs = sorted(filtered, key=lambda x: x["opp_share"], reverse=True)[:limit]
            for i, p in enumerate(alpha_dogs):
                p["annotation"] = _ALPHA_ANNOTATIONS[i % len(_ALPHA_ANNOTATIONS)]

            # Dominators: highest dominator rating
            dominators = sorted(filtered, key=lambda x: x["dominator_rating"], reverse=True)[:limit]
            for i, p in enumerate(dominators):
                p["annotation"] = _DOMINATOR_ANNOTATIONS[i % len(_DOMINATOR_ANNOTATIONS)]

            # Clean up internal fields before returning
            clean_keys = ["rec_yards", "rec_tds", "rush_yards", "rush_tds", "total_pts"]
            for lst in (alpha_dogs, dominators):
                for p in lst:
                    for k in clean_keys:
                        p.pop(k, None)

            return {
                "season": _season,
                "available_seasons": available_seasons,
                "alpha_dogs": alpha_dogs,
                "dominators": dominators,
            }

    return _cached(f"opportunity_share:{season}:{position}:{limit}:{week}", _query)


# ---------------------------------------------------------------------------
# Player Report Card — Composite Fantasy GPA
# ---------------------------------------------------------------------------

_HONOR_ANNOTATIONS = [
    "straight A student", "dean's list", "valedictorian",
    "top of the class", "gold star", "the complete package",
    "all-around elite", "no weaknesses", "fantasy thoroughbred",
    "draft day steal",
]

_NEEDS_WORK_ANNOTATIONS = [
    "needs tutoring", "incomplete grade", "see me after class",
    "red flags on tape", "underperforming", "check the film",
    "room for growth", "bought the hype?", "regression candidate",
    "the numbers don't lie",
]


def fetch_report_cards(season=None, position=None, limit=25, week=None):
    """Composite player report card — aggregates efficiency, consistency,
    SOS, stock score, and opportunity share into a Fantasy GPA (A+ to F).

    GPA = weighted average of 5 percentiles:
      20% efficiency (PPO), 20% consistency (inv CoV), 20% SOS difficulty,
      20% PPG, 20% opportunity share.
    """
    def _query():



        with get_db() as conn:
            row = conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            _season = season if season else (available_seasons[0] if available_seasons else _current_nfl_season())

            pos_filter = ""
            week_filter = ""
            params = [_season]
            if position and position.upper() in FANTASY_POSITIONS:
                pos_filter = "AND p.position = ?"
                params.append(position.upper())
            _week = _safe_int(week)
            if _week > 0:
                week_filter = "AND s.week = ?"
                params.append(_week)

            # Gather weekly data per player
            rows = conn.execute(f"""
                SELECT s.player_id, p.full_name, p.position, p.team,
                       p.headshot_url, p.age,
                       s.fantasy_points_ppr, s.targets, s.carries,
                       s.attempts,
                       s.receiving_yards, s.receiving_tds,
                       s.rushing_yards,
                       s.opponent_team, s.week
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND p.fantasy_relevant = 1
                  AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
                  {pos_filter}
                  {week_filter}
                ORDER BY s.player_id, s.week
            """, params).fetchall()

            if not rows:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "honor_roll": [],
                    "needs_improvement": [],
                }

            # Build defense PPG-allowed grid for SOS
            def_week_filter = "AND s.week = ?" if _week > 0 else ""
            def_params = [_season, _week] if _week > 0 else [_season]
            def_rows = conn.execute(f"""
                SELECT s.opponent_team, p.position,
                       ROUND(COALESCE(SUM(s.fantasy_points_ppr), 0), 1) as total_ppr,
                       COUNT(DISTINCT s.week) as games
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
                  {def_week_filter}
                GROUP BY s.opponent_team, p.position
            """, def_params).fetchall()

            defense_ppg = {}
            for r in def_rows:
                team, pos, total, games = r[0], r[1], r[2], r[3]
                if games <= 0:
                    continue
                if team not in defense_ppg:
                    defense_ppg[team] = {}
                defense_ppg[team][pos] = round(total / games, 2)

            league_avg = {}
            for pos in ("QB", "RB", "WR", "TE"):
                vals = [defense_ppg[t][pos] for t in defense_ppg if pos in defense_ppg[t]]
                league_avg[pos] = sum(vals) / len(vals) if vals else 0

            # Build team totals from ALL positions (unfiltered) for correct opp_share
            team_totals = defaultdict(lambda: {"targets": 0, "carries": 0, "rec_yards": 0, "rec_tds": 0, "rush_yards": 0})
            tt_week_filter = "AND s.week = ?" if _week > 0 else ""
            tt_params = [_season, _week] if _week > 0 else [_season]
            tt_rows = conn.execute(f"""
                SELECT s.team,
                       COALESCE(SUM(s.targets), 0),
                       COALESCE(SUM(s.carries), 0),
                       COALESCE(SUM(s.receiving_yards), 0),
                       COALESCE(SUM(s.receiving_tds), 0),
                       COALESCE(SUM(s.rushing_yards), 0)
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  {tt_week_filter}
                GROUP BY s.team
            """, tt_params).fetchall()
            for tr in tt_rows:
                t = team_totals[tr[0] or "FA"]
                t["targets"] = tr[1]
                t["carries"] = tr[2]
                t["rec_yards"] = tr[3]
                t["rec_tds"] = tr[4]
                t["rush_yards"] = tr[5]

            # Aggregate per player
            player_info = {}
            player_weeks = defaultdict(list)
            player_opps = defaultdict(lambda: {
                "targets": 0, "carries": 0, "attempts": 0, "total_pts": 0, "games": 0,
                "rec_yards": 0, "rec_tds": 0, "rush_yards": 0,
            })
            player_sos = defaultdict(list)

            for r in rows:
                pid = r[0]
                if pid not in player_info:
                    player_info[pid] = {
                        "player_id": pid,
                        "name": r[1] or "Unknown",
                        "position": r[2] or "RB",
                        "team": r[3] or "FA",
                        "headshot_url": r[4] or "",
                        "age": r[5],
                    }

                pts = r[6] or 0
                targets = r[7] or 0
                carries = r[8] or 0
                attempts = r[9] or 0
                rec_yards = r[10] or 0
                rec_tds = r[11] or 0
                rush_yards = r[12] or 0
                opp = r[13] or ""
                pos = r[2] or "RB"

                player_weeks[pid].append(pts)
                d = player_opps[pid]
                d["targets"] += targets
                d["carries"] += carries
                d["attempts"] += attempts
                d["total_pts"] += pts
                d["games"] += 1
                d["rec_yards"] += rec_yards
                d["rec_tds"] += rec_tds
                d["rush_yards"] += rush_yards

                opp_allows = defense_ppg.get(opp, {}).get(pos, league_avg.get(pos, 0))
                player_sos[pid].append(opp_allows)

            # Compute metrics per player (min 6 games, 2 PPG, 50 opps)
            players = []
            for pid, weeks in player_weeks.items():
                n = len(weeks)
                if n < 6:
                    continue
                info = player_info[pid]
                opps_d = player_opps[pid]
                total_pts = opps_d["total_pts"]
                games = opps_d["games"]
                ppg = round(total_pts / games, 2) if games > 0 else 0
                if ppg < 2:
                    continue

                # Opportunities: QBs use pass attempts + carries
                pos = info["position"]
                if pos == "QB":
                    opportunities = opps_d["attempts"] + opps_d["carries"]
                else:
                    opportunities = opps_d["targets"] + opps_d["carries"]
                opp_min = {"QB": 50, "RB": 50, "WR": 40, "TE": 20}.get(pos, 50)
                if opportunities < opp_min:
                    continue

                # Efficiency: PPO
                ppo = round(total_pts / opportunities, 2) if opportunities > 0 else 0

                # Consistency: CoV (Bessel's correction)
                mean = sum(weeks) / n
                variance = sum((w - mean) ** 2 for w in weeks) / (n - 1) if n > 1 else 0
                stddev = math.sqrt(variance)
                cov = round(stddev / mean, 3) if mean > 0 else 999

                # SOS: avg opp ppg allowed
                sos_list = player_sos[pid]
                avg_opp_ppg = sum(sos_list) / len(sos_list) if sos_list else 0
                pos = info["position"]
                sos_delta = round(league_avg.get(pos, 0) - avg_opp_ppg, 1)

                # Opportunity share
                team = info["team"]
                tt = team_totals[team]
                team_opps = tt["targets"] + tt["carries"]
                opp_share = round(opportunities / team_opps * 100, 1) if team_opps > 0 else 0

                # Dominator rating
                if pos in ("WR", "TE"):
                    rec_yd_share = (opps_d["rec_yards"] / tt["rec_yards"] * 100) if tt["rec_yards"] > 0 else 0
                    rec_td_share = (opps_d["rec_tds"] / tt["rec_tds"] * 100) if tt["rec_tds"] > 0 else 0
                    dom_rating = round((rec_yd_share + rec_td_share) / 2, 1)
                else:
                    dom_rating = round((opps_d["rush_yards"] / tt["rush_yards"] * 100), 1) if tt["rush_yards"] > 0 else 0

                players.append({
                    **info,
                    "ppg": ppg,
                    "games": games,
                    "ppo": ppo,
                    "cov": cov,
                    "sos_delta": sos_delta,
                    "opp_share": opp_share,
                    "dom_rating": dom_rating,
                })

            if not players:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "honor_roll": [],
                    "needs_improvement": [],
                }

            # Compute percentiles
            ppg_sorted = sorted([p["ppg"] for p in players])
            ppo_sorted = sorted([p["ppo"] for p in players])
            cov_vals = sorted([p["cov"] for p in players])
            sos_sorted = sorted([p["sos_delta"] for p in players])
            opp_sorted = sorted([p["opp_share"] for p in players])
            n_total = len(players)

            def percentile_rank(val, sorted_vals, count):
                if count == 0:
                    return 50
                rank = sum(1 for v in sorted_vals if v < val)
                return round(rank / count * 100, 1)

            def grade_from_percentile(pct):
                if pct >= 95:
                    return "A+"
                elif pct >= 85:
                    return "A"
                elif pct >= 75:
                    return "B+"
                elif pct >= 65:
                    return "B"
                elif pct >= 50:
                    return "C+"
                elif pct >= 35:
                    return "C"
                elif pct >= 25:
                    return "D"
                return "F"

            for p in players:
                ppg_pct = percentile_rank(p["ppg"], ppg_sorted, n_total)
                ppo_pct = percentile_rank(p["ppo"], ppo_sorted, n_total)
                # Inverse CoV: lower CoV = better
                cov_pct = round(sum(1 for v in cov_vals if v > p["cov"]) / n_total * 100, 1) if n_total > 0 else 50
                sos_pct = percentile_rank(p["sos_delta"], sos_sorted, n_total)
                opp_pct = percentile_rank(p["opp_share"], opp_sorted, n_total)

                # Composite GPA: 20% each of 5 dimensions
                gpa_pct = round(ppo_pct * 0.20 + cov_pct * 0.20 + sos_pct * 0.20 + ppg_pct * 0.20 + opp_pct * 0.20)

                p["gpa_pct"] = gpa_pct
                p["gpa_grade"] = grade_from_percentile(gpa_pct)
                p["efficiency_grade"] = grade_from_percentile(ppo_pct)
                p["consistency_grade"] = grade_from_percentile(cov_pct)
                p["sos_grade"] = grade_from_percentile(sos_pct)
                p["stock_score"] = round(ppo_pct * 0.25 + cov_pct * 0.25 + sos_pct * 0.25 + ppg_pct * 0.25)

            # Honor Roll: highest composite GPA
            honor_roll = sorted(players, key=lambda x: x["gpa_pct"], reverse=True)[:limit]
            for i, p in enumerate(honor_roll):
                p["annotation"] = _HONOR_ANNOTATIONS[i % len(_HONOR_ANNOTATIONS)]

            # Needs Improvement: lowest composite GPA
            needs_improvement = sorted(players, key=lambda x: x["gpa_pct"])[:limit]
            for i, p in enumerate(needs_improvement):
                p["annotation"] = _NEEDS_WORK_ANNOTATIONS[i % len(_NEEDS_WORK_ANNOTATIONS)]

            # Clean up internal fields
            for lst in (honor_roll, needs_improvement):
                for p in lst:
                    p.pop("cov", None)
                    p.pop("ppo", None)
                    p.pop("sos_delta", None)

            return {
                "season": _season,
                "available_seasons": available_seasons,
                "honor_roll": honor_roll,
                "needs_improvement": needs_improvement,
            }

    return _cached(f"report_cards:{season}:{position}:{limit}:{week}", _query)


_AWARD_ANNOTATIONS = {
    "mvp": "the total package",
    "most_efficient": "every touch counts",
    "iron_man": "set it and forget it",
    "schedule_survivor": "earned every point",
    "volume_king": "feed me the rock",
    "breakout_star": "remember the name",
    "rising_stock": "buy window closing",
    "dominator": "alpha of the pack",
    "redzone_king": "money in the paint",
    "best_floor": "the safest bet",
}


def fetch_season_awards(season=None, position=None):
    """Fantasy Season Superlatives — data-driven awards across all metric systems.

    Awards: MVP (highest GPA), Most Efficient (PPO), Iron Man (lowest CoV),
    Schedule Survivor (PPG x SOS difficulty), Volume King (opp share),
    Breakout Star (age-weighted opp share), Rising Stock (stock delta),
    Dominator (dominator rating), Red Zone King (GL TDs), Best Floor (10th pctile).
    """
    def _query():



        with get_db() as conn:
            row = conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            _season = season if season else (available_seasons[0] if available_seasons else _current_nfl_season())

            pos_filter = ""
            params = [_season]
            if position and position.upper() in FANTASY_POSITIONS:
                pos_filter = "AND p.position = ?"
                params.append(position.upper())

            # Gather weekly data per player
            rows = conn.execute(f"""
                SELECT s.player_id, p.full_name, p.position, p.team,
                       p.headshot_url, p.age,
                       s.fantasy_points_ppr, s.targets, s.carries,
                       s.attempts,
                       s.receiving_yards, s.receiving_tds,
                       s.rushing_yards,
                       s.opponent_team, s.week
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND p.fantasy_relevant = 1
                  AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
                  {pos_filter}
                ORDER BY s.player_id, s.week
            """, params).fetchall()

            if not rows:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "awards": [],
                }

            # Build defense PPG-allowed grid for SOS
            def_rows = conn.execute("""
                SELECT s.opponent_team, p.position,
                       ROUND(COALESCE(SUM(s.fantasy_points_ppr), 0), 1) as total_ppr,
                       COUNT(DISTINCT s.week) as games
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
                GROUP BY s.opponent_team, p.position
            """, [_season]).fetchall()

            defense_ppg = {}
            for r in def_rows:
                team, pos, total, games = r[0], r[1], r[2], r[3]
                if games <= 0:
                    continue
                if team not in defense_ppg:
                    defense_ppg[team] = {}
                defense_ppg[team][pos] = round(total / games, 2)

            league_avg = {}
            for pos in ("QB", "RB", "WR", "TE"):
                vals = [defense_ppg[t][pos] for t in defense_ppg if pos in defense_ppg[t]]
                league_avg[pos] = sum(vals) / len(vals) if vals else 0

            # Goal-line stats from PBP table
            table_check = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='player_season_pbp'"
            ).fetchone()
            gl_lookup = {}
            if table_check:
                pids = list(set(r[0] for r in rows))
                placeholders = ",".join("?" * len(pids))
                gl_rows = conn.execute(f"""
                    SELECT player_id, gl_carries, gl_targets, gl_tds
                    FROM player_season_pbp
                    WHERE player_id IN ({placeholders}) AND season = ?
                """, pids + [_season]).fetchall()
                for gr in gl_rows:
                    gl_lookup[gr[0]] = {
                        "gl_carries": gr[1] or 0,
                        "gl_targets": gr[2] or 0,
                        "gl_tds": gr[3] or 0,
                    }

            # Aggregate per player
            player_info = {}
            player_weeks = defaultdict(list)
            player_opps = defaultdict(lambda: {
                "targets": 0, "carries": 0, "attempts": 0, "total_pts": 0, "games": 0,
                "rec_yards": 0, "rec_tds": 0, "rush_yards": 0,
            })
            player_sos = defaultdict(list)

            # Build team totals from ALL positions (unfiltered) for correct opp_share
            team_totals = defaultdict(lambda: {
                "targets": 0, "carries": 0, "rec_yards": 0,
                "rec_tds": 0, "rush_yards": 0,
            })
            tt_rows = conn.execute("""
                SELECT s.team,
                       COALESCE(SUM(s.targets), 0),
                       COALESCE(SUM(s.carries), 0),
                       COALESCE(SUM(s.receiving_yards), 0),
                       COALESCE(SUM(s.receiving_tds), 0),
                       COALESCE(SUM(s.rushing_yards), 0)
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                GROUP BY s.team
            """, [_season]).fetchall()
            for tr in tt_rows:
                t = team_totals[tr[0] or "FA"]
                t["targets"] = tr[1]
                t["carries"] = tr[2]
                t["rec_yards"] = tr[3]
                t["rec_tds"] = tr[4]
                t["rush_yards"] = tr[5]

            for r in rows:
                pid = r[0]
                if pid not in player_info:
                    player_info[pid] = {
                        "player_id": pid,
                        "name": r[1] or "Unknown",
                        "position": r[2] or "RB",
                        "team": r[3] or "FA",
                        "headshot_url": r[4] or "",
                        "age": r[5],
                    }

                pts = r[6] or 0
                targets = r[7] or 0
                carries = r[8] or 0
                attempts = r[9] or 0
                rec_yards = r[10] or 0
                rec_tds = r[11] or 0
                rush_yards = r[12] or 0
                opp = r[13] or ""
                pos = r[2] or "RB"

                player_weeks[pid].append(pts)
                d = player_opps[pid]
                d["targets"] += targets
                d["carries"] += carries
                d["attempts"] += attempts
                d["total_pts"] += pts
                d["games"] += 1
                d["rec_yards"] += rec_yards
                d["rec_tds"] += rec_tds
                d["rush_yards"] += rush_yards

                opp_allows = defense_ppg.get(opp, {}).get(pos, league_avg.get(pos, 0))
                player_sos[pid].append(opp_allows)

            # Compute metrics per player (min 6 games, 2 PPG)
            players = []
            for pid, weeks in player_weeks.items():
                n = len(weeks)
                if n < 6:
                    continue
                info = player_info[pid]
                opps_d = player_opps[pid]
                total_pts = opps_d["total_pts"]
                games = opps_d["games"]
                ppg = round(total_pts / games, 2) if games > 0 else 0
                if ppg < 2:
                    continue

                # Opportunities: QBs use pass attempts + carries
                pos = info["position"]
                if pos == "QB":
                    opportunities = opps_d["attempts"] + opps_d["carries"]
                else:
                    opportunities = opps_d["targets"] + opps_d["carries"]

                # Efficiency: PPO
                ppo = round(total_pts / opportunities, 2) if opportunities > 0 else 0

                # Consistency: CoV (Bessel's correction)
                mean = sum(weeks) / n
                variance = sum((w - mean) ** 2 for w in weeks) / (n - 1) if n > 1 else 0
                stddev = math.sqrt(variance)
                cov = round(stddev / mean, 3) if mean > 0 else 999

                # Floor: 10th percentile weekly score
                sorted_weeks = sorted(weeks)
                floor_idx = max(0, int(n * 0.1))
                floor_val = round(sorted_weeks[floor_idx], 1)

                # SOS
                sos_list = player_sos[pid]
                avg_opp_ppg = sum(sos_list) / len(sos_list) if sos_list else 0
                pos = info["position"]
                sos_delta = round(league_avg.get(pos, 0) - avg_opp_ppg, 1)

                # Opportunity share
                team = info["team"]
                tt = team_totals[team]
                team_opps = tt["targets"] + tt["carries"]
                opp_share = round(opportunities / team_opps * 100, 1) if team_opps > 0 else 0

                # Dominator rating
                if pos in ("WR", "TE"):
                    rec_yd_share = (opps_d["rec_yards"] / tt["rec_yards"] * 100) if tt["rec_yards"] > 0 else 0
                    rec_td_share = (opps_d["rec_tds"] / tt["rec_tds"] * 100) if tt["rec_tds"] > 0 else 0
                    dom_rating = round((rec_yd_share + rec_td_share) / 2, 1)
                else:
                    dom_rating = round((opps_d["rush_yards"] / tt["rush_yards"] * 100), 1) if tt["rush_yards"] > 0 else 0

                # Goal-line TDs
                gl = gl_lookup.get(pid, {"gl_carries": 0, "gl_targets": 0, "gl_tds": 0})

                # Age for breakout scoring
                age = info["age"] or 26

                players.append({
                    **info,
                    "ppg": ppg,
                    "games": games,
                    "ppo": ppo,
                    "cov": cov,
                    "floor": floor_val,
                    "sos_delta": sos_delta,
                    "opp_share": opp_share,
                    "dom_rating": dom_rating,
                    "gl_tds": gl["gl_tds"],
                    "opportunities": opportunities,
                    "age": age,
                })

            if not players:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "awards": [],
                }

            # Compute percentiles
            n_total = len(players)
            ppg_sorted = sorted([p["ppg"] for p in players])
            ppo_sorted = sorted([p["ppo"] for p in players])
            cov_vals = sorted([p["cov"] for p in players])
            sos_sorted = sorted([p["sos_delta"] for p in players])
            opp_sorted = sorted([p["opp_share"] for p in players])

            def pct_rank(val, sorted_vals):
                rank = sum(1 for v in sorted_vals if v < val)
                return round(rank / n_total * 100, 1) if n_total > 0 else 50

            def grade_from_percentile(pct):
                if pct >= 95:
                    return "A+"
                elif pct >= 85:
                    return "A"
                elif pct >= 75:
                    return "B+"
                elif pct >= 65:
                    return "B"
                elif pct >= 50:
                    return "C+"
                elif pct >= 35:
                    return "C"
                elif pct >= 25:
                    return "D"
                return "F"

            for p in players:
                ppg_pct = pct_rank(p["ppg"], ppg_sorted)
                ppo_pct = pct_rank(p["ppo"], ppo_sorted)
                cov_pct = round(sum(1 for v in cov_vals if v > p["cov"]) / n_total * 100, 1) if n_total > 0 else 50
                sos_pct = pct_rank(p["sos_delta"], sos_sorted)
                opp_pct = pct_rank(p["opp_share"], opp_sorted)

                # Composite GPA
                gpa_pct = round(ppo_pct * 0.20 + cov_pct * 0.20 + sos_pct * 0.20 + ppg_pct * 0.20 + opp_pct * 0.20)
                p["gpa_pct"] = gpa_pct
                p["gpa_grade"] = grade_from_percentile(gpa_pct)

                # Stock score
                stock_score = round(ppo_pct * 0.25 + cov_pct * 0.25 + sos_pct * 0.25 + ppg_pct * 0.25)
                p["stock_score"] = stock_score

                # Stock delta (stock composite vs PPG rank — positive = undervalued)
                p["stock_delta"] = round(stock_score - ppg_pct, 1)

                # Schedule survivor score: PPG x SOS difficulty (harder schedule + high production)
                p["survivor_score"] = round(ppg_pct * 0.5 + sos_pct * 0.5, 1)

                # Breakout score: age-weighted opportunity (younger + high volume = breakout)
                age_bonus = max(0, min(30, 30 - (p["age"] - 21))) / 30 * 100  # 21yo=100, 31yo=0
                p["breakout_score"] = round(opp_pct * 0.5 + age_bonus * 0.3 + ppg_pct * 0.2, 1)

                p["efficiency_grade"] = grade_from_percentile(ppo_pct)
                p["consistency_grade"] = grade_from_percentile(cov_pct)
                p["sos_grade"] = grade_from_percentile(sos_pct)

            # Build award categories
            award_defs = [
                {
                    "key": "mvp",
                    "name": "MVP",
                    "description": "Highest composite Fantasy GPA",
                    "sort_key": "gpa_pct",
                    "stat_label": "GPA",
                    "stat_fn": lambda p: p["gpa_grade"],
                },
                {
                    "key": "most_efficient",
                    "name": "Most Efficient",
                    "description": "Highest fantasy points per opportunity",
                    "sort_key": "ppo",
                    "stat_label": "PPO",
                    "stat_fn": lambda p: str(p["ppo"]),
                },
                {
                    "key": "iron_man",
                    "name": "Iron Man",
                    "description": "Most consistent weekly scorer",
                    "sort_key": "cov",
                    "stat_label": "CoV%",
                    "stat_fn": lambda p: str(round(p["cov"] * 100, 1)) + "%",
                    "reverse": False,
                },
                {
                    "key": "schedule_survivor",
                    "name": "Schedule Survivor",
                    "description": "Best production despite toughest schedule",
                    "sort_key": "survivor_score",
                    "stat_label": "Score",
                    "stat_fn": lambda p: str(p["survivor_score"]),
                },
                {
                    "key": "volume_king",
                    "name": "Volume King",
                    "description": "Highest opportunity share on team",
                    "sort_key": "opp_share",
                    "stat_label": "Opp%",
                    "stat_fn": lambda p: str(p["opp_share"]) + "%",
                },
                {
                    "key": "breakout_star",
                    "name": "Breakout Star",
                    "description": "Young player with highest volume + production",
                    "sort_key": "breakout_score",
                    "stat_label": "Score",
                    "stat_fn": lambda p: str(p["breakout_score"]),
                },
                {
                    "key": "rising_stock",
                    "name": "Rising Stock",
                    "description": "Most undervalued — metrics exceed PPG rank",
                    "sort_key": "stock_delta",
                    "stat_label": "Delta",
                    "stat_fn": lambda p: ("+" + str(p["stock_delta"])) if p["stock_delta"] > 0 else str(p["stock_delta"]),
                },
                {
                    "key": "dominator",
                    "name": "Dominator",
                    "description": "Highest share of team production",
                    "sort_key": "dom_rating",
                    "stat_label": "Dom%",
                    "stat_fn": lambda p: str(p["dom_rating"]) + "%",
                },
                {
                    "key": "redzone_king",
                    "name": "Red Zone King",
                    "description": "Most goal-line touchdowns",
                    "sort_key": "gl_tds",
                    "stat_label": "GL TDs",
                    "stat_fn": lambda p: str(p["gl_tds"]),
                },
                {
                    "key": "best_floor",
                    "name": "Best Floor",
                    "description": "Highest 10th-percentile weekly score",
                    "sort_key": "floor",
                    "stat_label": "Floor",
                    "stat_fn": lambda p: str(p["floor"]),
                },
            ]

            awards = []
            for ad in award_defs:
                reverse = ad.get("reverse", True)
                sorted_players = sorted(players, key=lambda x: x[ad["sort_key"]], reverse=reverse)
                top5 = sorted_players[:5]
                if not top5:
                    continue

                stat_fn = ad["stat_fn"]

                def make_card(p, sfn=stat_fn):
                    return {
                        "player_id": p["player_id"],
                        "name": p["name"],
                        "position": p["position"],
                        "team": p["team"],
                        "headshot_url": p["headshot_url"],
                        "age": p["age"],
                        "ppg": p["ppg"],
                        "games": p["games"],
                        "key_stat": sfn(p),
                        "gpa_grade": p["gpa_grade"],
                        "efficiency_grade": p["efficiency_grade"],
                        "consistency_grade": p["consistency_grade"],
                        "sos_grade": p["sos_grade"],
                        "stock_score": p["stock_score"],
                    }

                awards.append({
                    "key": ad["key"],
                    "name": ad["name"],
                    "description": ad["description"],
                    "stat_label": ad["stat_label"],
                    "annotation": _AWARD_ANNOTATIONS.get(ad["key"], ""),
                    "winner": make_card(top5[0]),
                    "runners_up": [make_card(p) for p in top5[1:]],
                })

            return {
                "season": _season,
                "available_seasons": available_seasons,
                "awards": awards,
            }

    return _cached(f"season_awards:{season}:{position}", _query)


# ---------------------------------------------------------------------------
# Value Over Replacement Player (VORP)
# ---------------------------------------------------------------------------

_VORP_ANNOTATIONS = {
    "QB": "QB replacement = QB12 in 12-team",
    "RB": "RB replacement = RB24 in 12-team",
    "WR": "WR replacement = WR36 in 12-team",
    "TE": "TE replacement = TE12 in 12-team",
}

_REPLACEMENT_RANKS = {"QB": 12, "RB": 24, "WR": 36, "TE": 12}


def fetch_vorp(season=None, position=None, limit=30):
    """Return VORP rankings: league winners and replacement-level players."""
    def _query():
        with get_db() as conn:
            # Determine season + available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            _season = season if season else (available_seasons[0] if available_seasons else _current_nfl_season())

            # Fetch all fantasy-relevant players (no position filter yet — need all for replacement calc)
            query = """
                SELECT
                    p.player_id, p.full_name, p.position, p.team,
                    p.headshot_url,
                    ROUND(SUM(s.fantasy_points_ppr), 1) as total_ppr,
                    COUNT(DISTINCT s.week) as games
                FROM players p
                JOIN player_week_stats s
                    ON s.player_id = p.player_id AND s.season = ?
                WHERE p.position IN ('QB','RB','WR','TE')
                  AND p.fantasy_relevant = 1
                  AND s.season_type = 'regular'
                GROUP BY p.player_id
                HAVING games >= 6 AND (total_ppr / games) >= 2
                ORDER BY total_ppr DESC
            """
            rows = conn.execute(query, [_season]).fetchall()

            if not rows:
                return {
                    "season": _season,
                    "available_seasons": available_seasons,
                    "replacement_thresholds": {},
                    "league_winners": [],
                    "replacement_level": [],
                }

            # Build player list with PPG
            all_players = []
            for r in rows:
                games = r[6] or 1
                total_ppr = r[5] or 0
                ppg = round(total_ppr / games, 2)
                all_players.append({
                    "player_id": r[0],
                    "full_name": r[1] or "Unknown",
                    "position": r[2] or "RB",
                    "team": r[3] or "FA",
                    "headshot_url": r[4] or "",
                    "ppg": ppg,
                    "games": games,
                })

            # Compute replacement-level PPG for each position
            replacement_thresholds = {}
            for pos, repl_rank in _REPLACEMENT_RANKS.items():
                pos_players = sorted(
                    [p for p in all_players if p["position"] == pos],
                    key=lambda x: x["ppg"],
                    reverse=True,
                )
                if len(pos_players) >= repl_rank:
                    replacement_thresholds[pos] = pos_players[repl_rank - 1]["ppg"]
                elif pos_players:
                    replacement_thresholds[pos] = pos_players[-1]["ppg"]
                else:
                    replacement_thresholds[pos] = 0

            # Compute VORP and pos_rank for each player
            # First, compute pos_rank per position
            pos_groups = {}
            for p in all_players:
                pos_groups.setdefault(p["position"], []).append(p)
            for pos in pos_groups:
                pos_groups[pos].sort(key=lambda x: x["ppg"], reverse=True)
                for i, p in enumerate(pos_groups[pos]):
                    p["pos_rank"] = i + 1

            for p in all_players:
                repl_ppg = replacement_thresholds.get(p["position"], 0)
                p["replacement_ppg"] = round(repl_ppg, 2)
                p["vorp"] = round(p["ppg"] - repl_ppg, 2)
                p["annotation"] = _VORP_ANNOTATIONS.get(p["position"], "")

            # Apply position filter if specified
            if position and position.upper() in ("QB", "RB", "WR", "TE"):
                all_players = [p for p in all_players if p["position"] == position.upper()]

            # Split into league winners (VORP > 0) and replacement level
            sorted_by_vorp = sorted(all_players, key=lambda x: x["vorp"], reverse=True)

            league_winners = [p for p in sorted_by_vorp if p["vorp"] > 0][:limit]
            # Adaptive replacement count: fewer when filtering single position
            repl_count = 10 if (position and position.upper() in ("QB", "RB", "WR", "TE")) else 25
            replacement_level = sorted(
                sorted_by_vorp[-repl_count:] if len(sorted_by_vorp) > repl_count else sorted_by_vorp,
                key=lambda x: x["vorp"],
            )[:repl_count]

            return {
                "season": _season,
                "available_seasons": available_seasons,
                "replacement_thresholds": {k: round(v, 2) for k, v in replacement_thresholds.items()},
                "league_winners": league_winners,
                "replacement_level": replacement_level,
            }

    return _cached(f"vorp:{season}:{position}:{limit}", _query)


# ---------------------------------------------------------------------------
# Stat Correlation Matrix
# ---------------------------------------------------------------------------

_CORR_STATS = {
    "ppg": ("SUM(s.fantasy_points_ppr) / COUNT(DISTINCT s.week)", "PPG"),
    "tgt_g": ("SUM(s.targets) / COUNT(DISTINCT s.week)", "Tgt/G"),
    "rec_g": ("SUM(s.receptions) / COUNT(DISTINCT s.week)", "Rec/G"),
    "rec_yd_g": ("SUM(s.receiving_yards) / COUNT(DISTINCT s.week)", "Rec Yd/G"),
    "car_g": ("SUM(s.carries) / COUNT(DISTINCT s.week)", "Car/G"),
    "rush_yd_g": ("SUM(s.rushing_yards) / COUNT(DISTINCT s.week)", "Rush Yd/G"),
    "pass_yd_g": ("SUM(s.passing_yards) / COUNT(DISTINCT s.week)", "Pass Yd/G"),
    "td_g": ("SUM(s.touchdowns) / COUNT(DISTINCT s.week)", "TD/G"),
    "catch_rate": ("CASE WHEN SUM(s.targets) > 0 THEN SUM(s.receptions) * 100.0 / SUM(s.targets) ELSE NULL END", "Catch%"),
    "ypc": ("CASE WHEN SUM(s.carries) > 0 THEN SUM(s.rushing_yards) * 1.0 / SUM(s.carries) ELSE NULL END", "YPC"),
    "ypr": ("CASE WHEN SUM(s.receptions) > 0 THEN SUM(s.receiving_yards) * 1.0 / SUM(s.receptions) ELSE NULL END", "YPR"),
    "snap_pct": ("AVG(s.offense_pct)", "Snap%"),
    "td_rate": ("CASE WHEN p.position = 'QB' THEN CASE WHEN SUM(s.attempts) > 0 THEN SUM(s.passing_tds) * 100.0 / SUM(s.attempts) ELSE NULL END ELSE CASE WHEN (SUM(s.carries) + SUM(s.targets)) > 0 THEN SUM(s.touchdowns) * 100.0 / (SUM(s.carries) + SUM(s.targets)) ELSE NULL END END", "TD Rate"),
}


def fetch_stat_correlations(season=None, position=None, x_stat=None, y_stat=None):
    """Compute Pearson correlations between fantasy stat pairs."""
    def _query():
        with get_db() as conn:
            # Build the season filter
            where = ["p.position IN ('QB','RB','WR','TE')"]
            params = []
            if season:
                where.append("s.season = ?")
                params.append(_safe_int(season))
            if position and position.upper() in FANTASY_POSITIONS:
                where.append("p.position = ?")
                params.append(position.upper())

            where_clause = " AND ".join(where)

            # Build SELECT for all stats
            select_parts = []
            stat_keys = list(_CORR_STATS.keys())
            for key in stat_keys:
                expr = _CORR_STATS[key][0]
                select_parts.append(f"({expr}) as {key}")

            query = f"""
                SELECT p.player_id, p.full_name, p.position,
                       {', '.join(select_parts)}
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE {where_clause}
                  AND s.season_type = 'regular'
                GROUP BY s.player_id, s.season
                HAVING COUNT(DISTINCT s.week) >= 6
            """
            rows = conn.execute(query, params).fetchall()

            if len(rows) < 30:
                return {"error": "Not enough data for correlations", "count": len(rows)}

            # Extract stat arrays (skip NULLs)
            stat_arrays = {k: [] for k in stat_keys}
            player_data = []
            for row in rows:
                pid, name, pos = row[0], row[1], row[2]
                vals = {}
                for i, key in enumerate(stat_keys):
                    vals[key] = row[3 + i]
                player_data.append({"pid": pid, "name": name, "pos": pos, "vals": vals})
                for key in stat_keys:
                    stat_arrays[key].append(vals[key])

            # Pearson correlation
            def pearson(xs, ys):
                pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
                n = len(pairs)
                if n < 10:
                    return None
                mx = sum(p[0] for p in pairs) / n
                my = sum(p[1] for p in pairs) / n
                sx = math.sqrt(sum((p[0] - mx) ** 2 for p in pairs))
                sy = math.sqrt(sum((p[1] - my) ** 2 for p in pairs))
                if sx == 0 or sy == 0:
                    return None
                cov = sum((p[0] - mx) * (p[1] - my) for p in pairs)
                return round(cov / (sx * sy), 3)

            # Build correlation matrix
            matrix = {}
            for i, k1 in enumerate(stat_keys):
                matrix[k1] = {}
                for j, k2 in enumerate(stat_keys):
                    if i == j:
                        matrix[k1][k2] = 1.0
                    elif j < i and k2 in matrix and k1 in matrix[k2]:
                        matrix[k1][k2] = matrix[k2][k1]
                    else:
                        matrix[k1][k2] = pearson(stat_arrays[k1], stat_arrays[k2])

            # Top predictors of PPG
            ppg_corrs = []
            for key in stat_keys:
                if key == "ppg":
                    continue
                r = matrix["ppg"].get(key)
                if r is not None:
                    ppg_corrs.append({"stat": key, "label": _CORR_STATS[key][1], "r": r, "abs_r": abs(r)})
            ppg_corrs.sort(key=lambda x: x["abs_r"], reverse=True)

            # Scatter data for specific pair
            scatter = None
            if x_stat and y_stat and x_stat in _CORR_STATS and y_stat in _CORR_STATS:
                scatter = []
                for pd in player_data:
                    xv = pd["vals"].get(x_stat)
                    yv = pd["vals"].get(y_stat)
                    if xv is not None and yv is not None:
                        scatter.append({
                            "name": pd["name"],
                            "pos": pd["pos"],
                            "x": round(xv, 2) if xv else 0,
                            "y": round(yv, 2) if yv else 0,
                        })

            # Stat labels
            labels = {k: v[1] for k, v in _CORR_STATS.items()}

            # Available seasons
            avail = conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
            available_seasons = [r[0] for r in avail]

            return {
                "stat_keys": stat_keys,
                "labels": labels,
                "matrix": matrix,
                "top_predictors": ppg_corrs,
                "scatter": scatter,
                "sample_size": len(rows),
                "available_seasons": available_seasons,
            }

    return _cached(f"stat_correlations:{season}:{position}:{x_stat}:{y_stat}", _query, ttl=_CACHE_TTL_STABLE)
