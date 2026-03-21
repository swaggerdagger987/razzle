"""
NFL player CRUD functions — search, screener, profiles, comparisons, boom/bust, comps.
Extracted from _monolith.py in Phase 27 Task 3.
"""

import json
import logging
import re
import statistics

from ..db import get_db

logger = logging.getLogger("razzle.live_data.players")

from .core import (
    _cached, _CACHE_TTL_STABLE,
    _current_nfl_season, _safe_int,
    FANTASY_POSITIONS, RATE_METRICS, _STAT_SUM_COLS,
    TEAM_ABBREV, ABBREV_TO_TEAM,
    _enrich_with_derived_stats, _enrich_with_epa_per_play,
    _enrich_with_rate_metrics, _enrich_with_breakout,
    _enrich_with_dynasty_value,
    _enrich_with_pbp_stats, _enrich_with_team_shares,
    _COMP_STATS, _COMP_STAT_LABELS, _build_stat_vector, _cosine_similarity,
)


def db_stats():
    def _query():
        with get_db() as conn:
            players = conn.execute("SELECT COUNT(*) FROM players").fetchone()[0]
            stats = conn.execute("SELECT COUNT(*) FROM player_week_stats").fetchone()[0]
            seasons = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season").fetchall()
            return {
                "players": players,
                "stat_rows": stats,
                "seasons": [r[0] for r in seasons],
            }
    return _cached("db_stats", _query)


def quick_search_players(query, limit=8):
    """Lightweight player search for command palette — hits players table + latest PPG."""
    if not query or not query.strip():
        return []
    limit = max(1, min(limit, 20))
    def _query():
        with get_db() as conn:
            escaped_q = re.sub(r"[^a-z0-9]", "", query.lower())
            escaped_q = escaped_q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            search_term = "%" + escaped_q + "%"
            rows = conn.execute("""
                WITH ms AS (SELECT MAX(season) AS s FROM player_week_stats)
                SELECT p.player_id, p.full_name, p.position, p.team, p.headshot_url,
                       COALESCE(
                           (SELECT ROUND(SUM(s.fantasy_points_ppr) * 1.0 / COUNT(DISTINCT s.week), 1)
                            FROM player_week_stats s, ms
                            WHERE s.player_id = p.player_id
                              AND s.season = ms.s
                              AND s.season_type = 'regular'),
                           0) AS ppg
                FROM players p
                WHERE p.search_name LIKE ? ESCAPE '\\'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND p.fantasy_relevant = 1
                ORDER BY ppg DESC
                LIMIT ?
            """, (search_term, limit)).fetchall()
            return [dict(r) for r in rows]
    return _cached(f"quick_search:{query}:{limit}", _query)


