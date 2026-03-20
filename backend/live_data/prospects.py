"""
Prospect functions — combine data, athletic profiles, tiers, comparisons.
"""

import logging
import math

from ..db import get_db

logger = logging.getLogger("razzle.live_data.prospects")
from .core import (
    _cached, _CACHE_TTL_STABLE,
    _current_draft_year,
    TEAM_ABBREV,
    _name_variants, _enrich_prospects_with_college, _enrich_college_derived,
)

def _fetch_prospects_uncached(
    search="",
    position="",
    positions="",
    school="",
    sort_key="draft_pick",
    sort_dir="asc",
    limit=200,
    offset=0,
    draft_year=0,
):
    """Return prospect data from combine + draft picks, joined."""
    import datetime as _dt
    with get_db() as conn:

        _cur_year = _dt.datetime.now().year
        if not draft_year or draft_year < 2000 or draft_year > _cur_year + 2:
            row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
            draft_year = row[0] if row and row[0] else _current_draft_year()

        # Position list
        pos_list = []
        if positions:
            pos_list = [p.strip().upper() for p in positions.split(",") if p.strip()]
        elif position:
            pos_list = [position.strip().upper()]

        where = ["c.draft_year = ?"]
        params = [draft_year]

        if search:
            search_clean = search.lower().replace(" ", "").replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            where.append("LOWER(REPLACE(c.player_name, ' ', '')) LIKE ? ESCAPE '\\'")
            params.append(f"%{search_clean}%")

        if pos_list:
            placeholders = ",".join("?" * len(pos_list))
            where.append(f"c.position IN ({placeholders})")
            params.extend(pos_list)

        if school:
            school_clean = school.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            where.append("(c.school LIKE ? ESCAPE '\\' OR d.college LIKE ? ESCAPE '\\')")
            params.extend([f"%{school_clean}%", f"%{school_clean}%"])

        where_clause = " AND ".join(where)

        # Safe sort columns
        safe_sorts = {
            "player_name": "c.player_name",
            "position": "c.position",
            "school": "c.school",
            "draft_pick": "c.draft_pick",
            "draft_round": "c.draft_round",
            "draft_team": "c.draft_team",
            "height_inches": "c.height_inches",
            "weight": "c.weight",
            "forty": "c.forty",
            "bench": "c.bench",
            "vertical": "c.vertical",
            "broad_jump": "c.broad_jump",
            "cone": "c.cone",
            "shuttle": "c.shuttle",
            "career_av": "d.career_av",
            "games": "d.games",
        }
        # College sort keys use Python re-sort (derived from batch enrichment)
        college_sort_keys = {
            "college_games", "college_pass_yards", "college_pass_tds",
            "college_rush_yards", "college_rush_tds", "college_carries",
            "college_rec_yards", "college_rec_tds", "college_receptions",
            "college_targets", "college_total_tds", "college_total_yards",
            "college_ypc", "college_cmp_pct", "college_ypr", "college_ypg",
        }
        python_resort = sort_key in college_sort_keys
        order_expr = safe_sorts.get(sort_key, "c.draft_pick")
        if sort_dir.lower() not in ("asc", "desc"):
            sort_dir = "asc"

        # NULLS LAST for numeric sorts
        nulls_clause = ""
        if sort_key in ("forty", "bench", "vertical", "broad_jump", "cone", "shuttle",
                         "draft_pick", "draft_round", "height_inches", "weight",
                         "career_av", "games"):
            if sort_dir.lower() == "asc":
                nulls_clause = f"CASE WHEN {order_expr} IS NULL THEN 1 ELSE 0 END,"
            else:
                nulls_clause = f"CASE WHEN {order_expr} IS NULL THEN 1 ELSE 0 END,"

        select_cols = """
                c.player_name, c.position, c.school, c.draft_year,
                c.draft_team, c.draft_round, c.draft_pick,
                c.height_inches, c.weight,
                c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle,
                c.pfr_id, c.cfb_id,
                d.career_av, d.draft_av, d.games as nfl_games,
                d.allpro, d.probowls, d.seasons_started,
                d.pass_yards as nfl_pass_yards, d.pass_tds as nfl_pass_tds,
                d.rush_yards as nfl_rush_yards, d.rush_tds as nfl_rush_tds,
                d.rec_yards as nfl_rec_yards, d.rec_tds as nfl_rec_tds,
                d.receptions as nfl_receptions
        """
        from_clause = """
            FROM combine_data c
            LEFT JOIN draft_picks d
                ON c.draft_year = d.season
                AND LOWER(REPLACE(c.player_name, ' ', '')) = LOWER(REPLACE(d.player_name, ' ', ''))
                AND c.position = d.position
            WHERE {where_clause}
        """.format(where_clause=where_clause)

        # Count
        total = conn.execute(f"SELECT COUNT(*) {from_clause}", params).fetchone()[0]

        if python_resort:
            # Fetch all for Python re-sort after college enrichment
            query = f"SELECT {select_cols} {from_clause} ORDER BY c.player_name ASC"
            rows = conn.execute(query, params).fetchall()
        else:
            query = f"SELECT {select_cols} {from_clause} ORDER BY {nulls_clause} {order_expr} {sort_dir} LIMIT ? OFFSET ?"
            rows = conn.execute(query, params + [limit, offset]).fetchall()

        items = []
        for r in rows:
            item = dict(r)
            # Compute height display string
            ht = item.get("height_inches")
            if ht:
                item["height_display"] = f"{ht // 12}'{ht % 12}\""
            else:
                item["height_display"] = None
            # Abbreviate team name
            dt = (item.get("draft_team") or "").upper()
            item["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)
            items.append(item)

        # Enrich with college production stats (batch cross-reference)
        _enrich_prospects_with_college(conn, items)

        # Python re-sort for college-derived columns
        if python_resort:
            reverse = sort_dir.lower() == "desc"
            items.sort(key=lambda x: (x.get(sort_key) is None, -(x.get(sort_key) or 0) if reverse else (x.get(sort_key) or 0)))
            items = items[offset:offset + limit]

        return {"count": total, "draft_year": draft_year, "items": items}

def fetch_prospects(
    search="",
    position="",
    positions="",
    school="",
    sort_key="draft_pick",
    sort_dir="asc",
    limit=200,
    offset=0,
    draft_year=0,
):
    return _cached(f"fetch_prospects:{search}:{position}:{positions}:{school}:{sort_key}:{sort_dir}:{limit}:{offset}:{draft_year}", lambda: _fetch_prospects_uncached(search=search, position=position, positions=positions, school=school, sort_key=sort_key, sort_dir=sort_dir, limit=limit, offset=offset, draft_year=draft_year))

def _fetch_prospect_years_uncached():
    """Return available draft years for the prospect screener."""
    with get_db() as conn:
        years = [r[0] for r in conn.execute(
            "SELECT DISTINCT draft_year FROM combine_data ORDER BY draft_year DESC"
        ).fetchall()]

        schools = [r[0] for r in conn.execute(
            "SELECT DISTINCT school FROM combine_data WHERE school IS NOT NULL AND school != '' ORDER BY school"
        ).fetchall()]

        positions = [r[0] for r in conn.execute(
            "SELECT DISTINCT position FROM combine_data ORDER BY position"
        ).fetchall()]

        return {"years": years, "schools": schools, "positions": positions}

def fetch_prospect_years():
    return _cached("fetch_prospect_years", lambda: _fetch_prospect_years_uncached())

def _fetch_prospect_profile_uncached(name, position="", draft_year=0):
    """Return a rich prospect profile with combine data and position-group percentiles."""
    with get_db() as conn:

        if not draft_year:
            row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
            draft_year = row[0] if row and row[0] else _current_draft_year()

        search_name = name.lower().replace(" ", "")

        # Build WHERE clause
        where = "LOWER(REPLACE(c.player_name, ' ', '')) = ?"
        params = [search_name]
        if position:
            where += " AND c.position = ?"
            params.append(position.upper())

        # Get this prospect's data
        prospect_row = conn.execute(f"""
            SELECT
                c.player_name, c.position, c.school, c.draft_year,
                c.draft_team, c.draft_round, c.draft_pick,
                c.height_inches, c.weight,
                c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle,
                c.pfr_id, c.cfb_id,
                d.career_av, d.draft_av, d.games as nfl_games,
                d.allpro, d.probowls, d.seasons_started,
                d.pass_yards as nfl_pass_yards, d.pass_tds as nfl_pass_tds,
                d.rush_yards as nfl_rush_yards, d.rush_tds as nfl_rush_tds,
                d.rec_yards as nfl_rec_yards, d.rec_tds as nfl_rec_tds,
                d.receptions as nfl_receptions
            FROM combine_data c
            LEFT JOIN draft_picks d
                ON c.draft_year = d.season
                AND LOWER(REPLACE(c.player_name, ' ', '')) = LOWER(REPLACE(d.player_name, ' ', ''))
                AND c.position = d.position
            WHERE {where}
            ORDER BY c.draft_year DESC
            LIMIT 1
        """, params).fetchone()

        if not prospect_row:
            return {"prospect": None, "percentiles": {}}

        prospect = dict(prospect_row)

        # Format height display
        ht = prospect.get("height_inches")
        if ht:
            prospect["height_display"] = f"{ht // 12}'{ht % 12}\""
        else:
            prospect["height_display"] = None

        # Abbreviate team name
        dt = (prospect.get("draft_team") or "").upper()
        prospect["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

        # Compute position-group percentiles for combine metrics
        pos = prospect["position"]
        combine_metrics = {
            "forty": "lower",       # lower is better
            "bench": "higher",
            "vertical": "higher",
            "broad_jump": "higher",
            "cone": "lower",        # lower is better
            "shuttle": "lower",     # lower is better
            "height_inches": "higher",
            "weight": "higher",
        }

        # Batch percentile computation: single query for all 8 metrics
        metric_cols = ", ".join(combine_metrics.keys())
        all_rows = conn.execute(
            f"SELECT {metric_cols} FROM combine_data WHERE position = ?", (pos,)
        ).fetchall()
        metric_names = list(combine_metrics.keys())

        percentiles = {}
        for i, metric in enumerate(metric_names):
            val = prospect.get(metric)
            if val is None:
                percentiles[metric] = None
                continue

            all_vals = [r[i] for r in all_rows if r[i] is not None]
            if not all_vals:
                percentiles[metric] = None
                continue

            direction = combine_metrics[metric]
            if direction == "lower":
                # For time-based metrics, lower is better → percentile = % of players slower than you
                pct = sum(1 for v in all_vals if v > val) / len(all_vals) * 100
            else:
                # For distance/reps metrics, higher is better → percentile = % of players below you
                pct = sum(1 for v in all_vals if v < val) / len(all_vals) * 100

            percentiles[metric] = round(pct, 1)

        # ── College production cross-reference ──────────────────────────
        college = _fetch_college_for_prospect(conn, prospect)

        return {"prospect": prospect, "percentiles": percentiles, "college": college}



def fetch_prospect_profile(name, position="", draft_year=0):
    return _cached(f"fetch_prospect_profile:{name}:{position}:{draft_year}", lambda: _fetch_prospect_profile_uncached(name=name, position=position, draft_year=draft_year))

def _fetch_college_for_prospect(conn, prospect):
    """Cross-reference a prospect with cfb_player_season_stats via name matching."""
    name = prospect.get("player_name", "")
    school = prospect.get("school", "")
    if not name:
        return None

    variants = _name_variants(name)

    # Try each variant until we find a match
    rows = []
    for variant in variants:
        rows = conn.execute("""
            SELECT player_id, player_name, position, team, conference, season,
                   games, completions, pass_attempts, pass_yards, pass_tds,
                   ints_thrown, sacks_taken, carries, rush_yards, rush_tds,
                   receptions, targets, rec_yards, rec_tds,
                   fumbles, total_tds, total_yards
            FROM cfb_player_season_stats
            WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(player_name, ' ', ''), '.', ''), '''', ''), '-', '')) = ?
            ORDER BY season ASC
        """, (variant,)).fetchall()
        if rows:
            break

    if not rows:
        return None

    season_items = [dict(r) for r in rows]

    # If multiple players match the name, narrow by school if possible
    if school and len(set(r["player_id"] for r in season_items)) > 1:
        school_clean = school.lower().replace(" ", "")
        filtered = [r for r in season_items if r.get("team", "").lower().replace(" ", "") == school_clean]
        if filtered:
            season_items = filtered
        else:
            # Try partial match (e.g., "Ohio State" in "Ohio St")
            filtered = [r for r in season_items if school_clean[:6] in r.get("team", "").lower().replace(" ", "")]
            if filtered:
                season_items = filtered

    # Keep only one player_id (the best match)
    pid = season_items[0]["player_id"]
    season_items = [r for r in season_items if r["player_id"] == pid]

    # Enrich with derived stats
    season_items = _enrich_college_derived(season_items)

    # Career totals
    career = {
        "games": sum(s.get("games") or 0 for s in season_items),
        "completions": sum(s.get("completions") or 0 for s in season_items),
        "pass_attempts": sum(s.get("pass_attempts") or 0 for s in season_items),
        "pass_yards": sum(s.get("pass_yards") or 0 for s in season_items),
        "pass_tds": sum(s.get("pass_tds") or 0 for s in season_items),
        "ints_thrown": sum(s.get("ints_thrown") or 0 for s in season_items),
        "carries": sum(s.get("carries") or 0 for s in season_items),
        "rush_yards": sum(s.get("rush_yards") or 0 for s in season_items),
        "rush_tds": sum(s.get("rush_tds") or 0 for s in season_items),
        "receptions": sum(s.get("receptions") or 0 for s in season_items),
        "targets": sum(s.get("targets") or 0 for s in season_items),
        "rec_yards": sum(s.get("rec_yards") or 0 for s in season_items),
        "rec_tds": sum(s.get("rec_tds") or 0 for s in season_items),
        "total_tds": sum(s.get("total_tds") or 0 for s in season_items),
        "total_yards": sum(s.get("total_yards") or 0 for s in season_items),
    }
    career = _enrich_college_derived([career])[0]

    # Compute dominator rating for WR/TE (team receiving share in best season)
    dominator = None
    pos = (prospect.get("position") or "").upper()
    has_receiving = pos in ("WR", "TE") or "WR" in pos or "TE" in pos
    # Also compute for anyone with significant receiving stats
    if not has_receiving and (career.get("receptions") or 0) >= 30:
        has_receiving = True
    if has_receiving:
        # Batch: collect all (team, season) pairs and query once
        team_season_pairs = []
        for s in season_items:
            team = s.get("team")
            season_yr = s.get("season")
            if team and season_yr and (s.get("rec_yards") or 0) >= 100:
                team_season_pairs.append((team, season_yr))
        if team_season_pairs:
            placeholders = " OR ".join(["(team = ? AND season = ?)"] * len(team_season_pairs))
            flat_params = [v for pair in team_season_pairs for v in pair]
            team_totals = conn.execute(f"""
                SELECT team, season, SUM(rec_yards), SUM(rec_tds)
                FROM cfb_player_season_stats
                WHERE ({placeholders}) AND position IN ('WR', 'TE', 'RB')
                GROUP BY team, season
            """, flat_params).fetchall()
            totals_map = {(r[0], r[1]): (r[2], r[3]) for r in team_totals}
            for s in season_items:
                team = s.get("team")
                season_yr = s.get("season")
                rec_yds = s.get("rec_yards") or 0
                rec_tds = s.get("rec_tds") or 0
                if not team or not season_yr or rec_yds < 100:
                    continue
                totals = totals_map.get((team, season_yr))
                if totals and totals[0] and totals[0] > 0:
                    yd_share = rec_yds / totals[0] * 100
                    td_share = (rec_tds / totals[1] * 100) if totals[1] and totals[1] > 0 else 0
                    dom = (yd_share + td_share) / 2
                    if dominator is None or dom > dominator:
                        dominator = round(dom, 1)

    return {
        "seasons": season_items,
        "career": career,
        "dominator_rating": dominator,
        "seasons_played": len(season_items),
        "player_id": pid,
    }


def _fetch_prospect_comps_uncached(name, position="", draft_year=0, limit=5):
    """Find NFL players with the most similar combine athletic profiles."""
    with get_db() as conn:

        if not draft_year:
            row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
            draft_year = row[0] if row and row[0] else _current_draft_year()

        search_name = name.lower().replace(" ", "")

        # Get the target prospect's combine data
        where = "LOWER(REPLACE(player_name, ' ', '')) = ?"
        params = [search_name]
        if position:
            where += " AND position = ?"
            params.append(position.upper())

        target = conn.execute(f"""
            SELECT player_name, position, draft_year,
                   forty, bench, vertical, broad_jump, cone, shuttle
            FROM combine_data
            WHERE {where}
            ORDER BY draft_year DESC LIMIT 1
        """, params).fetchone()

        if not target:
            return {"comps": [], "prospect_name": name}

        target = dict(target)
        pos = target["position"]

        # Combine metrics with direction for percentile computation
        metric_keys = ["forty", "bench", "vertical", "broad_jump", "cone", "shuttle"]
        metric_dirs = {"forty": "lower", "bench": "higher", "vertical": "higher",
                       "broad_jump": "higher", "cone": "lower", "shuttle": "lower"}

        # Get position-group stats for percentile normalization
        pos_stats = {}
        for mk in metric_keys:
            rows = conn.execute(
                f"SELECT {mk} FROM combine_data WHERE position = ? AND {mk} IS NOT NULL", (pos,)
            ).fetchall()
            vals = sorted([r[0] for r in rows])
            if vals:
                pos_stats[mk] = vals

        # Compute target's percentiles
        target_pcts = {}
        for mk in metric_keys:
            val = target.get(mk)
            if val is None or mk not in pos_stats:
                continue
            all_vals = pos_stats[mk]
            if not all_vals:
                continue
            if metric_dirs[mk] == "lower":
                pct = sum(1 for v in all_vals if v > val) / len(all_vals) * 100
            else:
                pct = sum(1 for v in all_vals if v < val) / len(all_vals) * 100
            target_pcts[mk] = pct

        if len(target_pcts) < 2:
            return {"comps": [], "prospect_name": target["player_name"]}

        # Get all other players at same position (excluding target) with draft pick data
        others = conn.execute("""
            SELECT c.player_name, c.position, c.draft_year, c.school,
                   c.draft_team, c.draft_round, c.draft_pick,
                   c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle,
                   d.career_av, d.games as nfl_games,
                   d.pass_yards as nfl_pass_yards, d.pass_tds as nfl_pass_tds,
                   d.rush_yards as nfl_rush_yards, d.rush_tds as nfl_rush_tds,
                   d.rec_yards as nfl_rec_yards, d.rec_tds as nfl_rec_tds,
                   d.receptions as nfl_receptions, d.allpro, d.probowls
            FROM combine_data c
            LEFT JOIN draft_picks d
                ON c.draft_year = d.season
                AND LOWER(REPLACE(c.player_name, ' ', '')) = LOWER(REPLACE(d.player_name, ' ', ''))
                AND c.position = d.position
            WHERE c.position = ?
              AND LOWER(REPLACE(c.player_name, ' ', '')) != ?
        """, (pos, search_name)).fetchall()

        # Compute similarity for each candidate
        comps = []
        for row in others:
            other = dict(row)

            # Compute this player's percentiles on shared metrics
            shared_metrics = []
            other_pcts = {}
            for mk in metric_keys:
                oval = other.get(mk)
                if oval is None or mk not in target_pcts or mk not in pos_stats:
                    continue
                all_vals = pos_stats[mk]
                if not all_vals:
                    continue
                if metric_dirs[mk] == "lower":
                    pct = sum(1 for v in all_vals if v > oval) / len(all_vals) * 100
                else:
                    pct = sum(1 for v in all_vals if v < oval) / len(all_vals) * 100
                other_pcts[mk] = pct
                shared_metrics.append(mk)

            if len(shared_metrics) < 2:
                continue

            # Euclidean distance on shared percentiles (normalized to 0-100 scale)
            dist_sq = sum((target_pcts[mk] - other_pcts[mk]) ** 2 for mk in shared_metrics)
            max_dist = math.sqrt(len(shared_metrics) * 100 ** 2)
            dist = math.sqrt(dist_sq)

            # Convert distance to similarity score (0-100, higher = more similar)
            similarity = round(max(0, (1 - dist / max_dist) * 100), 1)

            # Abbreviate team
            dt = (other.get("draft_team") or "").upper()
            other["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

            comps.append({
                "player_name": other["player_name"],
                "position": other["position"],
                "draft_year": other["draft_year"],
                "school": other.get("school"),
                "draft_team": other.get("draft_team"),
                "draft_round": other.get("draft_round"),
                "draft_pick": other.get("draft_pick"),
                "nfl_games": other.get("nfl_games"),
                "career_av": other.get("career_av"),
                "nfl_pass_yards": other.get("nfl_pass_yards"),
                "nfl_pass_tds": other.get("nfl_pass_tds"),
                "nfl_rush_yards": other.get("nfl_rush_yards"),
                "nfl_rush_tds": other.get("nfl_rush_tds"),
                "nfl_rec_yards": other.get("nfl_rec_yards"),
                "nfl_rec_tds": other.get("nfl_rec_tds"),
                "nfl_receptions": other.get("nfl_receptions"),
                "allpro": other.get("allpro"),
                "probowls": other.get("probowls"),
                "similarity": similarity,
                "shared_metrics": len(shared_metrics),
                "percentiles": {mk: round(other_pcts[mk], 1) for mk in shared_metrics},
            })

        # Sort by similarity descending, but boost players with NFL careers
        # Players with NFL games get priority at similar similarity levels
        for c in comps:
            nfl_bonus = min(5, (c.get("nfl_games") or 0) / 10)  # up to 5 pts for 50+ games
            c["_sort_score"] = c["similarity"] + nfl_bonus
        comps.sort(key=lambda c: c["_sort_score"], reverse=True)
        for c in comps:
            del c["_sort_score"]
        comps = comps[:limit]

        return {
            "comps": comps,
            "prospect_name": target["player_name"],
            "prospect_percentiles": {mk: round(v, 1) for mk, v in target_pcts.items()},
        }



def fetch_prospect_comps(name, position="", draft_year=0, limit=5):
    return _cached(f"fetch_prospect_comps:{name}:{position}:{draft_year}:{limit}", lambda: _fetch_prospect_comps_uncached(name=name, position=position, draft_year=draft_year, limit=limit))

def _fetch_prospect_tiers_uncached(position, draft_year=0):
    """Return prospects at a position grouped by athletic percentile tier."""
    with get_db() as conn:

        if not draft_year:
            row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
            draft_year = row[0] if row and row[0] else _current_draft_year()

        if not position:
            return {"tiers": {}, "draft_year": draft_year, "position": position}

        pos = position.upper()

        # Get all prospects at this position for this draft year
        rows = conn.execute("""
            SELECT c.player_name, c.position, c.school, c.draft_year,
                   c.draft_team, c.draft_round, c.draft_pick,
                   c.height_inches, c.weight,
                   c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle
            FROM combine_data c
            WHERE c.position = ? AND c.draft_year = ?
        """, (pos, draft_year)).fetchall()

        if not rows:
            return {"tiers": {}, "draft_year": draft_year, "position": pos}

        # Get position-group stats for percentile computation
        metric_keys = ["forty", "bench", "vertical", "broad_jump", "cone", "shuttle"]
        metric_dirs = {"forty": "lower", "bench": "higher", "vertical": "higher",
                       "broad_jump": "higher", "cone": "lower", "shuttle": "lower"}

        pos_stats = {}
        for mk in metric_keys:
            all_rows = conn.execute(
                f"SELECT {mk} FROM combine_data WHERE position = ? AND {mk} IS NOT NULL", (pos,)
            ).fetchall()
            vals = [r[0] for r in all_rows]
            if vals:
                pos_stats[mk] = vals

        prospects = []
        for row in rows:
            p = dict(row)

            # Abbreviate team
            dt = (p.get("draft_team") or "").upper()
            p["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

            # Height display
            ht = p.get("height_inches")
            p["height_display"] = f"{ht // 12}'{ht % 12}\"" if ht else None

            # Compute percentiles
            pcts = {}
            for mk in metric_keys:
                val = p.get(mk)
                if val is None or mk not in pos_stats:
                    continue
                all_vals = pos_stats[mk]
                if not all_vals:
                    continue
                if metric_dirs[mk] == "lower":
                    pct = sum(1 for v in all_vals if v > val) / len(all_vals) * 100
                else:
                    pct = sum(1 for v in all_vals if v < val) / len(all_vals) * 100
                pcts[mk] = round(pct, 1)

            p["percentiles"] = pcts

            # Average athletic percentile (across available metrics)
            if pcts:
                p["avg_percentile"] = round(sum(pcts.values()) / len(pcts), 1)
            else:
                p["avg_percentile"] = None

            prospects.append(p)

        # Group into tiers
        tiers = {"elite": [], "above_avg": [], "average": [], "below_avg": [], "no_data": []}
        for p in prospects:
            avg = p["avg_percentile"]
            if avg is None:
                tiers["no_data"].append(p)
            elif avg >= 80:
                tiers["elite"].append(p)
            elif avg >= 60:
                tiers["above_avg"].append(p)
            elif avg >= 40:
                tiers["average"].append(p)
            else:
                tiers["below_avg"].append(p)

        # Sort within tiers by avg_percentile descending
        for tier in tiers.values():
            tier.sort(key=lambda x: x.get("avg_percentile") or 0, reverse=True)

        return {"tiers": tiers, "draft_year": draft_year, "position": pos}



def fetch_prospect_tiers(position, draft_year=0):
    return _cached(f"fetch_prospect_tiers:{position}:{draft_year}", lambda: _fetch_prospect_tiers_uncached(position=position, draft_year=draft_year), _CACHE_TTL_STABLE)

def _fetch_prospects_compare_uncached(names, draft_year=0):
    """Return combine data + percentiles for multiple prospects (for comparison)."""
    with get_db() as conn:

        if not draft_year:
            row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
            draft_year = row[0] if row and row[0] else _current_draft_year()

        if not names:
            return {"draft_year": draft_year, "prospects": []}

        results = []
        for name in names[:5]:  # max 5
            profile = fetch_prospect_profile(name, draft_year=draft_year)
            if profile.get("prospect"):
                results.append({
                    "prospect": profile["prospect"],
                    "percentiles": profile["percentiles"],
                })

        return {"draft_year": draft_year, "prospects": results}



def fetch_prospects_compare(names, draft_year=0):
    return _cached(f"fetch_prospects_compare:{names}:{draft_year}", lambda: _fetch_prospects_compare_uncached(names=names, draft_year=draft_year))

def _fetch_prospect_scores_uncached(position="", draft_year=0):
    """Compute Razzle Prospect Score (RPS) for all prospects at a position.

    RPS = avg athletic percentile (60%) + draft capital value (30%) + size score (10%).
    """
    with get_db() as conn:
        if not draft_year:
            row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
            draft_year = row[0] if row and row[0] else _current_draft_year()

        pos_filter = "AND c.position = ?" if position else ""
        params = [draft_year] + ([position.upper()] if position else [])

        rows = conn.execute(f"""
        SELECT c.player_name, c.position, c.school, c.draft_year,
               c.draft_team, c.draft_round, c.draft_pick,
               c.height_inches, c.weight,
               c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle
        FROM combine_data c
        WHERE c.draft_year = ? {pos_filter}
    """, params).fetchall()

        if not rows:
            return {"prospects": [], "draft_year": draft_year, "position": position.upper() if position else "ALL"}

        # Gather position-group stats for percentile computation
        metric_keys = ["forty", "bench", "vertical", "broad_jump", "cone", "shuttle"]
        metric_dirs = {"forty": "lower", "bench": "higher", "vertical": "higher",
                       "broad_jump": "higher", "cone": "lower", "shuttle": "lower"}

        # Get all positions we need stats for
        positions_in_data = set()
        for r in rows:
            positions_in_data.add(r["position"])

        pos_stats = {}
        for pos in positions_in_data:
            pos_stats[pos] = {}
            for mk in metric_keys:
                all_rows = conn.execute(
                    f"SELECT {mk} FROM combine_data WHERE position = ? AND {mk} IS NOT NULL", (pos,)
                ).fetchall()
                vals = [r[0] for r in all_rows]
                if vals:
                    pos_stats[pos][mk] = vals

        # Position-relative size benchmarks (median weight for the position)
        size_benchmarks = {}
        for pos in positions_in_data:
            wt_rows = conn.execute(
                "SELECT weight FROM combine_data WHERE position = ? AND weight IS NOT NULL", (pos,)
            ).fetchall()
            wts = sorted([r[0] for r in wt_rows])
            if wts:
                size_benchmarks[pos] = {"median": wts[len(wts)//2], "values": wts}

        prospects = []
        for row in rows:
            p = dict(row)
            pos = p["position"]

            # Abbreviate team
            dt = (p.get("draft_team") or "").upper()
            p["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

            # Height display
            ht = p.get("height_inches")
            p["height_display"] = f"{ht // 12}'{ht % 12}\"" if ht else None

            # 1) Athletic percentiles
            pcts = {}
            for mk in metric_keys:
                val = p.get(mk)
                if val is None or mk not in pos_stats.get(pos, {}):
                    continue
                all_vals = pos_stats[pos][mk]
                if not all_vals:
                    continue
                if metric_dirs[mk] == "lower":
                    pct = sum(1 for v in all_vals if v > val) / len(all_vals) * 100
                else:
                    pct = sum(1 for v in all_vals if v < val) / len(all_vals) * 100
                pcts[mk] = round(pct, 1)

            p["percentiles"] = pcts
            athletic_avg = round(sum(pcts.values()) / len(pcts), 1) if pcts else None
            p["athletic_avg"] = athletic_avg

            # 2) Draft capital score (0-100)
            rd = p.get("draft_round")
            pk = p.get("draft_pick")
            if rd and pk:
                # Pick 1 = 100, pick 32 = 75, pick 64 = 55, pick 256 = 20
                draft_capital = max(20, 100 - (pk - 1) * 0.314)
                draft_capital = round(min(100, draft_capital), 1)
            else:
                draft_capital = 20  # undrafted
            p["draft_capital_score"] = draft_capital

            # 3) Size score (position-relative, 0-100)
            wt = p.get("weight")
            if wt and pos in size_benchmarks:
                all_wts = size_benchmarks[pos]["values"]
                size_pct = sum(1 for w in all_wts if w < wt) / len(all_wts) * 100
                size_score = round(min(100, size_pct), 1)
            else:
                size_score = 50  # default median
            p["size_score"] = size_score

            # RPS composite: athletic 60% + draft capital 30% + size 10%
            if athletic_avg is not None:
                rps = round(athletic_avg * 0.6 + draft_capital * 0.3 + size_score * 0.1, 1)
            else:
                # No combine data — use draft capital + size only, penalize missing data
                rps = round(draft_capital * 0.5 + size_score * 0.2, 1)
            p["rps"] = rps

            prospects.append(p)

        # Sort by RPS descending
        prospects.sort(key=lambda x: x["rps"], reverse=True)

        # Add rank
        for i, p in enumerate(prospects):
            p["rank"] = i + 1

        return {
            "prospects": prospects,
            "draft_year": draft_year,
            "position": position.upper() if position else "ALL",
        }



def fetch_prospect_scores(position="", draft_year=0):
    return _cached(f"fetch_prospect_scores:{position}:{draft_year}", lambda: _fetch_prospect_scores_uncached(position=position, draft_year=draft_year))

def _fetch_draft_class_analytics_uncached(position=""):
    """Cross-year draft class strength analysis using RPS data.

    Returns per-year breakdown: count, avg RPS, tier distribution, top prospect, class grade.
    """
    with get_db() as conn:
        # Get all available draft years
        years = [r[0] for r in conn.execute(
            "SELECT DISTINCT draft_year FROM combine_data ORDER BY draft_year ASC"
        ).fetchall()]

    if not years:
        return {"classes": [], "position": position.upper() if position else "ALL"}

    # For each year, get RPS data via fetch_prospect_scores (reuse existing logic)
    classes = []
    for year in years:
        data = fetch_prospect_scores(position=position, draft_year=year)
        prospects = data.get("prospects", [])

        if not prospects:
            classes.append({
                "year": year, "count": 0, "avg_rps": 0,
                "tiers": {"elite": 0, "premium": 0, "solid": 0, "flier": 0},
                "top_prospect": None, "grade": "N/A"
            })
            continue

        rps_values = [p["rps"] for p in prospects]
        avg_rps = round(sum(rps_values) / len(rps_values), 1)

        # Tier distribution
        tiers = {"elite": 0, "premium": 0, "solid": 0, "flier": 0}
        for p in prospects:
            rps = p["rps"]
            if rps >= 85:
                tiers["elite"] += 1
            elif rps >= 70:
                tiers["premium"] += 1
            elif rps >= 55:
                tiers["solid"] += 1
            else:
                tiers["flier"] += 1

        # Top prospect
        top = prospects[0]  # already sorted by RPS desc
        top_prospect = {
            "name": top["player_name"],
            "position": top["position"],
            "rps": top["rps"],
            "school": top.get("school"),
        }

        # Class grade: elite ratio (% of class that is Elite/Premium) + avg RPS
        top_tier_pct = (tiers["elite"] + tiers["premium"]) / (len(prospects) or 1) * 100
        if avg_rps >= 55 and top_tier_pct >= 15:
            grade = "A"
        elif avg_rps >= 50 or top_tier_pct >= 10:
            grade = "B"
        elif avg_rps >= 45 or top_tier_pct >= 5:
            grade = "C"
        else:
            grade = "D"

        classes.append({
            "year": year,
            "count": len(prospects),
            "avg_rps": avg_rps,
            "tiers": tiers,
            "top_prospect": top_prospect,
            "grade": grade,
        })

    return {
        "classes": classes,
        "position": position.upper() if position else "ALL",
    }


def fetch_draft_class_analytics(position=""):
    return _cached(f"fetch_draft_class_analytics:{position}", lambda: _fetch_draft_class_analytics_uncached(position=position), _CACHE_TTL_STABLE)


def _fetch_athletic_radar_uncached(position="", draft_year=0):
    """Return prospects with pre-computed position percentiles for 6 combine metrics.

    Designed for radar/spider chart rendering — each prospect gets raw values
    and percentile ranks for forty, bench, vertical, broad_jump, cone, shuttle.
    """
    with get_db() as conn:
        if not draft_year:
            row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
            draft_year = row[0] if row and row[0] else _current_draft_year()

        pos_filter = "AND c.position = ?" if position else ""
        params = [draft_year] + ([position.upper()] if position else [])

        rows = conn.execute(f"""
            SELECT c.player_name, c.position, c.school, c.draft_year,
                   c.draft_team, c.draft_round, c.draft_pick,
                   c.height_inches, c.weight,
                   c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle
            FROM combine_data c
            WHERE c.draft_year = ? {pos_filter}
            ORDER BY c.player_name
        """, params).fetchall()

        if not rows:
            return {
                "prospects": [],
                "draft_year": draft_year,
                "position": position.upper() if position else "ALL",
            }

        # Gather position-group distributions for percentile computation
        metric_keys = ["forty", "bench", "vertical", "broad_jump", "cone", "shuttle"]
        metric_dirs = {
            "forty": "lower", "bench": "higher", "vertical": "higher",
            "broad_jump": "higher", "cone": "lower", "shuttle": "lower",
        }

        positions_in_data = set(r["position"] for r in rows)
        pos_vals = {}
        for pos in positions_in_data:
            pos_vals[pos] = {}
            for mk in metric_keys:
                all_rows = conn.execute(
                    f"SELECT {mk} FROM combine_data WHERE position = ? AND {mk} IS NOT NULL",
                    (pos,),
                ).fetchall()
                vals = [r[0] for r in all_rows]
                if vals:
                    pos_vals[pos][mk] = vals

        prospects = []
        for row in rows:
            p = dict(row)
            pos = p["position"]

            # Abbreviate team
            dt = (p.get("draft_team") or "").upper()
            p["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

            # Height display
            ht = p.get("height_inches")
            p["height_display"] = f"{ht // 12}'{ht % 12}\"" if ht else None

            # Compute percentiles for 6 combine metrics
            pcts = {}
            has_any = False
            for mk in metric_keys:
                val = p.get(mk)
                if val is None or mk not in pos_vals.get(pos, {}):
                    pcts[mk] = None
                    continue
                all_v = pos_vals[pos][mk]
                if metric_dirs[mk] == "lower":
                    pct = sum(1 for v in all_v if v > val) / len(all_v) * 100
                else:
                    pct = sum(1 for v in all_v if v < val) / len(all_v) * 100
                pcts[mk] = round(pct, 1)
                has_any = True

            p["percentiles"] = pcts
            p["avg_percentile"] = (
                round(sum(v for v in pcts.values() if v is not None) /
                      sum(1 for v in pcts.values() if v is not None), 1)
                if has_any else None
            )

            # Only include prospects that tested in at least 1 drill
            if has_any:
                prospects.append(p)

        # Sort by avg_percentile descending (best athletes first)
        prospects.sort(
            key=lambda x: x.get("avg_percentile") or 0, reverse=True
        )

        return {
            "prospects": prospects,
            "draft_year": draft_year,
            "position": position.upper() if position else "ALL",
        }


def fetch_athletic_radar(position="", draft_year=0):
    return _cached(
        f"fetch_athletic_radar:{position}:{draft_year}",
        lambda: _fetch_athletic_radar_uncached(position=position, draft_year=draft_year),
        _CACHE_TTL_STABLE,
    )
