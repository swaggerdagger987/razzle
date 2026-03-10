"""
Storage functions — waitlist, formula store, analytics logging.

These are non-analytical data management functions that handle user-generated
content, community features, and internal tracking.
"""

import logging
import re
import sqlite3

from ..db import get_db

logger = logging.getLogger("razzle.live_data.storage")


# ---------------------------------------------------------------------------
# Waitlist
# ---------------------------------------------------------------------------

def init_waitlist_table():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS waitlist (
                email TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.commit()


def add_to_waitlist(email: str) -> dict:
    email = email.strip().lower()
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        return {"status": "error", "message": "invalid email format"}
    with get_db() as conn:
        try:
            conn.execute("INSERT INTO waitlist (email) VALUES (?)", (email,))
            conn.commit()
            result = {"status": "ok"}
        except sqlite3.IntegrityError:
            result = {"status": "duplicate"}
        return result


# ---------------------------------------------------------------------------
# Formula Store
# ---------------------------------------------------------------------------

def init_formula_store_tables():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS formula_store (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                position_tags TEXT NOT NULL DEFAULT '[]',
                stat_weights TEXT NOT NULL DEFAULT '{}',
                creator_name TEXT NOT NULL DEFAULT 'anonymous',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                rating_sum REAL NOT NULL DEFAULT 0,
                rating_count INTEGER NOT NULL DEFAULT 0
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS formula_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                formula_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                review TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (formula_id) REFERENCES formula_store(id)
            )
        """)
        conn.commit()

        # Seed formulas if table is empty
        count = conn.execute("SELECT COUNT(*) FROM formula_store").fetchone()[0]
        if count == 0:
            _seed_formula_store(conn)



def _seed_formula_store(conn):
    import json
    seeds = [
        {
            "name": "PPR Workhorse",
            "description": "Identifies high-volume PPR assets. Weights receptions and targets heavily alongside rushing volume.",
            "position_tags": ["RB", "WR"],
            "stat_weights": {"receptions": 30, "targets": 25, "rushing_yards": 20, "receiving_yards": 15, "rushing_tds": 10},
            "creator_name": "Razzle Labs",
            "rating_sum": 23, "rating_count": 5,
        },
        {
            "name": "Alpha WR Score",
            "description": "Finds true WR1 alphas. Combines target share, air yards, and touchdown upside.",
            "position_tags": ["WR"],
            "stat_weights": {"targets": 25, "receiving_yards": 25, "receiving_tds": 20, "receptions": 15, "receiving_yards_after_catch": 10, "receiving_fumbles_lost": -5},
            "creator_name": "Razzle Labs",
            "rating_sum": 29, "rating_count": 6,
        },
        {
            "name": "Dual Threat QB",
            "description": "Scores QBs who contribute with both arm and legs. Rushing floor matters in fantasy.",
            "position_tags": ["QB"],
            "stat_weights": {"passing_yards": 25, "passing_tds": 20, "rushing_yards": 25, "rushing_tds": 15, "interceptions": -15},
            "creator_name": "Razzle Labs",
            "rating_sum": 17, "rating_count": 4,
        },
        {
            "name": "Bellcow Index",
            "description": "Pure rushing workload. Identifies true three-down backs with volume and TD upside.",
            "position_tags": ["RB"],
            "stat_weights": {"rushing_yards": 30, "carries": 25, "rushing_tds": 20, "rushing_first_downs": 15, "rushing_fumbles_lost": -10},
            "creator_name": "Razzle Labs",
            "rating_sum": 22, "rating_count": 5,
        },
        {
            "name": "TD Machine",
            "description": "Pure touchdown upside across all scoring methods. Boom-or-bust by design.",
            "position_tags": ["QB", "RB", "WR", "TE"],
            "stat_weights": {"passing_tds": 30, "rushing_tds": 35, "receiving_tds": 35},
            "creator_name": "Razzle Labs",
            "rating_sum": 17, "rating_count": 4,
        },
        {
            "name": "Target Hog",
            "description": "Volume is king in PPR. Finds players commanding the highest target share on their team.",
            "position_tags": ["WR", "TE", "RB"],
            "stat_weights": {"targets": 35, "receptions": 30, "receiving_yards": 20, "receiving_first_downs": 15},
            "creator_name": "Razzle Labs",
            "rating_sum": 19, "rating_count": 4,
        },
        {
            "name": "TE Premium",
            "description": "Identifies the rare TEs who actually produce. Receiving volume + TD upside weighted for TE scarcity.",
            "position_tags": ["TE"],
            "stat_weights": {"receptions": 30, "receiving_yards": 25, "targets": 20, "receiving_tds": 25},
            "creator_name": "Razzle Labs",
            "rating_sum": 24, "rating_count": 5,
        },
        {
            "name": "Dynasty Value Score",
            "description": "Long-term dynasty asset evaluation. Balances current production with age-adjusted upside.",
            "position_tags": ["QB", "RB", "WR", "TE"],
            "stat_weights": {"fantasy_points_ppr": 35, "receiving_yards": 20, "rushing_yards": 15, "passing_yards": 15, "receptions": 15},
            "creator_name": "Razzle Labs",
            "rating_sum": 27, "rating_count": 6,
        },
        {
            "name": "YAC Monster",
            "description": "Explosive playmakers who create after the catch. The fun players to own.",
            "position_tags": ["WR", "RB", "TE"],
            "stat_weights": {"receiving_yards_after_catch": 40, "receiving_yards": 25, "receptions": 20, "receiving_tds": 15},
            "creator_name": "Razzle Labs",
            "rating_sum": 19, "rating_count": 4,
        },
        {
            "name": "Pocket Passer",
            "description": "Traditional pocket QB evaluation. Pure passing efficiency and volume.",
            "position_tags": ["QB"],
            "stat_weights": {"passing_yards": 30, "passing_tds": 30, "completions": 15, "interceptions": -25},
            "creator_name": "Razzle Labs",
            "rating_sum": 18, "rating_count": 4,
        },
    ]

    for s in seeds:
        conn.execute(
            """INSERT INTO formula_store (name, description, position_tags, stat_weights, creator_name, rating_sum, rating_count)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (s["name"], s["description"], json.dumps(s["position_tags"]),
             json.dumps(s["stat_weights"]), s["creator_name"],
             s["rating_sum"], s["rating_count"]),
        )
    conn.commit()