def fetch_players(
    search="",
    position="",
    positions="",
    team="",
    sort_key="fantasy_points_ppr",
    sort_dir="desc",
    limit=200,
    offset=0,
    season=0,
):
    def _query():
        with get_db() as conn:

            # Determine season: 0 = latest, "career" = all seasons
            _career_mode = str(season).lower() == "career"
            _season = season
            if not _career_mode:
                _season = _safe_int(_season)
                if not _season:
                    row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
                    _season = row[0] if row and row[0] else _current_nfl_season()

            # Build position filter
            pos_list = []
            if positions:
                pos_list = [p.strip().upper() for p in positions.split(",") if p.strip()]
            elif position:
                pos_list = [position.strip().upper()]

            # Allowed sort columns (prevent SQL injection)
            safe_sorts = {
                "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
                "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
                "receiving_yards", "receiving_tds", "receptions", "touchdowns",
                "turnovers", "targets", "carries", "completions", "attempts",
                "passing_air_yards", "receiving_air_yards", "receiving_yards_after_catch",
                "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
                "sacks_taken", "sack_yards_lost", "rushing_fumbles",
                "receiving_fumbles", "receiving_fumbles_lost",
                "sack_fumbles", "sack_fumbles_lost", "fumbles", "fumbles_lost",
                "offense_snaps", "offense_pct",
                "full_name", "position", "team", "games", "seasons", "age", "ppg",
                # Derived metrics (computed post-query, re-sorted in Python)
                "half_ppr_ppg", "cpoe", "epa_per_play",
                "yards_per_carry", "yards_per_rec", "yards_per_target", "catch_rate",
                "comp_pct", "yards_per_att", "rec_per_game", "targets_per_game",
                "rush_ypg", "rec_ypg", "pass_ypg", "adot", "snap_share",
                "td_rate", "fumble_rate", "passer_rating", "ay_per_att",
                "ppfd", "ppfd_per_game", "yprr",
                "target_share", "air_yards_share", "wopr", "racr",
                "passing_epa", "receiving_epa", "rushing_epa", "dakota",
                "dynasty_value",
            }
            _sort_key = sort_key
            if _sort_key not in safe_sorts:
                _sort_key = "fantasy_points_ppr"
            _sort_dir = sort_dir or "desc"
            if str(_sort_dir).lower() not in ("asc", "desc"):
                _sort_dir = "desc"

            where = ["s.season_type = 'regular'"]
            params = []

            if _career_mode:
                pass  # no season filter — aggregate all seasons
            else:
                where.append("s.season = ?")
                params.append(_season)

            if search:
                escaped_s = re.sub(r"[^a-z0-9]", "", search.lower())
                escaped_s = escaped_s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
                where.append("p.search_name LIKE ? ESCAPE '\\'")
                params.append(f"%{escaped_s}%")

            if pos_list:
                placeholders = ",".join("?" * len(pos_list))
                where.append(f"p.position IN ({placeholders})")
                params.extend(pos_list)

            if team:
                where.append("p.team = ?")
                params.append(team.strip().upper())

            where_clause = " AND ".join(where) if where else "1=1"

            # Handle sort expression
            # SQL-sortable columns sort in the query; derived/rate metrics
            # fall back to PPR in SQL, then re-sort in Python after enrichment
            _sql_sortable = {
                "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
                "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
                "receiving_yards", "receiving_tds", "receptions", "touchdowns",
                "turnovers", "targets", "carries", "completions", "attempts",
                "passing_air_yards", "receiving_air_yards", "receiving_yards_after_catch",
                "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
                "sacks_taken", "sack_yards_lost", "rushing_fumbles",
                "receiving_fumbles", "receiving_fumbles_lost",
                "sack_fumbles", "sack_fumbles_lost", "fumbles", "fumbles_lost",
                "offense_snaps", "offense_pct",
            }
            _python_sort = _sort_key not in _sql_sortable and _sort_key not in (
                "ppg", "games", "seasons", "full_name", "position", "team", "age",
            )
            _effective_sort = _sort_key if not _python_sort else "fantasy_points_ppr"
            sort_expr = _effective_sort
            if _effective_sort == "ppg":
                sort_expr = "(SUM(s.fantasy_points_ppr) / MAX(1, COUNT(*)))"
            elif _effective_sort == "seasons":
                sort_expr = "COUNT(DISTINCT s.season)"
            elif _effective_sort == "games":
                sort_expr = "COUNT(*)"
            elif _effective_sort == "age":
                sort_expr = "p.age"
            elif _effective_sort in ("full_name", "position", "team"):
                sort_expr = f"p.{_effective_sort}"
            elif _effective_sort in _sql_sortable:
                sort_expr = f"SUM(s.{_effective_sort})"

            # Count total (for pagination) — run before main query so we can
            # use actual total as over-fetch limit for python-sorted queries
            count_query = f"""
                SELECT COUNT(DISTINCT p.player_id)
                FROM players p
                JOIN player_week_stats s ON p.player_id = s.player_id
                WHERE {where_clause}
            """
            total = conn.execute(count_query, params).fetchone()[0]

            # Over-fetch when Python re-sort needed (derived stats require all rows)
            if _python_sort:
                sql_limit = min(total, 5000)
                sql_offset = 0
            else:
                sql_limit = limit
                sql_offset = offset

            query = f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team, p.age, p.college, p.headshot_url,
                    COUNT(*) as games,
                    COUNT(DISTINCT s.season) as seasons,
                    ROUND(COALESCE(SUM(s.fantasy_points_half_ppr), SUM(s.fantasy_points_ppr) - 0.5 * SUM(s.receptions)), 1) as fantasy_points_half_ppr,
                    {_STAT_SUM_COLS}
                FROM players p
                JOIN player_week_stats s ON p.player_id = s.player_id
                WHERE {where_clause}
                GROUP BY p.player_id
                ORDER BY {sort_expr} {_sort_dir}
                LIMIT ? OFFSET ?
            """
            params.extend([sql_limit, sql_offset])

            rows = conn.execute(query, params).fetchall()

            items = [dict(r) for r in rows]
            _enrich_with_derived_stats(items)
            _enrich_with_rate_metrics(conn, items, season=_season, career_mode=_career_mode)
            _enrich_with_epa_per_play(items)
            _enrich_with_breakout(conn, items, season=_season, career_mode=_career_mode)
            _enrich_with_dynasty_value(items)
            _enrich_with_team_shares(conn, items, season=_season, career_mode=_career_mode)
            _enrich_with_pbp_stats(conn, items, season=_season, career_mode=_career_mode)

            # Re-sort in Python for derived/rate metrics
            if _python_sort:
                reverse = _sort_dir.lower() == "desc"
                _null_sentinel = float('-inf') if reverse else float('inf')
                items.sort(key=lambda x: x.get(_sort_key) if x.get(_sort_key) is not None else _null_sentinel, reverse=reverse)
                items = items[offset:offset + limit]

            return {"count": total, "season": "career" if _career_mode else _season, "items": items}
    return _cached(f"fetch_players:{search}:{position}:{positions}:{team}:{sort_key}:{sort_dir}:{limit}:{offset}:{season}", _query)


def _fetch_screener_uncached(body):
    """Complex multi-filter screener query (POST body) — uncached implementation."""
    with get_db() as conn:

        search = body.get("search", "")
        position = body.get("position", "")
        positions = body.get("positions", [])
        team = body.get("team", "")
        season = body.get("season", 0)
        week = body.get("week", 0)
        sort_key = body.get("sort_key", "fantasy_points_ppr")
        sort_dir = body.get("sort_direction", "desc")
        limit = max(1, min(_safe_int(body.get("limit", 200), 200), 1000))
        offset = max(0, _safe_int(body.get("offset", 0)))
        filters = body.get("filters", [])[:50]
        relevance = body.get("relevance", "fantasy")

        # Determine season: 0 = latest, "career" = all seasons
        career_mode = str(season).lower() == "career"
        if not career_mode:
            season = _safe_int(season)
            if not season:
                row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
                season = row[0] if row and row[0] else _current_nfl_season()

        # Position list
        pos_list = []
        if positions:
            pos_list = [p.strip().upper() for p in positions]
        elif position:
            pos_list = [position.strip().upper()]

        # For fantasy relevance, default to fantasy positions
        if relevance == "fantasy" and not pos_list:
            pos_list = list(FANTASY_POSITIONS)

        where = ["s.season_type = 'regular'"]
        params = []

        if career_mode:
            pass  # no season filter — aggregate all seasons
        else:
            where.append("s.season = ?")
            params.append(season)

        # Week filter: 0 = all weeks (season aggregate), >0 = specific week
        week = _safe_int(week)
        if week > 0 and not career_mode:
            where.append("s.week = ?")
            params.append(week)

        if search:
            escaped_s = re.sub(r"[^a-z0-9]", "", search.lower())
            escaped_s = escaped_s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            where.append("p.search_name LIKE ? ESCAPE '\\'")
            params.append(f"%{escaped_s}%")

        if pos_list:
            placeholders = ",".join("?" * len(pos_list))
            where.append(f"p.position IN ({placeholders})")
            params.extend(pos_list)

        # Support multi-team filtering: comma-separated or list
        teams_param = body.get("teams", [])
        if teams_param and isinstance(teams_param, list) and len(teams_param) > 0:
            team_list = [t.strip().upper() for t in teams_param if t.strip()]
            if team_list:
                placeholders_t = ",".join("?" * len(team_list))
                where.append(f"p.team IN ({placeholders_t})")
                params.extend(team_list)
        elif team:
            where.append("p.team = ?")
            params.append(team.strip().upper())

        # Support minimum games played filter (HAVING clause added later)
        min_gp = body.get("min_gp", 0)

        where_clause = " AND ".join(where) if where else "1=1"

        # Safe sort — includes derived and rate metrics (computed post-query)
        safe_sorts = {
            "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
            "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
            "receiving_yards", "receiving_tds", "receptions", "touchdowns",
            "turnovers", "targets", "carries", "games", "ppg", "seasons",
            "full_name", "position", "team",
            # Phase 29: new aggregate stats
            "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
            "sacks_taken", "sack_yards_lost", "rushing_fumbles",
            "receiving_fumbles", "receiving_fumbles_lost",
            "sack_fumbles", "sack_fumbles_lost", "fumbles", "fumbles_lost",
            "offense_snaps", "offense_pct",
            # Derived metrics (computed in Python, sorted client-side)
            "yards_per_carry", "yards_per_rec", "yards_per_target", "catch_rate",
            "comp_pct", "yards_per_att", "rec_per_game", "targets_per_game",
            "rush_ypg", "rec_ypg", "pass_ypg", "adot", "snap_share",
            # Rate metrics from player_week_metrics
            "target_share", "air_yards_share", "wopr", "racr",
            "passing_epa", "receiving_epa", "rushing_epa", "dakota", "cpoe",
            # Derived post-enrichment
            "half_ppr_ppg", "epa_per_play",
            "td_rate", "fumble_rate", "passer_rating", "ay_per_att",
            "ppfd", "ppfd_per_game", "yprr",
            # Dynasty value
            "dynasty_value", "age",
        }
        if sort_key not in safe_sorts:
            sort_key = "fantasy_points_ppr"
        sort_dir = sort_dir or "desc"
        if str(sort_dir).lower() not in ("asc", "desc"):
            sort_dir = "desc"

        # Columns that can be filtered via SQL HAVING (not derived/rate metrics)
        sql_filterable = {
            "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
            "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
            "receiving_yards", "receiving_tds", "receptions", "touchdowns",
            "turnovers", "targets", "carries", "games", "ppg", "seasons",
            "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
            "sacks_taken", "sack_yards_lost", "fumbles", "fumbles_lost",
            "offense_snaps",
        }

        # Build having clause for advanced filters
        # Explicit mapping from filter key to SQL expression (no f-string interpolation)
        FILTER_COLUMN_MAP = {
            "ppg": "(SUM(s.fantasy_points_ppr) / MAX(1, COUNT(*)))",
            "games": "COUNT(*)",
            "seasons": "COUNT(DISTINCT s.season)",
            "fantasy_points_ppr": "ROUND(SUM(s.fantasy_points_ppr), 1)",
            "completions": "SUM(s.completions)",
            "pass_attempts": "SUM(s.attempts)",
            "passing_yards": "SUM(s.passing_yards)",
            "passing_tds": "SUM(s.passing_tds)",
            "interceptions": "SUM(s.interceptions)",
            "carries": "SUM(s.carries)",
            "rushing_yards": "SUM(s.rushing_yards)",
            "rushing_tds": "SUM(s.rushing_tds)",
            "targets": "SUM(s.targets)",
            "receptions": "SUM(s.receptions)",
            "receiving_yards": "SUM(s.receiving_yards)",
            "receiving_tds": "SUM(s.receiving_tds)",
            "total_tds": "SUM(s.touchdowns)",
            "turnovers": "SUM(s.turnovers)",
            "sacks_taken": "SUM(s.sacks_taken)",
            "sack_yards_lost": "SUM(s.sack_yards_lost)",
            "fumbles": "SUM(s.fumbles)",
            "fumbles_lost": "SUM(s.fumbles_lost)",
            "offense_snaps": "SUM(s.offense_snaps)",
        }

        having = []
        post_filters = []  # filters for derived stats (applied after enrichment)
        ops = {"gt": ">", "gte": ">=", "lt": "<", "lte": "<=", "eq": "=", "neq": "!="}
        for f in filters:
            key = f.get("key", "")
            op = ops.get(f.get("op", ""), None)
            val = f.get("value")
            if not key or not op or val is None:
                continue
            try:
                fval = float(val)
            except (ValueError, TypeError):
                continue
            sql_expr = FILTER_COLUMN_MAP.get(key)
            if sql_expr:
                having.append(f"{sql_expr} {op} ?")
                params.append(fval)
            else:
                # Derived stat — filter post-query
                post_filters.append({"key": key, "op": op, "value": fval})

        # Add minimum games played filter
        _min_gp = _safe_int(min_gp)
        if _min_gp > 0:
            having.append("COUNT(*) >= ?")
            params.append(_min_gp)

        having_clause = ""
        if having:
            having_clause = "HAVING " + " AND ".join(having)

        # Derived/rate metrics are computed post-query — sort by PPR in SQL, re-sort in Python
        sql_sortable = {
            "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
            "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
            "receiving_yards", "receiving_tds", "receptions", "touchdowns",
            "turnovers", "targets", "carries",
            "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
            "sacks_taken", "sack_yards_lost", "fumbles", "fumbles_lost",
            "offense_snaps",
        }
        python_sort = sort_key not in sql_sortable and sort_key not in ("ppg", "games", "seasons", "full_name", "position", "team", "age")

        # Handle sort expression
        effective_sort = sort_key if not python_sort else "fantasy_points_ppr"
        order_expr = effective_sort
        if effective_sort == "ppg":
            order_expr = "(SUM(s.fantasy_points_ppr) / MAX(1, COUNT(*)))"
        elif effective_sort == "age":
            order_expr = "p.age"
        elif effective_sort == "games":
            order_expr = "COUNT(*)"
        elif effective_sort == "seasons":
            order_expr = "COUNT(DISTINCT s.season)"
        elif effective_sort in ("full_name", "position", "team"):
            order_expr = f"p.{effective_sort}"
        else:
            order_expr = f"SUM(s.{effective_sort})"

        # Count total first — needed for python-sort over-fetch limit
        count_query = f"""
            SELECT COUNT(*) FROM (
                SELECT p.player_id
                FROM players p
                JOIN player_week_stats s ON p.player_id = s.player_id
                WHERE {where_clause}
                GROUP BY p.player_id
                {having_clause}
            )
        """
        total = conn.execute(count_query, params).fetchone()[0]

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age, p.college, p.headshot_url,
                COUNT(*) as games,
                COUNT(DISTINCT s.season) as seasons,
                ROUND(COALESCE(SUM(s.fantasy_points_half_ppr), SUM(s.fantasy_points_ppr) - 0.5 * SUM(s.receptions)), 1) as fantasy_points_half_ppr,
                {_STAT_SUM_COLS}
            FROM players p
            JOIN player_week_stats s ON p.player_id = s.player_id
            WHERE {where_clause}
            GROUP BY p.player_id
            {having_clause}
            ORDER BY {order_expr} {sort_dir}
            LIMIT ? OFFSET ?
        """
        # When sorting by derived/rate metric or applying post-filters, fetch all matching
        # rows so Python sort/filter operates on complete dataset before pagination
        if python_sort or post_filters:
            sql_limit = min(total, 5000)
            sql_offset = 0
        else:
            sql_limit = limit
            sql_offset = offset
        params.extend([sql_limit, sql_offset])

        rows = conn.execute(query, params).fetchall()

        items = [dict(r) for r in rows]
        _enrich_with_derived_stats(items)
        _enrich_with_rate_metrics(conn, items, season=season, career_mode=career_mode, week=week)
        _enrich_with_epa_per_play(items)
        _enrich_with_breakout(conn, items, season=season, career_mode=career_mode)
        _enrich_with_dynasty_value(items)
        _enrich_with_team_shares(conn, items, season=season, career_mode=career_mode, week=week)
        _enrich_with_pbp_stats(conn, items, season=season, career_mode=career_mode, week=week)

        # Apply post-query filters for derived stats
        if post_filters:
            def _passes(item, pf):
                v = item.get(pf["key"])
                if v is None:
                    return False
                try:
                    v = float(v)
                except (TypeError, ValueError):
                    return False
                op = pf["op"]
                tv = pf["value"]
                if op == ">": return v > tv
                if op == ">=": return v >= tv
                if op == "<": return v < tv
                if op == "<=": return v <= tv
                if op == "=": return v == tv
                if op == "!=": return v != tv
                return True
            items = [it for it in items if all(_passes(it, pf) for pf in post_filters)]
            total = len(items)

        # Re-sort in Python if sorting by a derived/rate metric
        if python_sort:
            reverse = sort_dir.lower() == "desc"
            _null_sentinel = float('-inf') if reverse else float('inf')
            items.sort(key=lambda x: x.get(sort_key) if x.get(sort_key) is not None else _null_sentinel, reverse=reverse)

        # Apply pagination after post-filtering and Python re-sort
        if python_sort or post_filters:
            items = items[offset:offset + limit]

        result = {"count": total, "season": "career" if career_mode else season, "items": items}
        if week > 0:
            result["week"] = week
        return result


def fetch_screener(body):
    """Complex multi-filter screener query (POST body).
    Not cached at data level — user-controlled POST bodies would fill the cache
    with unique keys. Response-level caching in server.py handles repeat queries."""
    return _fetch_screener_uncached(body)


def get_filter_options():
    """Return available positions, teams, and stat columns for autocomplete."""
    def _query():
        with get_db() as conn:
            positions = [r[0] for r in conn.execute(
                "SELECT DISTINCT position FROM players WHERE position IN ('QB','RB','WR','TE') ORDER BY position"
            ).fetchall()]
            teams = [r[0] for r in conn.execute(
                "SELECT DISTINCT team FROM players WHERE team IS NOT NULL AND team != '' ORDER BY team"
            ).fetchall()]
            stat_keys = [r[0] for r in conn.execute(
                "SELECT DISTINCT stat_key FROM player_week_metrics ORDER BY stat_key"
            ).fetchall()]
            seasons = [r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()]
            return {
                "positions": positions,
                "teams": teams,
                "stat_keys": stat_keys,
                "seasons": seasons,
            }
    return _cached("filter_options", _query)


def fetch_screener_sparklines(player_ids, season=0):
    """Batch-fetch weekly fantasy_points_ppr for up to 200 players (for inline sparklines)."""
    if not isinstance(player_ids, list) or not player_ids:
        return {"sparklines": {}}
    # Coerce all IDs to strings, clamp to 200
    ids = [str(pid) for pid in player_ids[:200]]
    # Coerce season to int
    try:
        season = _safe_int(season)
    except (ValueError, TypeError):
        season = 0
    def _query():
        with get_db() as conn:
            _season = season
            if not _season:
                row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
                _season = row[0] if row and row[0] else _current_nfl_season()
            placeholders = ",".join("?" for _ in ids)
            rows = conn.execute(f"""
                SELECT player_id, week, fantasy_points_ppr
                FROM player_week_stats
                WHERE player_id IN ({placeholders}) AND season = ?
                  AND season_type = 'regular'
                ORDER BY player_id, week ASC
            """, ids + [_season]).fetchall()
            sparklines = {}
            for r in rows:
                pid = r["player_id"]
                pts = r["fantasy_points_ppr"]
                if pid not in sparklines:
                    sparklines[pid] = []
                sparklines[pid].append(round(pts, 1) if pts is not None else 0)
            # Ensure all requested IDs appear (empty array if no data)
            for pid in ids:
                if pid not in sparklines:
                    sparklines[pid] = []
            return {"sparklines": sparklines, "season": _season}
    _ck = f"sparklines:{json.dumps(sorted(ids))}:{season}"
    return _cached(_ck, _query)


def fetch_player_weeks(player_id, season=0):
    """Return week-by-week stats for a single player."""
    def _query():
        with get_db() as conn:

            _season = season
            if not _season:
                row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
                _season = row[0] if row and row[0] else _current_nfl_season()

            rows = conn.execute("""
                SELECT s.*, p.full_name, p.position, p.team
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.player_id = ? AND s.season = ?
                  AND s.season_type = 'regular'
                ORDER BY s.week ASC
            """, (player_id, _season)).fetchall()

            player_info = conn.execute(
                "SELECT player_id, full_name, position, team, age, college, headshot_url FROM players WHERE player_id = ?",
                (player_id,)
            ).fetchone()

            return {
                "player": dict(player_info) if player_info else {},
                "season": _season,
                "weeks": [dict(r) for r in rows],
            }
    return _cached(f"player_weeks:{player_id}:{season}", _query)


def fetch_player_seasons(player_id):
    """Return season-level aggregates for a single player (for trend charts)."""
    def _query():
        with get_db() as conn:

            player_info = conn.execute(
                "SELECT player_id, full_name, position, team, age, college, headshot_url FROM players WHERE player_id = ?",
                (player_id,)
            ).fetchone()

            rows = conn.execute(f"""
                SELECT
                    s.season,
                    COUNT(*) as games,
                    {_STAT_SUM_COLS}
                FROM player_week_stats s
                WHERE s.player_id = ?
                  AND s.season_type = 'regular'
                GROUP BY s.season
                ORDER BY s.season ASC
            """, (player_id,)).fetchall()

            seasons = [dict(r) for r in rows]
            _enrich_with_derived_stats(seasons)

            return {
                "player": dict(player_info) if player_info else {},
                "seasons": seasons,
            }
    return _cached(f"player_seasons:{player_id}", _query)