def publish_formula(name: str, description: str, position_tags: list,
                    stat_weights: dict, creator_name: str) -> dict:
    import json
    with get_db() as conn:
        try:
            cur = conn.execute(
                """INSERT INTO formula_store (name, description, position_tags, stat_weights, creator_name)
                   VALUES (?, ?, ?, ?, ?)""",
                (name.strip(), description.strip(),
                 json.dumps(position_tags), json.dumps(stat_weights),
                 creator_name.strip() or "anonymous"),
            )
            conn.commit()
            formula_id = cur.lastrowid
            result = {"status": "ok", "id": formula_id}
        except Exception as e:
            logger.exception("publish_formula failed")
            result = {"status": "error", "message": str(e)}
        return result


def fetch_formula_store(position: str = "", sort: str = "newest",
                        search: str = "", limit: int = 50, offset: int = 0) -> dict:
    import json
    with get_db() as conn:

        where_parts = []
        params = []

        if position and position.upper() != "ALL":
            where_parts.append("position_tags LIKE ?")
            params.append(f'%"{position.upper()}"%')

        if search:
            where_parts.append("name LIKE ?")
            params.append(f"%{search}%")

        where_sql = ("WHERE " + " AND ".join(where_parts)) if where_parts else ""

        sort_map = {
            "newest": "created_at DESC",
            "rating": "CASE WHEN rating_count > 0 THEN rating_sum / rating_count ELSE 0 END DESC",
            "popular": "rating_count DESC",
        }
        order_sql = sort_map.get(sort, "created_at DESC")

        rows = conn.execute(f"""
            SELECT id, name, description, position_tags, creator_name, created_at,
                   rating_sum, rating_count
            FROM formula_store
            {where_sql}
            ORDER BY {order_sql}
            LIMIT ? OFFSET ?
        """, params + [limit, offset]).fetchall()

        count_row = conn.execute(f"SELECT COUNT(*) FROM formula_store {where_sql}", params).fetchone()
        total = count_row[0] if count_row else 0

        formulas = []
        for r in rows:
            avg_rating = round(r[6] / r[7], 1) if r[7] > 0 else 0
            formulas.append({
                "id": r[0],
                "name": r[1],
                "description": r[2],
                "position_tags": json.loads(r[3]) if r[3] else [],
                "creator_name": r[4],
                "created_at": r[5],
                "avg_rating": avg_rating,
                "rating_count": r[7],
            })

        return {"formulas": formulas, "total": total}