def _fetch_player_profile_uncached(player_id):
    """Return a rich player profile: bio, season-by-season stats, combine/draft data."""
    with get_db() as conn:

        # Player bio
        player_info = conn.execute(
            "SELECT player_id, full_name, position, team, age, college, headshot_url FROM players WHERE player_id = ?",
            (player_id,)
        ).fetchone()

        if not player_info:
            return {"player": {}, "seasons": [], "combine": None}

        player = dict(player_info)

        # Season-by-season aggregates
        rows = conn.execute(f"""
            SELECT
                s.season,
                COUNT(*) as games,
                {_STAT_SUM_COLS}
            FROM player_week_stats s
            WHERE s.player_id = ?
              AND s.season_type = 'regular'
            GROUP BY s.season
            ORDER BY s.season ASC
        """, (player_id,)).fetchall()

        seasons = [dict(r) for r in rows]
        _enrich_with_derived_stats(seasons)

        # Enrich each season with rate metrics (single query for all seasons)
        if seasons:
            stat_placeholders = ",".join("?" * len(RATE_METRICS))
            rate_rows = conn.execute(f"""
                SELECT m.season, m.stat_key, AVG(m.stat_value) as avg_val
                FROM player_week_metrics m
                WHERE m.player_id = ? AND m.stat_key IN ({stat_placeholders})
                  AND m.season_type = 'regular'
                GROUP BY m.season, m.stat_key
            """, [player_id] + list(RATE_METRICS)).fetchall()
            rate_lookup = {}
            for r in rate_rows:
                rate_lookup.setdefault(r[0], {})[r[1]] = round(r[2], 3) if r[2] is not None else None
            for season_row in seasons:
                s_rates = rate_lookup.get(season_row["season"], {})
                for metric in RATE_METRICS:
                    season_row[metric] = s_rates.get(metric)

        # Career totals
        career = {}
        if seasons:
            for key in ["games", "fantasy_points_ppr", "fantasy_points_std",
                         "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
                         "receiving_yards", "receiving_tds", "receptions", "touchdowns",
                         "turnovers", "targets", "carries", "completions", "attempts",
                         "passing_air_yards", "receiving_air_yards", "receiving_yards_after_catch",
                         "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
                         "sacks_taken", "sack_yards_lost", "fumbles", "fumbles_lost",
                         "offense_snaps"]:
                career[key] = round(sum(s.get(key) or 0 for s in seasons), 1)
            career["seasons"] = len(seasons)
            _enrich_with_derived_stats([career])

        # Combine/draft data (match by name + position)
        combine = None
        has_combine = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='combine_data'"
        ).fetchone()
        name = player.get("full_name", "")
        pos = player.get("position", "")
        if has_combine and name and pos:
            search_name = re.sub(r"[^a-z]", "", name.lower())
            combine_row = conn.execute("""
                SELECT c.*, d.career_av, d.draft_av, d.allpro, d.probowls, d.seasons_started
                FROM combine_data c
                LEFT JOIN draft_picks d
                    ON c.draft_year = d.season
                    AND LOWER(REPLACE(c.player_name, ' ', '')) = LOWER(REPLACE(d.player_name, ' ', ''))
                    AND c.position = d.position
                WHERE LOWER(REPLACE(c.player_name, ' ', '')) = ?
                    AND c.position = ?
                ORDER BY c.draft_year DESC
                LIMIT 1
            """, (search_name, pos)).fetchone()

            if combine_row:
                c = dict(combine_row)
                ht = c.get("height_inches")
                if ht:
                    c["height_display"] = f"{ht // 12}'{ht % 12}\""
                dt = (c.get("draft_team") or "").upper()
                c["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)
                combine = c

        return {
            "player": player,
            "seasons": seasons,
            "career": career,
            "combine": combine,
        }



def fetch_player_profile(player_id):
    return _cached(f"fetch_player_profile:{player_id}", lambda: _fetch_player_profile_uncached(player_id=player_id))

def _fetch_players_compare_uncached(player_ids, season=0):
    """Return season aggregates for multiple players (for comparison)."""
    with get_db() as conn:

        career_mode = str(season).lower() == "career"
        if not career_mode:
            season = _safe_int(season)
            if not season:
                row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
                season = row[0] if row and row[0] else _current_nfl_season()

        if not player_ids:
            return {"season": "career" if career_mode else season, "players": []}

        placeholders = ",".join("?" * len(player_ids))
        season_filter = "" if career_mode else "AND s.season = ?"
        query_params = list(player_ids) if career_mode else list(player_ids) + [season]

        rows = conn.execute(f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age, p.college, p.headshot_url,
                COUNT(*) as games,
                COUNT(DISTINCT s.season) as seasons,
                {_STAT_SUM_COLS}
            FROM players p
            JOIN player_week_stats s ON p.player_id = s.player_id
            WHERE p.player_id IN ({placeholders}) AND s.season_type = 'regular' {season_filter}
            GROUP BY p.player_id
        """, query_params).fetchall()

        players = []
        for r in rows:
            item = dict(r)
            g = item["games"] or 1
            item["ppg"] = round((item["fantasy_points_ppr"] or 0) / g, 1)
            players.append(item)

        return {"season": "career" if career_mode else season, "players": players}



def fetch_players_compare(player_ids, season=0):
    _key = "fetch_players_compare:" + ":".join(sorted(player_ids)) + f":{season}"
    return _cached(_key, lambda: _fetch_players_compare_uncached(player_ids=player_ids, season=season))

def _fetch_team_roster_uncached(team=None, season=None):
    """Return all fantasy-relevant players for a team, grouped by position."""
    with get_db() as conn:

        # Determine season
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        # Get available seasons
        season_rows = conn.execute(
            "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
        ).fetchall()
        available_seasons = [r[0] for r in season_rows]

        # Get available teams for the selected season
        team_rows = conn.execute("""
            SELECT DISTINCT p.team FROM players p
            JOIN player_week_stats s ON s.player_id = p.player_id AND s.season = ? AND s.season_type = 'regular'
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.team IS NOT NULL AND p.team != ''
            ORDER BY p.team
        """, [season]).fetchall()
        available_teams = [r[0] for r in team_rows]

        if not team or team.upper() not in available_teams:
            # Default to first available team alphabetically
            team = available_teams[0] if available_teams else "KC"

        team = team.upper()

        query = """
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                ROUND(SUM(s.fantasy_points_ppr), 1) as total_ppr,
                COUNT(DISTINCT s.week) as games,
                SUM(s.passing_yards) as passing_yards,
                SUM(s.passing_tds) as passing_tds,
                SUM(s.rushing_yards) as rushing_yards,
                SUM(s.rushing_tds) as rushing_tds,
                SUM(s.receiving_yards) as receiving_yards,
                SUM(s.receiving_tds) as receiving_tds,
                SUM(s.receptions) as receptions,
                SUM(s.targets) as targets,
                SUM(s.carries) as carries
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ? AND s.season_type = 'regular'
            WHERE p.team = ?
              AND p.position IN ('QB','RB','WR','TE')
            GROUP BY p.player_id
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, [season, team]).fetchall()

        groups = {"QB": [], "RB": [], "WR": [], "TE": []}
        for r in rows:
            pid = r[0]
            pos = r[2] or "WR"
            games = r[7] or 0
            total_ppr = r[6] or 0
            ppg = round(total_ppr / games, 1) if games > 0 else 0.0

            player = {
                "player_id": pid,
                "full_name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or team,
                "age": r[4],
                "headshot_url": r[5] or "",
                "ppg": ppg,
                "games": games,
                "total_ppr": round(total_ppr, 1),
                "passing_yards": r[8] or 0,
                "passing_tds": r[9] or 0,
                "rushing_yards": r[10] or 0,
                "rushing_tds": r[11] or 0,
                "receiving_yards": r[12] or 0,
                "receiving_tds": r[13] or 0,
                "receptions": r[14] or 0,
                "targets": r[15] or 0,
                "carries": r[16] or 0,
            }

            if pos in groups:
                groups[pos].append(player)

        team_full = ABBREV_TO_TEAM.get(team, team)

        return {
            "team": team,
            "team_full_name": team_full,
            "season": season,
            "available_seasons": available_seasons,
            "available_teams": [{"abbr": t, "name": ABBREV_TO_TEAM.get(t, t)} for t in available_teams],
            "groups": groups,
            "total_players": sum(len(v) for v in groups.values()),
        }



def fetch_team_roster(team=None, season=None):
    return _cached(f"fetch_team_roster:{team}:{season}", lambda: _fetch_team_roster_uncached(team=team, season=season))

def _fetch_career_stats_uncached(player_id):
    """Return season-by-season stats for a single player across all available seasons."""
    if not player_id:
        return {"error": "player_id is required"}

    with get_db() as conn:
        # Get player info
        player = conn.execute(
            "SELECT player_id, full_name, position, team, age "
            "FROM players WHERE player_id = ?",
            (player_id,),
        ).fetchone()
        if not player:
            return {"error": "Player not found"}

        pos = player[2] or "WR"
        player_info = {
            "player_id": player[0],
            "full_name": player[1] or "Unknown",
            "position": pos,
            "team": player[3] or "FA",
            "age": player[4] or 0,
        }

        # Get season-by-season aggregates
        rows = conn.execute("""
            SELECT
                s.season,
                COUNT(DISTINCT s.week) as games,
                ROUND(SUM(s.fantasy_points_ppr), 1) as total_ppr,
                ROUND(COALESCE(SUM(s.fantasy_points_half_ppr), SUM(s.fantasy_points_ppr) - 0.5 * SUM(s.receptions)), 1) as total_hppr,
                ROUND(SUM(s.fantasy_points_std), 1) as total_std,
                SUM(s.receptions) as rec,
                SUM(s.targets) as tgt,
                SUM(s.receiving_yards) as rec_yd,
                SUM(s.receiving_tds) as rec_td,
                SUM(s.carries) as car,
                SUM(s.rushing_yards) as rush_yd,
                SUM(s.rushing_tds) as rush_td,
                SUM(s.passing_yards) as pass_yd,
                SUM(s.passing_tds) as pass_td,
                SUM(s.interceptions) as ints,
                SUM(s.completions) as completions,
                SUM(s.attempts) as pass_att,
                SUM(s.touchdowns) as total_td,
                SUM(s.turnovers) as total_to,
                SUM(s.receiving_yards_after_catch) as yac,
                SUM(s.receiving_air_yards) as air_yd,
                SUM(s.offense_snaps) as snaps
            FROM player_week_stats s
            WHERE s.player_id = ?
              AND s.season_type = 'regular'
            GROUP BY s.season
            ORDER BY s.season
        """, (player_id,)).fetchall()

        if not rows:
            return {"player": player_info, "seasons": [], "career": {}}

        seasons = []
        career_games = 0
        career_ppr = 0.0
        career_highs = {}

        for r in rows:
            g = r[1] or 1
            total_ppr = r[2] or 0.0
            ppg = round(total_ppr / g, 2) if g else 0
            rec = r[5] or 0
            tgt = r[6] or 0
            rec_yd = r[7] or 0
            rec_td = r[8] or 0
            car = r[9] or 0
            rush_yd = r[10] or 0
            rush_td = r[11] or 0
            pass_yd = r[12] or 0
            pass_td = r[13] or 0
            ints = r[14] or 0
            completions = r[15] or 0
            pass_att = r[16] or 0
            total_td = r[17] or 0
            total_to = r[18] or 0
            yac = r[19] or 0
            air_yd = r[20] or 0

            season_data = {
                "season": r[0],
                "games": g,
                "ppg": ppg,
                "total_ppr": round(total_ppr, 1),
                "rec": rec, "tgt": tgt,
                "rec_yd": rec_yd, "rec_td": rec_td,
                "car": car, "rush_yd": rush_yd, "rush_td": rush_td,
                "pass_yd": pass_yd, "pass_td": pass_td, "ints": ints,
                "completions": completions, "pass_att": pass_att,
                "total_td": total_td, "total_to": total_to,
                "yac": yac, "air_yd": air_yd,
            }

            # Per-game rates
            season_data["rec_g"] = round(rec / g, 1)
            season_data["tgt_g"] = round(tgt / g, 1)
            season_data["rec_yd_g"] = round(rec_yd / g, 1)
            season_data["car_g"] = round(car / g, 1)
            season_data["rush_yd_g"] = round(rush_yd / g, 1)
            season_data["pass_yd_g"] = round(pass_yd / g, 1)

            # Derived
            season_data["ypc"] = round(rush_yd / car, 1) if car > 0 else 0
            season_data["catch_rate"] = round(rec / tgt * 100, 1) if tgt > 0 else 0
            season_data["ypr"] = round(rec_yd / rec, 1) if rec > 0 else 0
            season_data["comp_pct"] = round(completions / pass_att * 100, 1) if pass_att > 0 else 0
            if pos == "QB" and pass_att > 0:
                season_data["td_rate"] = round(pass_td / pass_att * 100, 1)
            else:
                season_data["td_rate"] = round(total_td / max(1, car + tgt) * 100, 1) if (car + tgt) > 0 else 0

            seasons.append(season_data)

            career_games += g
            career_ppr += total_ppr

            # Track career highs
            for key in ("ppg", "total_ppr", "rec_yd", "rush_yd", "pass_yd", "total_td"):
                val = season_data[key]
                if key not in career_highs or val > career_highs[key]["value"]:
                    career_highs[key] = {"value": val, "season": r[0]}

        # Career totals
        career = {
            "games": career_games,
            "total_ppr": round(career_ppr, 1),
            "ppg": round(career_ppr / career_games, 2) if career_games else 0,
            "seasons_played": len(seasons),
            "first_season": seasons[0]["season"],
            "last_season": seasons[-1]["season"],
        }

        # Trajectory: compare last season PPG to first season PPG
        if len(seasons) >= 2:
            first_ppg = seasons[0]["ppg"]
            last_ppg = seasons[-1]["ppg"]
            if first_ppg > 0:
                pct_change = round((last_ppg - first_ppg) / first_ppg * 100, 1)
            else:
                pct_change = 0
            career["trajectory"] = "rising" if pct_change > 10 else ("falling" if pct_change < -10 else "stable")
            career["trajectory_pct"] = pct_change
        else:
            career["trajectory"] = "new"
            career["trajectory_pct"] = 0

        # Peak season
        peak = max(seasons, key=lambda s: s["ppg"])
        career["peak_season"] = peak["season"]
        career["peak_ppg"] = peak["ppg"]

        return {
            "player": player_info,
            "seasons": seasons,
            "career": career,
            "career_highs": career_highs,
        }



def fetch_career_stats(player_id):
    return _cached(f"fetch_career_stats:{player_id}", lambda: _fetch_career_stats_uncached(player_id=player_id))

def _fetch_player_percentiles_uncached(player_id, season=None):
    """Return percentile rankings for a player vs. their position group."""
    if not player_id:
        return {"error": "player_id is required"}

    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        # Get player info
        player = conn.execute(
            "SELECT player_id, full_name, position, team, age "
            "FROM players WHERE player_id = ?",
            (player_id,),
        ).fetchone()
        if not player:
            return {"error": "Player not found"}

        pos = player[2] or "WR"
        player_info = {
            "player_id": player[0],
            "full_name": player[1] or "Unknown",
            "position": pos,
            "team": player[3] or "FA",
            "age": player[4] or 0,
        }

        # Define metrics by position
        if pos == "QB":
            metrics = [
                ("ppg", "PPG"),
                ("pass_yd_g", "Pass Yd/G"),
                ("pass_td_g", "Pass TD/G"),
                ("comp_pct", "Comp%"),
                ("rush_yd_g", "Rush Yd/G"),
                ("td_g", "Total TD/G"),
                ("int_rate", "INT Rate (inv)"),
                ("fpts_total", "Total Points"),
            ]
        elif pos == "RB":
            metrics = [
                ("ppg", "PPG"),
                ("rush_yd_g", "Rush Yd/G"),
                ("ypc", "YPC"),
                ("rush_td_g", "Rush TD/G"),
                ("rec_g", "Rec/G"),
                ("tgt_g", "Tgt/G"),
                ("rec_yd_g", "Rec Yd/G"),
                ("fpts_total", "Total Points"),
            ]
        else:
            # WR / TE
            metrics = [
                ("ppg", "PPG"),
                ("rec_g", "Rec/G"),
                ("tgt_g", "Tgt/G"),
                ("rec_yd_g", "Rec Yd/G"),
                ("rec_td_g", "Rec TD/G"),
                ("ypr", "Yards/Rec"),
                ("catch_rate", "Catch%"),
                ("fpts_total", "Total Points"),
            ]

        # Get all players at same position for season
        rows = conn.execute("""
            SELECT
                s.player_id,
                ROUND(SUM(s.fantasy_points_ppr), 1) as total_ppr,
                COUNT(DISTINCT s.week) as games,
                SUM(s.receptions) as rec,
                SUM(s.targets) as tgt,
                SUM(s.receiving_yards) as rec_yd,
                SUM(s.receiving_tds) as rec_td,
                SUM(s.carries) as car,
                SUM(s.rushing_yards) as rush_yd,
                SUM(s.rushing_tds) as rush_td,
                SUM(s.passing_yards) as pass_yd,
                SUM(s.passing_tds) as pass_td,
                SUM(s.interceptions) as ints,
                SUM(s.completions) as completions,
                SUM(s.attempts) as pass_att,
                SUM(s.touchdowns) as total_td
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ? AND p.position = ?
              AND s.season_type = 'regular'
            GROUP BY s.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
        """, (season, pos)).fetchall()

        if not rows:
            return {"player": player_info, "season": season, "percentiles": [],
                    "available_seasons": available_seasons}

        # Build stat arrays for all players
        all_stats = {}
        target_stats = None

        for r in rows:
            pid = r[0]
            g = r[2] or 1
            total_ppr = r[1] or 0
            rec = r[3] or 0
            tgt = r[4] or 0
            rec_yd = r[5] or 0
            rec_td = r[6] or 0
            car = r[7] or 0
            rush_yd = r[8] or 0
            rush_td = r[9] or 0
            pass_yd = r[10] or 0
            pass_td = r[11] or 0
            ints = r[12] or 0
            completions = r[13] or 0
            pass_att = r[14] or 0
            total_td = r[15] or 0

            stats = {
                "ppg": total_ppr / g,
                "rec_g": rec / g,
                "tgt_g": tgt / g,
                "rec_yd_g": rec_yd / g,
                "rec_td_g": rec_td / g,
                "rush_yd_g": rush_yd / g,
                "rush_td_g": rush_td / g,
                "ypc": rush_yd / car if car > 0 else 0,
                "ypr": rec_yd / rec if rec > 0 else 0,
                "catch_rate": rec / tgt * 100 if tgt > 0 else 0,
                "pass_yd_g": pass_yd / g,
                "pass_td_g": pass_td / g,
                "comp_pct": completions / pass_att * 100 if pass_att > 0 else 0,
                "td_g": total_td / g,
                "int_rate": 100 - (ints / pass_att * 100 if pass_att > 0 else 0),  # Inverted
                "fpts_total": total_ppr,
            }
            all_stats[pid] = stats
            if pid == player_id:
                target_stats = stats

        if not target_stats:
            return {"player": player_info, "season": season, "percentiles": [],
                    "available_seasons": available_seasons,
                    "error": "Player has no stats for this season"}

        # Compute percentiles
        n_players = len(all_stats)
        percentiles = []

        for metric_key, metric_label in metrics:
            # Get all values for this metric
            values = sorted(all_stats[pid][metric_key] for pid in all_stats)
            player_val = target_stats[metric_key]

            # Percentile = % of players below this value
            below = sum(1 for v in values if v < player_val)
            pctile = round(below / n_players * 100)

            percentiles.append({
                "key": metric_key,
                "label": metric_label,
                "value": round(player_val, 2),
                "percentile": pctile,
            })

        return {
            "player": player_info,
            "season": season,
            "available_seasons": available_seasons,
            "position_pool": n_players,
            "percentiles": percentiles,
        }



def fetch_player_percentiles(player_id, season=None):
    return _cached(f"fetch_player_percentiles:{player_id}:{season}", lambda: _fetch_player_percentiles_uncached(player_id=player_id, season=season))

def _fetch_player_strengths_uncached(player_id, season=None, top_n=4):
    """Return a player's top strengths and weaknesses from percentile data."""
    if not player_id:
        return {"error": "player_id is required"}

    # Leverage existing percentile computation
    pct_data = fetch_player_percentiles(player_id, season)
    if "error" in pct_data:
        return pct_data

    percentiles = pct_data.get("percentiles", [])
    if not percentiles:
        return {
            "player": pct_data.get("player", {}),
            "season": pct_data.get("season"),
            "available_seasons": pct_data.get("available_seasons", []),
            "strengths": [],
            "weaknesses": [],
            "all_percentiles": [],
        }

    # Sort by percentile descending for strengths
    sorted_pcts = sorted(percentiles, key=lambda x: x["percentile"], reverse=True)

    # Strengths = highest percentiles, weaknesses = lowest
    strengths = sorted_pcts[:top_n]
    weaknesses = sorted_pcts[-top_n:][::-1]  # reverse so worst is first

    # Assign grades to each (canonical 8-tier scale)
    def _grade(p):
        if p >= 95: return "A+"
        if p >= 85: return "A"
        if p >= 75: return "B+"
        if p >= 65: return "B"
        if p >= 50: return "C+"
        if p >= 35: return "C"
        if p >= 25: return "D"
        return "F"

    for item in strengths + weaknesses:
        item["grade"] = _grade(item["percentile"])

    # Average percentile
    avg_pct = round(sum(p["percentile"] for p in percentiles) / (len(percentiles) or 1))

    return {
        "player": pct_data.get("player", {}),
        "season": pct_data.get("season"),
        "available_seasons": pct_data.get("available_seasons", []),
        "position_pool": pct_data.get("position_pool", 0),
        "avg_percentile": avg_pct,
        "overall_grade": _grade(avg_pct),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "all_percentiles": percentiles,
    }



def fetch_player_strengths(player_id, season=None, top_n=4):
    return _cached(f"fetch_player_strengths:{player_id}:{season}:{top_n}", lambda: _fetch_player_strengths_uncached(player_id=player_id, season=season, top_n=top_n))

def _fetch_points_breakdown_uncached(player_id, season=None):
    """Return breakdown of fantasy point sources for a player."""
    if not player_id:
        return {"error": "player_id is required"}

    with get_db() as conn:
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        player = conn.execute(
            "SELECT player_id, full_name, position, team, age FROM players WHERE player_id = ?",
            (player_id,),
        ).fetchone()
        if not player:
            return {"error": "Player not found"}

        player_info = {
            "player_id": player[0],
            "full_name": player[1] or "Unknown",
            "position": player[2] or "WR",
            "team": player[3] or "FA",
            "age": player[4] or 0,
        }

        stats = conn.execute("""
            SELECT
                SUM(passing_yards) as pass_yd,
                SUM(passing_tds) as pass_td,
                SUM(interceptions) as ints,
                SUM(rushing_yards) as rush_yd,
                SUM(rushing_tds) as rush_td,
                SUM(receiving_yards) as rec_yd,
                SUM(receiving_tds) as rec_td,
                SUM(receptions) as rec,
                ROUND(SUM(fantasy_points_ppr), 1) as total_ppr,
                COUNT(DISTINCT week) as games,
                SUM(turnovers) as turnovers
            FROM player_week_stats
            WHERE player_id = ? AND season = ?
              AND season_type = 'regular'
        """, (player_id, season)).fetchone()

        if not stats or not stats[8]:
            return {
                "player": player_info,
                "season": season,
                "available_seasons": available_seasons,
                "breakdown": [],
                "total_points": 0,
                "games": 0,
            }

        pass_yd = stats[0] or 0
        pass_td = stats[1] or 0
        ints = stats[2] or 0
        rush_yd = stats[3] or 0
        rush_td = stats[4] or 0
        rec_yd = stats[5] or 0
        rec_td = stats[6] or 0
        rec = stats[7] or 0
        total_ppr = stats[8] or 0
        games = stats[9] or 1
        turnovers = stats[10] or 0

        # PPR scoring components
        components = [
            {"label": "Passing Yards", "points": round(pass_yd * 0.04, 1), "raw": pass_yd, "color": "#5b7fff"},
            {"label": "Passing TDs", "points": round(pass_td * 4, 1), "raw": pass_td, "color": "#3a5abf"},
            {"label": "Rushing Yards", "points": round(rush_yd * 0.1, 1), "raw": rush_yd, "color": "#2ec4b6"},
            {"label": "Rushing TDs", "points": round(rush_td * 6, 1), "raw": rush_td, "color": "#1a9a8d"},
            {"label": "Receiving Yards", "points": round(rec_yd * 0.1, 1), "raw": rec_yd, "color": "#d97757"},
            {"label": "Receiving TDs", "points": round(rec_td * 6, 1), "raw": rec_td, "color": "#b85a3a"},
            {"label": "Receptions (PPR)", "points": round(rec * 1.0, 1), "raw": rec, "color": "#8b5cf6"},
        ]

        # Only include non-zero components
        breakdown = [c for c in components if c["points"] > 0]

        # Add percentage
        positive_total = sum(c["points"] for c in breakdown)
        for c in breakdown:
            c["pct"] = round(c["points"] / positive_total * 100, 1) if positive_total > 0 else 0

        # Sort by points descending
        breakdown.sort(key=lambda x: x["points"], reverse=True)

        return {
            "player": player_info,
            "season": season,
            "available_seasons": available_seasons,
            "breakdown": breakdown,
            "total_points": round(total_ppr, 1),
            "ppg": round(total_ppr / games, 1),
            "games": games,
        }



def fetch_points_breakdown(player_id, season=None):
    return _cached(f"fetch_points_breakdown:{player_id}:{season}", lambda: _fetch_points_breakdown_uncached(player_id=player_id, season=season))

def _fetch_game_log_uncached(player_id, season=None):
    """Return week-by-week box score stats for a player in a given season."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Get player info
        cursor.execute("SELECT player_id, full_name, position, team FROM players WHERE player_id = ?", (player_id,))
        player = cursor.fetchone()
        if not player:
            return {"error": "Player not found"}

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats WHERE player_id = ?", (player_id,))
            row = cursor.fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        # Available seasons for this player
        cursor.execute("SELECT DISTINCT season FROM player_week_stats WHERE player_id = ? ORDER BY season DESC", (player_id,))
        available_seasons = [r[0] for r in cursor.fetchall()]

        # Get weekly stats
        cursor.execute("""
            SELECT week, fantasy_points_ppr,
                   COALESCE(passing_yards, 0), COALESCE(passing_tds, 0), COALESCE(interceptions, 0),
                   COALESCE(attempts, 0), COALESCE(completions, 0),
                   COALESCE(rushing_yards, 0), COALESCE(rushing_tds, 0), COALESCE(carries, 0),
                   COALESCE(receiving_yards, 0), COALESCE(receiving_tds, 0), COALESCE(receptions, 0),
                   COALESCE(targets, 0)
            FROM player_week_stats
            WHERE player_id = ? AND season = ?
              AND season_type = 'regular'
            ORDER BY week ASC
        """, (player_id, season))
        rows = cursor.fetchall()

        weeks = []
        totals = {"fpts": 0, "pass_yd": 0, "pass_td": 0, "ints": 0, "pass_att": 0, "cmp": 0,
                  "rush_yd": 0, "rush_td": 0, "car": 0, "rec_yd": 0, "rec_td": 0, "rec": 0, "tgt": 0}

        for r in rows:
            fpts = round(r[1] or 0, 1)
            week_data = {
                "week": r[0],
                "fpts": fpts,
                "pass_yd": r[2], "pass_td": r[3], "ints": r[4],
                "pass_att": r[5], "cmp": r[6],
                "rush_yd": r[7], "rush_td": r[8], "car": r[9],
                "rec_yd": r[10], "rec_td": r[11], "rec": r[12], "tgt": r[13],
            }
            weeks.append(week_data)

            totals["fpts"] += fpts
            totals["pass_yd"] += r[2]
            totals["pass_td"] += r[3]
            totals["ints"] += r[4]
            totals["pass_att"] += r[5]
            totals["cmp"] += r[6]
            totals["rush_yd"] += r[7]
            totals["rush_td"] += r[8]
            totals["car"] += r[9]
            totals["rec_yd"] += r[10]
            totals["rec_td"] += r[11]
            totals["rec"] += r[12]
            totals["tgt"] += r[13]

        totals["fpts"] = round(totals["fpts"], 1)
        games = len(weeks)
        ppg = round(totals["fpts"] / games, 1) if games else 0

        return {
            "player_id": player[0],
            "name": player[1] or "Unknown",
            "position": player[2] or "RB",
            "team": player[3] or "FA",
            "season": season,
            "available_seasons": available_seasons,
            "games": games,
            "ppg": ppg,
            "weeks": weeks,
            "totals": totals,
        }



def fetch_game_log(player_id, season=None):
    return _cached(f"fetch_game_log:{player_id}:{season}", lambda: _fetch_game_log_uncached(player_id=player_id, season=season))

def _fetch_compare_table_uncached(player_ids, season=None):
    """Return season stats for multiple players for side-by-side comparison."""
    if not player_ids:
        return {"error": "No player IDs provided"}

    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            row = cursor.fetchone()
            season = (row[0] if row else None) or _current_nfl_season()

        placeholders = ",".join("?" for _ in player_ids)
        cursor.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   COUNT(DISTINCT s.week) as games,
                   ROUND(COALESCE(SUM(s.fantasy_points_ppr), 0), 1) as total_fpts,
                   COALESCE(SUM(s.passing_yards), 0) as pass_yd,
                   COALESCE(SUM(s.passing_tds), 0) as pass_td,
                   COALESCE(SUM(s.interceptions), 0) as ints,
                   COALESCE(SUM(s.completions), 0) as cmp,
                   COALESCE(SUM(s.attempts), 0) as pass_att,
                   COALESCE(SUM(s.rushing_yards), 0) as rush_yd,
                   COALESCE(SUM(s.rushing_tds), 0) as rush_td,
                   COALESCE(SUM(s.carries), 0) as car,
                   COALESCE(SUM(s.receiving_yards), 0) as rec_yd,
                   COALESCE(SUM(s.receiving_tds), 0) as rec_td,
                   COALESCE(SUM(s.receptions), 0) as rec,
                   COALESCE(SUM(s.targets), 0) as tgt
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.player_id IN ({placeholders})
              AND p.fantasy_relevant = 1
              AND s.season_type = 'regular'
            GROUP BY p.player_id
        """, [season] + list(player_ids))
        rows = cursor.fetchall()

        # Available seasons
        cursor.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC")
        available_seasons = [r[0] for r in cursor.fetchall()]

        players = []
        for r in rows:
            games = r[4] or 1
            total_fpts = r[5] or 0
            players.append({
                "player_id": r[0],
                "name": r[1] or "Unknown",
                "position": r[2] or "RB",
                "team": r[3] or "FA",
                "games": r[4],
                "total_fpts": round(total_fpts, 1),
                "ppg": round(total_fpts / games, 1),
                "pass_yd": r[6], "pass_td": r[7], "ints": r[8],
                "cmp": r[9], "pass_att": r[10],
                "rush_yd": r[11], "rush_td": r[12], "car": r[13],
                "rec_yd": r[14], "rec_td": r[15], "rec": r[16], "tgt": r[17],
                "yd_per_car": round(r[11] / r[13], 1) if r[13] else 0,
                "yd_per_rec": round(r[14] / r[16], 1) if r[16] else 0,
                "catch_rate": round((r[16] / r[17]) * 100, 1) if r[17] else 0,
            })

        return {
            "season": season,
            "available_seasons": available_seasons,
            "players": players,
        }



def fetch_compare_table(player_ids, season=None):
    _key = "fetch_compare_table:" + ":".join(sorted(player_ids)) + f":{season}"
    return _cached(_key, lambda: _fetch_compare_table_uncached(player_ids=player_ids, season=season))

def _fetch_player_boom_bust_uncached(player_id, season=0):
    """Analyze a player's weekly score distribution: boom/bust rates, consistency, percentiles."""
    with get_db() as conn:

        # Get player info
        player = conn.execute(
            "SELECT player_id, full_name, position, team, age, headshot_url FROM players WHERE player_id = ?",
            (player_id,)
        ).fetchone()

        if not player:
            return {"error": "Player not found"}

        player = dict(player)
        pos = (player.get("position") or "").upper()

        # Determine season
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        # Get weekly fantasy scores for the player
        weeks = conn.execute("""
            SELECT week, fantasy_points_ppr
            FROM player_week_stats
            WHERE player_id = ? AND season = ?
              AND season_type = 'regular'
            ORDER BY week
        """, (player_id, season)).fetchall()

        if len(weeks) < 4:
            return {"error": "Not enough games (need 4+)", "player": player}

        weekly_scores = [{"week": w[0], "score": round(w[1] or 0, 2)} for w in weeks]
        scores = [w[1] or 0 for w in weeks]

        # Get position average PPG for boom/bust thresholds
        pos_avg_row = conn.execute("""
            SELECT AVG(ppg) FROM (
                SELECT SUM(s.fantasy_points_ppr) / COUNT(*) as ppg
                FROM player_week_stats s
                JOIN players p ON s.player_id = p.player_id
                WHERE p.position = ? AND s.season = ?
                  AND s.season_type = 'regular'
                GROUP BY s.player_id
                HAVING COUNT(*) >= 4
            )
        """, (pos, season)).fetchone()
        pos_avg_ppg = round(pos_avg_row[0], 2) if pos_avg_row and pos_avg_row[0] else 10.0

        # Position rank by consistency among same-position players
        all_pos_players = conn.execute("""
            SELECT s.player_id,
                   ROUND(AVG(s.fantasy_points_ppr), 1) as avg_ppg,
                   GROUP_CONCAT(s.fantasy_points_ppr) as scores_csv
            FROM player_week_stats s
            JOIN players p ON s.player_id = p.player_id
            WHERE p.position = ? AND s.season = ?
              AND s.season_type = 'regular'
            GROUP BY s.player_id
            HAVING COUNT(*) >= 4
        """, (pos, season)).fetchall()


        # Boom/bust thresholds: 1.5x and 0.5x position average
        boom_threshold = round(pos_avg_ppg * 1.5, 2)
        bust_threshold = round(pos_avg_ppg * 0.5, 2)

        # Calculate rates
        games = len(scores)
        boom_count = sum(1 for s in scores if s >= boom_threshold)
        bust_count = sum(1 for s in scores if s <= bust_threshold)
        boom_rate = round((boom_count / games) * 100, 1)
        bust_rate = round((bust_count / games) * 100, 1)

        # Stats
        scores_sorted = sorted(scores)
        mean_ppg = round(statistics.mean(scores), 2)
        median_ppg = round(statistics.median(scores), 2)
        stdev = round(statistics.stdev(scores), 2) if len(scores) > 1 else 0

        # Percentiles (floor=10th, ceiling=90th)
        def percentile(data, pct):
            idx = (pct / 100) * (len(data) - 1)
            lower = int(idx)
            upper = min(lower + 1, len(data) - 1)
            frac = idx - lower
            return round(data[lower] + frac * (data[upper] - data[lower]), 2)

        floor_ppg = percentile(scores_sorted, 10)
        ceiling_ppg = percentile(scores_sorted, 90)

        # Consistency score: inverse coefficient of variation, scaled 0-100
        # CV = stdev / mean. Lower CV = more consistent. Score = max(0, 100 - CV*100)
        if mean_ppg > 0:
            cv = stdev / mean_ppg
            consistency_score = round(max(0, min(100, 100 - cv * 100)), 1)
        else:
            consistency_score = 0

        # Grade based on consistency score
        grade_thresholds = [
            (90, "A+"), (85, "A"), (80, "A-"),
            (75, "B+"), (70, "B"), (65, "B-"),
            (60, "C+"), (55, "C"), (50, "C-"),
            (45, "D+"), (40, "D"), (35, "D-"),
            (0, "F"),
        ]
        grade = "F"
        for threshold, g in grade_thresholds:
            if consistency_score >= threshold:
                grade = g
                break

        # Position rank by consistency
        consistency_ranks = []
        for row in all_pos_players:
            pid = row[0]
            csv_str = row[2]
            if not csv_str:
                continue
            try:
                p_scores = [float(x) for x in csv_str.split(",")]
            except (ValueError, TypeError):
                continue
            if len(p_scores) < 2:
                continue
            p_mean = statistics.mean(p_scores)
            p_stdev = statistics.stdev(p_scores)
            p_cv = p_stdev / p_mean if p_mean > 0 else 999
            p_cons = max(0, min(100, 100 - p_cv * 100))
            consistency_ranks.append((pid, p_cons))

        consistency_ranks.sort(key=lambda x: -x[1])
        position_rank = 1
        total_ranked = len(consistency_ranks)
        for i, (pid, _) in enumerate(consistency_ranks):
            if pid == player_id:
                position_rank = i + 1
                break

        return {
            "player": {
                "player_id": player["player_id"],
                "full_name": player["full_name"],
                "position": pos,
                "team": player.get("team") or "FA",
                "age": player.get("age"),
                "headshot_url": player.get("headshot_url"),
            },
            "season": season,
            "games_played": games,
            "weekly_scores": weekly_scores,
            "mean_ppg": mean_ppg,
            "median_ppg": median_ppg,
            "floor_ppg": floor_ppg,
            "ceiling_ppg": ceiling_ppg,
            "stdev": stdev,
            "boom_rate": boom_rate,
            "bust_rate": bust_rate,
            "boom_threshold": boom_threshold,
            "bust_threshold": bust_threshold,
            "position_avg_ppg": pos_avg_ppg,
            "consistency_score": consistency_score,
            "grade": grade,
            "position_rank": position_rank,
            "position_total": total_ranked,
        }