def get_formula_detail(formula_id: int) -> dict:
    import json
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, description, position_tags, stat_weights, creator_name, created_at, rating_sum, rating_count FROM formula_store WHERE id = ?",
            (formula_id,),
        ).fetchone()

        if not row:
            return {"status": "not_found"}

        avg_rating = round(row[7] / row[8], 1) if row[8] > 0 else 0
        return {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "position_tags": json.loads(row[3]) if row[3] else [],
            "stat_weights": json.loads(row[4]) if row[4] else {},
            "creator_name": row[5],
            "created_at": row[6],
            "avg_rating": avg_rating,
            "rating_count": row[8],
        }


def rate_formula(formula_id: int, rating: int, review: str = "") -> dict:
    if rating < 1 or rating > 5:
        return {"status": "error", "message": "rating must be 1-5"}

    with get_db() as conn:
        # Check formula exists
        exists = conn.execute("SELECT id FROM formula_store WHERE id = ?", (formula_id,)).fetchone()
        if not exists:
            return {"status": "not_found"}

        conn.execute(
            "INSERT INTO formula_ratings (formula_id, rating, review) VALUES (?, ?, ?)",
            (formula_id, rating, review.strip()),
        )
        conn.execute(
            "UPDATE formula_store SET rating_sum = rating_sum + ?, rating_count = rating_count + 1 WHERE id = ?",
            (rating, formula_id),
        )
        conn.commit()
        return {"status": "ok"}


# ---------------------------------------------------------------------------
# Analytics — lightweight page view tracking
# ---------------------------------------------------------------------------

def _init_analytics_table():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS pageviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.commit()


def log_pageview(page: str):
    try:
        with get_db() as conn:
            conn.execute("INSERT INTO pageviews (page) VALUES (?)", (page[:200],))
            conn.commit()
    except Exception:
        logger.warning("log_pageview failed for page=%s", page, exc_info=True)


def get_analytics_summary() -> dict:
    try:
        with get_db() as conn:
            total = conn.execute("SELECT COUNT(*) FROM pageviews").fetchone()[0]
            by_page = conn.execute(
                "SELECT page, COUNT(*) as views FROM pageviews GROUP BY page ORDER BY views DESC LIMIT 20"
            ).fetchall()
            by_day = conn.execute(
                "SELECT DATE(created_at) as day, COUNT(*) as views FROM pageviews GROUP BY day ORDER BY day DESC LIMIT 30"
            ).fetchall()
            return {
                "total": total,
                "by_page": [{"page": r[0], "views": r[1]} for r in by_page],
                "by_day": [{"day": r[0], "views": r[1]} for r in by_day],
            }
    except Exception:
        logger.exception("get_analytics_summary failed")
        return {"total": 0, "by_page": [], "by_day": []}