def fetch_player_boom_bust(player_id, season=0):
    return _cached(f"fetch_player_boom_bust:{player_id}:{season}", lambda: _fetch_player_boom_bust_uncached(player_id=player_id, season=season))

def _fetch_player_comps_uncached(player_id, limit=5, season=0):
    """Find the most statistically similar NFL players to a given player."""
    with get_db() as conn:

        # Get target player info
        player = conn.execute(
            "SELECT player_id, full_name, position, team, age, headshot_url FROM players WHERE player_id = ?",
            (player_id,)
        ).fetchone()

        if not player:
            return {"error": "Player not found", "comps": []}

        player = dict(player)
        pos = (player.get("position") or "").upper()
        if pos not in _COMP_STATS:
            return {"error": f"Comps not available for position {pos}", "comps": []}

        stat_keys = _COMP_STATS[pos]

        # Determine season filter
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        # Get target player's season stats
        target_row = conn.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team, p.age, p.headshot_url,
                   COUNT(*) as games,
                   {_STAT_SUM_COLS}
            FROM player_week_stats s
            JOIN players p ON s.player_id = p.player_id
            WHERE s.player_id = ? AND s.season = ?
              AND s.season_type = 'regular'
            GROUP BY s.player_id
            HAVING games >= 4
        """, (player_id, season)).fetchone()

        if not target_row:
            return {"error": "Not enough games in season", "comps": [], "player": player}

        target = dict(target_row)
        target_vec = _build_stat_vector(target, stat_keys)

        # Get all same-position players (excluding target) with enough games
        all_rows = conn.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team, p.age, p.headshot_url,
                   COUNT(*) as games,
                   {_STAT_SUM_COLS}
            FROM player_week_stats s
            JOIN players p ON s.player_id = p.player_id
            WHERE p.position = ? AND s.player_id != ? AND s.season = ?
              AND s.season_type = 'regular'
            GROUP BY s.player_id
            HAVING games >= 4
        """, (pos, player_id, season)).fetchall()

        # Compute similarity for each candidate
        candidates = []
        for row in all_rows:
            r = dict(row)
            vec = _build_stat_vector(r, stat_keys)
            sim = _cosine_similarity(target_vec, vec)
            # Find top matching stats (smallest absolute difference when normalized)
            matching = []
            for i, key in enumerate(stat_keys):
                tv = target_vec[i]
                cv = vec[i]
                max_val = max(abs(tv), abs(cv), 0.001)
                diff_pct = abs(tv - cv) / max_val
                matching.append((key, diff_pct, tv, cv))
            matching.sort(key=lambda x: x[1])
            top_matches = [{"stat": m[0], "label": _COMP_STAT_LABELS.get(m[0], m[0]),
                            "target_val": round(m[2], 1), "comp_val": round(m[3], 1)}
                           for m in matching[:3]]

            # All stat values for comparison table + radar
            all_stats = {stat_keys[i]: round(vec[i], 1) for i in range(len(stat_keys))}

            candidates.append({
                "player_id": r["player_id"],
                "full_name": r["full_name"],
                "position": r["position"],
                "team": r["team"],
                "age": r.get("age"),
                "headshot_url": r.get("headshot_url"),
                "similarity": sim,
                "matching_stats": top_matches,
                "all_stats": all_stats,
                "games": r["games"],
                "ppg": round((r.get("fantasy_points_ppr") or 0) / (r["games"] or 1), 1),
            })

        # Sort by similarity descending
        candidates.sort(key=lambda x: x["similarity"], reverse=True)
        top = candidates[:limit]

        # Build target stat values for comparison
        target_stats = {}
        for key in stat_keys:
            idx = stat_keys.index(key)
            target_stats[key] = {
                "label": _COMP_STAT_LABELS.get(key, key),
                "value": round(target_vec[idx], 1)
            }

        return {
            "player": {
                "player_id": target["player_id"],
                "full_name": target["full_name"],
                "position": target["position"],
                "team": target["team"],
                "age": target.get("age"),
                "headshot_url": target.get("headshot_url"),
                "games": target["games"],
                "ppg": round((target.get("fantasy_points_ppr") or 0) / (target["games"] or 1), 1),
            },
            "comps": top,
            "stat_keys": stat_keys,
            "stat_labels": {k: _COMP_STAT_LABELS.get(k, k) for k in stat_keys},
            "target_stats": target_stats,
            "season": season,
        }


def fetch_player_comps(player_id, limit=5, season=0):
    return _cached(f"fetch_player_comps:{player_id}:{limit}:{season}", lambda: _fetch_player_comps_uncached(player_id=player_id, limit=limit, season=season))
