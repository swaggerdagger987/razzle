"""
Razzle auth module — user registration, login, JWT tokens.
Uses a separate users.db to persist across terminal.db rebuilds.
"""

import base64
import hashlib
import os
import re
import secrets
import sqlite3
import logging
from contextlib import contextmanager
from datetime import datetime, timezone, timedelta
from pathlib import Path

import sys

import bcrypt
import jwt
from cryptography.fernet import Fernet

logger = logging.getLogger("razzle.auth")

_ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

if os.environ.get("ENVIRONMENT") == "production":
    USERS_DB_PATH = Path("/data/users.db")
else:
    USERS_DB_PATH = Path(__file__).parent.parent / "data" / "users.db"

# JWT config
JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    if _ENVIRONMENT == "production":
        raise RuntimeError(
            "JWT_SECRET environment variable is required in production. "
            "Set it to a stable, random hex string (e.g. `python -c \"import secrets; print(secrets.token_hex(32))\"`)."
        )
    JWT_SECRET = secrets.token_hex(32)
    print(
        "WARNING: JWT_SECRET not set — using random fallback. "
        "Tokens will not survive restarts. Set JWT_SECRET for stable sessions.",
        file=sys.stderr,
    )
    logger.warning("JWT_SECRET not set — using random key (tokens will expire on restart)")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# No-credit-card trial — new users get 7 days of Pro access on registration
TRIAL_DURATION_DAYS = 7

# Common passwords (top ~200 most used) — reject these outright
_COMMON_PASSWORDS = frozenset([
    "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
    "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
    "ashley", "bailey", "shadow", "123123", "654321", "superman", "qazwsx",
    "michael", "football", "password1", "password123", "batman", "login",
    "starwars", "solo", "princess", "welcome", "admin", "passw0rd", "hello",
    "charlie", "donald", "loveme", "beer", "access", "flower", "hottie",
    "pepper", "thunder", "1qaz2wsx", "zaq1zaq1", "test", "qwer1234",
    "mustang", "killer", "soccer", "jordan", "ranger", "buster", "tigger",
    "1234", "12345", "123456789", "1234567890", "0987654321", "fantasy",
    "football1", "dynasty", "sleeper", "razzle", "razzledazzle", "fantasy1",
    "touchd0wn", "touchdown", "quarterback", "nfl2026", "redraft", "bestball",
])


def get_users_conn():
    """Get connection to users.db (separate from terminal.db)."""
    USERS_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(USERS_DB_PATH), timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


@contextmanager
def get_users_db():
    """Context manager for users.db connections. Always closes on exit."""
    conn = get_users_conn()
    try:
        yield conn
    finally:
        conn.close()


def initialize_users_db():
    """Create users tables if they don't exist."""
    with get_users_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                sleeper_username TEXT,
                plan TEXT DEFAULT 'free',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_formulas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                weights TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE INDEX IF NOT EXISTS idx_user_formulas_user ON user_formulas(user_id);

            CREATE TABLE IF NOT EXISTS agent_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                league_id TEXT,
                league_name TEXT,
                scenario TEXT NOT NULL,
                findings TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE INDEX IF NOT EXISTS idx_agent_memory_user ON agent_memory(user_id);
            CREATE INDEX IF NOT EXISTS idx_agent_memory_league ON agent_memory(user_id, league_id);

            CREATE TABLE IF NOT EXISTS weekly_briefings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                league_id TEXT,
                league_name TEXT,
                week_label TEXT NOT NULL,
                summary TEXT NOT NULL,
                urgency_items TEXT,
                monitor_items TEXT,
                opportunity_items TEXT,
                agent_highlights TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE INDEX IF NOT EXISTS idx_briefings_user ON weekly_briefings(user_id);
            CREATE INDEX IF NOT EXISTS idx_briefings_user_week ON weekly_briefings(user_id, week_label);

            CREATE TABLE IF NOT EXISTS user_saved_views (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                view_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE INDEX IF NOT EXISTS idx_saved_views_user ON user_saved_views(user_id);

            CREATE TABLE IF NOT EXISTS user_watchlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                player_id TEXT NOT NULL,
                player_name TEXT,
                position TEXT,
                team TEXT,
                universe TEXT DEFAULT 'nfl',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(user_id, player_id)
            );

            CREATE INDEX IF NOT EXISTS idx_watchlist_user ON user_watchlist(user_id);

            CREATE TABLE IF NOT EXISTS ai_query_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                ip_address TEXT,
                query_date TEXT NOT NULL,
                query_count INTEGER DEFAULT 0,
                UNIQUE(user_id, ip_address, query_date)
            );

            CREATE INDEX IF NOT EXISTS idx_query_log_date ON ai_query_log(query_date);

            CREATE TABLE IF NOT EXISTS user_api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                provider TEXT NOT NULL,
                encrypted_key BLOB NOT NULL,
                label TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, provider),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE INDEX IF NOT EXISTS idx_api_keys_user ON user_api_keys(user_id);
        """)
        conn.commit()

        # Migration: add trial and sleeper lock columns to users table
        for col, default in [
            ("trial_start", "NULL"),
            ("trial_end", "NULL"),
            ("trial_used", "0"),
            ("sleeper_locked", "0"),
        ]:
            try:
                conn.execute(f"ALTER TABLE users ADD COLUMN {col} DEFAULT {default}")
                conn.commit()
            except sqlite3.OperationalError:
                pass  # Column already exists

    logger.info("Users database initialized")


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def _verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def _create_token(user_id: int, email: str, plan: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "plan": plan,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str) -> dict:
    """Decode and verify JWT. Returns payload dict or raises."""
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def _user_dict(row) -> dict:
    d = {
        "id": row["id"],
        "email": row["email"],
        "plan": row["plan"],
        "sleeper_username": row["sleeper_username"],
    }
    # Include stripe_customer_id if column exists
    try:
        d["stripe_customer_id"] = row["stripe_customer_id"]
    except (IndexError, KeyError):
        pass

    # Sleeper lock status
    try:
        d["sleeper_locked"] = bool(row["sleeper_locked"])
    except (IndexError, KeyError):
        d["sleeper_locked"] = False

    # Trial info
    trial_end_str = None
    try:
        trial_end_str = row["trial_end"]
    except (IndexError, KeyError):
        pass

    trial_active = False
    trial_days_remaining = 0
    if trial_end_str and d["plan"] == "free":
        try:
            trial_end = datetime.fromisoformat(trial_end_str.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            if trial_end > now:
                trial_active = True
                trial_days_remaining = max(0, (trial_end - now).days)
        except (ValueError, TypeError):
            pass

    d["trial_active"] = trial_active
    d["trial_days_remaining"] = trial_days_remaining
    if trial_end_str:
        d["trial_end"] = trial_end_str

    # Preserve raw DB plan before trial elevation (used by billing checkout check)
    d["raw_plan"] = d["plan"]

    # Effective plan: if trial is active and user has no paid plan, they get Pro
    if trial_active and d["plan"] == "free":
        d["plan"] = "pro"
        d["plan_source"] = "trial"
    else:
        d["plan_source"] = "subscription" if d["plan"] != "free" else "free"

    return d


def _validate_password(password: str) -> str | None:
    """Validate password strength. Returns error message or None if valid."""
    if len(password) < 8:
        return "Password must be at least 8 characters"
    if not re.search(r"[a-zA-Z]", password):
        return "Password must contain at least one letter"
    if not re.search(r"[0-9]", password):
        return "Password must contain at least one number"
    if password.lower() in _COMMON_PASSWORDS:
        return "That password is too common. Please choose a stronger one."
    return None


def register(email: str, password: str) -> dict:
    """Register a new user. Returns {token, user}."""
    email = email.strip().lower()
    if not EMAIL_REGEX.match(email):
        return {"error": "Invalid email format", "status": 400}
    pw_error = _validate_password(password)
    if pw_error:
        return {"error": pw_error, "status": 400}

    try:
        with get_users_db() as conn:
            existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            if existing:
                return {"error": "Email already registered", "status": 409}

            password_hash = _hash_password(password)
            now = datetime.now(timezone.utc)
            trial_start = now.isoformat()
            trial_end = (now + timedelta(days=TRIAL_DURATION_DAYS)).isoformat()
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash, trial_start, trial_end, trial_used) VALUES (?, ?, ?, ?, 1)",
                (email, password_hash, trial_start, trial_end),
            )
            conn.commit()
            user_id = cursor.lastrowid
            # Build user dict with trial active — effective plan will be "pro"
            user = {
                "id": user_id, "email": email, "plan": "pro",
                "sleeper_username": None, "trial_active": True,
                "trial_days_remaining": TRIAL_DURATION_DAYS,
                "trial_end": trial_end, "plan_source": "trial",
            }
            # Token carries "pro" plan during trial for middleware compatibility
            token = _create_token(user_id, email, "pro")
            return {"token": token, "user": user}
    except Exception as e:
        if "UNIQUE constraint" in str(e) or "IntegrityError" in type(e).__name__:
            return {"error": "Email already registered", "status": 409}
        logger.error(f"Registration error: {type(e).__name__}: {e}")
        return {"error": "Registration failed. Please try again.", "status": 500}


def login(email: str, password: str) -> dict:
    """Login user. Returns {token, user}."""
    email = email.strip().lower()
    with get_users_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not row:
            return {"error": "Invalid email or password", "status": 401}

        try:
            if not _verify_password(password, row["password_hash"]):
                return {"error": "Invalid email or password", "status": 401}
        except Exception:
            logger.exception("Password verification error for %s", email)
            return {"error": "Invalid email or password", "status": 401}

        user = _user_dict(row)
        # Token uses effective plan (includes trial upgrade to pro)
        token = _create_token(user["id"], user["email"], user["plan"])
        return {"token": token, "user": user}


def get_current_user(token: str) -> dict:
    """Verify token and return user info."""
    try:
        payload = _decode_token(token)
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired", "status": 401}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token", "status": 401}

    with get_users_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (payload["user_id"],)).fetchone()
        if not row:
            return {"error": "User not found", "status": 401}
        return {"user": _user_dict(row)}


def link_sleeper(user_id: int, sleeper_username: str) -> dict:
    """Link a Sleeper username to user account. Once locked, cannot be changed."""
    with get_users_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            return {"error": "User not found", "status": 404}

        # Check if already locked to a different username
        existing_username = row["sleeper_username"]
        sleeper_locked = False
        try:
            sleeper_locked = bool(row["sleeper_locked"])
        except (IndexError, KeyError):
            pass

        if sleeper_locked and existing_username and existing_username.lower() != sleeper_username.lower():
            return {
                "error": f"Your account is linked to {existing_username}. One Sleeper ID per account keeps the free trial fair for everyone.",
                "status": 409,
                "locked_username": existing_username,
            }

        # Link and lock
        conn.execute(
            "UPDATE users SET sleeper_username = ?, sleeper_locked = 1 WHERE id = ?",
            (sleeper_username, user_id),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return {"user": _user_dict(row)}


# ── User Formula CRUD ──────────────────────────────────────────────

def get_user_formulas(user_id: int) -> dict:
    with get_users_db() as conn:
        rows = conn.execute(
            "SELECT id, name, weights, created_at, updated_at FROM user_formulas WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,),
        ).fetchall()
        return {"formulas": [dict(r) for r in rows]}


def save_user_formula(user_id: int, name: str, weights: str) -> dict:
    if not name or not weights:
        return {"error": "Name and weights required", "status": 400}
    with get_users_db() as conn:
        existing = conn.execute(
            "SELECT id FROM user_formulas WHERE user_id = ? AND name = ?",
            (user_id, name),
        ).fetchone()
        if existing:
            conn.execute(
                "UPDATE user_formulas SET weights = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (weights, existing["id"]),
            )
            formula_id = existing["id"]
        else:
            cursor = conn.execute(
                "INSERT INTO user_formulas (user_id, name, weights) VALUES (?, ?, ?)",
                (user_id, name, weights),
            )
            formula_id = cursor.lastrowid
        conn.commit()
        return {"status": "ok", "formula_id": formula_id}


def delete_user_formula(user_id: int, formula_id: int) -> dict:
    with get_users_db() as conn:
        row = conn.execute("SELECT user_id FROM user_formulas WHERE id = ?", (formula_id,)).fetchone()
        if not row:
            return {"error": "Formula not found", "status": 404}
        if row["user_id"] != user_id:
            return {"error": "Not your formula", "status": 403}
        conn.execute("DELETE FROM user_formulas WHERE id = ?", (formula_id,))
        conn.commit()
        return {"status": "ok"}


_FORMULA_IMPORT_MAX = 50
_FORMULA_WEIGHTS_MAX_BYTES = 10_240  # 10 KB

def import_formulas(user_id: int, formulas: list) -> dict:
    if not isinstance(formulas, list):
        return {"error": "formulas must be a list", "status": 400}
    if len(formulas) > _FORMULA_IMPORT_MAX:
        return {"error": f"Too many formulas. Maximum is {_FORMULA_IMPORT_MAX} per import.", "status": 400}

    with get_users_db() as conn:
        # Fetch existing formula names in one query to avoid N+1
        existing_names = {
            row["name"]
            for row in conn.execute(
                "SELECT name FROM user_formulas WHERE user_id = ?", (user_id,)
            ).fetchall()
        }
        batch = []
        skipped = 0
        for f in formulas:
            name = f.get("name", "")
            weights = f.get("weights", "")
            if not name or not weights:
                continue
            # Validate weights size to prevent abuse
            if len(str(weights)) > _FORMULA_WEIGHTS_MAX_BYTES:
                skipped += 1
                continue
            if name not in existing_names:
                batch.append((user_id, name, weights))
                existing_names.add(name)  # prevent duplicates within import
        if batch:
            conn.executemany(
                "INSERT INTO user_formulas (user_id, name, weights) VALUES (?, ?, ?)",
                batch,
            )
        conn.commit()
        result = {"status": "ok", "imported": len(batch)}
        if skipped:
            result["skipped"] = skipped
            result["warning"] = f"{skipped} formula(s) skipped — weights exceeded 10 KB limit"
        return result


# ---------------------------------------------------------------------------
# Agent Memory (Elite tier — server-side persistence)
# ---------------------------------------------------------------------------

MEMORY_MAX_PER_USER = 100


def save_agent_memory(user_id: int, scenario: str, findings: str,
                      league_id: str = None, league_name: str = None) -> dict:
    """Save an agent memory entry. findings is a JSON string of agent results."""
    if not scenario or not findings:
        return {"error": "Scenario and findings are required", "status": 400}

    # Cap field sizes to prevent disk exhaustion
    scenario = scenario[:2000]
    findings = findings[:50000]
    if league_name:
        league_name = league_name[:200]

    with get_users_db() as conn:
        # Check count — enforce max per user
        count = conn.execute(
            "SELECT COUNT(*) FROM agent_memory WHERE user_id = ?", (user_id,)
        ).fetchone()[0]

        if count >= MEMORY_MAX_PER_USER:
            # Delete oldest entry to make room
            conn.execute("""
                DELETE FROM agent_memory WHERE id = (
                    SELECT id FROM agent_memory WHERE user_id = ?
                    ORDER BY created_at ASC LIMIT 1
                )
            """, (user_id,))

        conn.execute(
            """INSERT INTO agent_memory (user_id, league_id, league_name, scenario, findings)
               VALUES (?, ?, ?, ?, ?)""",
            (user_id, league_id, league_name, scenario, findings),
        )
        conn.commit()
        return {"status": "ok"}


def get_agent_memories(user_id: int, league_id: str = None,
                       search: str = None, limit: int = 50) -> dict:
    """Retrieve agent memories for a user, optionally filtered by league or keyword."""
    limit = min(limit, 100)

    with get_users_db() as conn:
        params = [user_id]
        where_clauses = ["user_id = ?"]

        if league_id:
            where_clauses.append("league_id = ?")
            params.append(league_id)

        if search:
            escaped_search = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            where_clauses.append("(scenario LIKE ? ESCAPE '\\' OR findings LIKE ? ESCAPE '\\')")
            params.append(f"%{escaped_search}%")
            params.append(f"%{escaped_search}%")

        where = " AND ".join(where_clauses)
        params.append(limit)

        rows = conn.execute(
            f"SELECT id, league_id, league_name, scenario, findings, created_at "
            f"FROM agent_memory WHERE {where} ORDER BY created_at DESC LIMIT ?",
            params,
        ).fetchall()

        memories = []
        for row in rows:
            memories.append({
                "id": row[0],
                "league_id": row[1],
                "league_name": row[2],
                "scenario": row[3],
                "findings": row[4],
                "created_at": row[5],
            })

        return {"memories": memories}


def delete_agent_memory(user_id: int, memory_id: int) -> dict:
    """Delete a specific memory entry owned by this user."""
    with get_users_db() as conn:
        result = conn.execute(
            "DELETE FROM agent_memory WHERE id = ? AND user_id = ?",
            (memory_id, user_id),
        )
        conn.commit()
        if result.rowcount == 0:
            return {"error": "Memory not found", "status": 404}
        return {"status": "ok"}


def get_saved_views(user_id: int) -> dict:
    """Retrieve all saved views for a user."""
    with get_users_db() as conn:
        rows = conn.execute(
            "SELECT id, view_data, created_at FROM user_saved_views WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
        return {"views": [{"id": r[0], "data": r[1], "created_at": r[2]} for r in rows]}


def sync_saved_views(user_id: int, views: list) -> dict:
    """Sync saved views from client. Idempotent — replaces all views for user."""
    import json
    if not isinstance(views, list):
        return {"error": "views must be a list", "status": 400}
    with get_users_db() as conn:
        # Delete existing views for user, then re-insert
        conn.execute("DELETE FROM user_saved_views WHERE user_id = ?", (user_id,))
        count = 0
        for v in views[:20]:  # max 20 views
            try:
                view_data = json.dumps(v) if isinstance(v, dict) else str(v)
                conn.execute(
                    "INSERT INTO user_saved_views (user_id, view_data) VALUES (?, ?)",
                    (user_id, view_data),
                )
                count += 1
            except Exception:
                logger.warning("Failed to sync saved view for user %s", user_id, exc_info=True)
                continue
        conn.commit()
        return {"status": "ok", "synced": count}


# ---------------------------------------------------------------------------
# Watchlist Cloud Sync (Pro+ tier)
# ---------------------------------------------------------------------------

WATCHLIST_MAX = 200


def get_watchlist(user_id: int) -> dict:
    """Retrieve all watchlist items for a user."""
    with get_users_db() as conn:
        rows = conn.execute(
            "SELECT player_id, player_name, position, team, universe, created_at "
            "FROM user_watchlist WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
        return {"watchlist": [
            {"player_id": r[0], "player_name": r[1], "position": r[2],
             "team": r[3], "universe": r[4], "created_at": r[5]}
            for r in rows
        ]}


def sync_watchlist(user_id: int, players: list) -> dict:
    """Sync watchlist from client. Merges by player_id — union strategy."""
    if not isinstance(players, list):
        return {"error": "players must be a list", "status": 400}

    with get_users_db() as conn:
        # Delete and re-insert (full replacement, like saved views)
        conn.execute("DELETE FROM user_watchlist WHERE user_id = ?", (user_id,))
        count = 0
        for p in players[:WATCHLIST_MAX]:
            if not isinstance(p, dict):
                continue
            player_id = p.get("player_id", "")
            if not player_id:
                continue
            try:
                conn.execute(
                    "INSERT INTO user_watchlist (user_id, player_id, player_name, position, team, universe) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (user_id, str(player_id),
                     p.get("player_name", ""),
                     p.get("position", ""),
                     p.get("team", ""),
                     p.get("universe", "nfl")),
                )
                count += 1
            except Exception:
                logger.warning("Failed to sync watchlist item for user %s", user_id, exc_info=True)
                continue
        conn.commit()
        return {"status": "ok", "synced": count}


# ---------------------------------------------------------------------------
# AI Query Tracking (server-side rate limiting for all tiers)
# ---------------------------------------------------------------------------

QUERY_LIMITS = {"free": 5, "pro": 20, "elite": 999999, "pro_lifetime": 20, "elite_lifetime": 999999}  # daily limits per plan


def _ensure_query_tracking_table(conn):
    """No-op — table is now created in initialize_users_db()."""
    pass


def check_query_quota(user_id: int = None, ip_address: str = None, plan: str = "free") -> dict:
    """Check if user/IP has queries remaining today. Returns quota info."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    limit = QUERY_LIMITS.get(plan, 5)

    with get_users_db() as conn:
        _ensure_query_tracking_table(conn)

        if user_id:
            row = conn.execute(
                "SELECT query_count FROM ai_query_log WHERE user_id = ? AND query_date = ?",
                (user_id, today),
            ).fetchone()
        else:
            row = conn.execute(
                "SELECT query_count FROM ai_query_log WHERE ip_address = ? AND user_id IS NULL AND query_date = ?",
                (ip_address or "unknown", today),
            ).fetchone()

        used = row[0] if row else 0
        remaining = max(0, limit - used)

        return {
            "allowed": remaining > 0,
            "used": used,
            "limit": limit,
            "remaining": remaining,
            "plan": plan,
        }


def record_query(user_id: int = None, ip_address: str = None) -> dict:
    """Record an AI query for rate limiting. Returns updated quota."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    with get_users_db() as conn:
        _ensure_query_tracking_table(conn)

        if user_id:
            row = conn.execute(
                "SELECT id, query_count FROM ai_query_log WHERE user_id = ? AND query_date = ?",
                (user_id, today),
            ).fetchone()
            if row:
                conn.execute(
                    "UPDATE ai_query_log SET query_count = query_count + 1 WHERE id = ?",
                    (row[0],),
                )
                count = row[1] + 1
            else:
                conn.execute(
                    "INSERT INTO ai_query_log (user_id, ip_address, query_date, query_count) VALUES (?, ?, ?, 1)",
                    (user_id, ip_address, today),
                )
                count = 1
        else:
            ip = ip_address or "unknown"
            row = conn.execute(
                "SELECT id, query_count FROM ai_query_log WHERE ip_address = ? AND user_id IS NULL AND query_date = ?",
                (ip, today),
            ).fetchone()
            if row:
                conn.execute(
                    "UPDATE ai_query_log SET query_count = query_count + 1 WHERE id = ?",
                    (row[0],),
                )
                count = row[1] + 1
            else:
                conn.execute(
                    "INSERT INTO ai_query_log (ip_address, query_date, query_count) VALUES (?, ?, 1)",
                    (ip, today),
                )
                count = 1

        conn.commit()
        return {"recorded": True, "count": count}


# ---------------------------------------------------------------------------
# Weekly Briefings (Elite tier)
# ---------------------------------------------------------------------------

def save_weekly_briefing(user_id: int, league_id: str, league_name: str,
                         week_label: str, summary: str,
                         urgency_items: str = "[]",
                         monitor_items: str = "[]",
                         opportunity_items: str = "[]",
                         agent_highlights: str = "[]") -> dict:
    """Save a weekly briefing for an Elite user."""
    # Cap field sizes to prevent disk exhaustion
    summary = (summary or "")[:10000]
    urgency_items = (urgency_items or "[]")[:10000]
    monitor_items = (monitor_items or "[]")[:10000]
    opportunity_items = (opportunity_items or "[]")[:10000]
    agent_highlights = (agent_highlights or "[]")[:10000]
    league_name = (league_name or "")[:200]
    week_label = (week_label or "")[:50]

    with get_users_db() as conn:
        # Upsert: replace if same user+week+league already exists
        conn.execute(
            "DELETE FROM weekly_briefings WHERE user_id = ? AND week_label = ? AND league_id = ?",
            (user_id, week_label, league_id or ""),
        )
        conn.execute(
            """INSERT INTO weekly_briefings
               (user_id, league_id, league_name, week_label, summary,
                urgency_items, monitor_items, opportunity_items, agent_highlights)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, league_id or "", league_name or "", week_label, summary,
             urgency_items, monitor_items, opportunity_items, agent_highlights),
        )
        conn.commit()
        return {"saved": True, "week_label": week_label}


def get_latest_briefing(user_id: int, league_id: str = None) -> dict:
    """Get the most recent weekly briefing for a user (optionally filtered by league)."""
    with get_users_db() as conn:
        if league_id:
            row = conn.execute(
                """SELECT * FROM weekly_briefings
                   WHERE user_id = ? AND league_id = ?
                   ORDER BY created_at DESC LIMIT 1""",
                (user_id, league_id),
            ).fetchone()
        else:
            row = conn.execute(
                """SELECT * FROM weekly_briefings
                   WHERE user_id = ?
                   ORDER BY created_at DESC LIMIT 1""",
                (user_id,),
            ).fetchone()
        if not row:
            return None
        return dict(row)


def get_briefing_by_id(user_id: int, briefing_id: int) -> dict:
    """Get a specific briefing by ID (only if owned by user)."""
    with get_users_db() as conn:
        row = conn.execute(
            "SELECT * FROM weekly_briefings WHERE id = ? AND user_id = ?",
            (briefing_id, user_id),
        ).fetchone()
        return dict(row) if row else None


def get_briefing_history(user_id: int, limit: int = 10) -> list:
    """Get recent briefing history for a user."""
    with get_users_db() as conn:
        rows = conn.execute(
            """SELECT * FROM weekly_briefings
               WHERE user_id = ?
               ORDER BY created_at DESC LIMIT ?""",
            (user_id, min(limit, 50)),
        ).fetchall()
        return [dict(r) for r in rows]


def clear_agent_memories(user_id: int, league_id: str = None) -> dict:
    """Clear all memories for a user (optionally scoped to a league)."""
    with get_users_db() as conn:
        if league_id:
            conn.execute(
                "DELETE FROM agent_memory WHERE user_id = ? AND league_id = ?",
                (user_id, league_id),
            )
        else:
            conn.execute(
                "DELETE FROM agent_memory WHERE user_id = ?", (user_id,)
            )
        conn.commit()
        return {"status": "ok"}


# ---------------------------------------------------------------------------
# BYOK API Key Management (encrypted at rest, never logged)
# ---------------------------------------------------------------------------

# Derive a Fernet key from ENCRYPTION_KEY env var (or JWT_SECRET as fallback).
# Fernet requires a 32-byte URL-safe base64-encoded key.
_ENCRYPTION_KEY_RAW = os.environ.get("ENCRYPTION_KEY")
if not _ENCRYPTION_KEY_RAW:
    if _ENVIRONMENT == "production":
        raise RuntimeError(
            "ENCRYPTION_KEY environment variable is required in production. "
            "Set it to a stable, random string (e.g. `python -c \"import secrets; print(secrets.token_hex(32))\"`)."
        )
    _ENCRYPTION_KEY_RAW = JWT_SECRET
    print(
        "WARNING: ENCRYPTION_KEY not set — falling back to JWT_SECRET for encryption. "
        "Set ENCRYPTION_KEY for independent key rotation.",
        file=sys.stderr,
    )
    logger.warning("ENCRYPTION_KEY not set — falling back to JWT_SECRET for API key encryption")
_FERNET_KEY = base64.urlsafe_b64encode(
    hashlib.sha256(_ENCRYPTION_KEY_RAW.encode("utf-8")).digest()
)
_fernet = Fernet(_FERNET_KEY)

# Valid provider names (prevent arbitrary key storage)
VALID_PROVIDERS = frozenset(["openrouter", "anthropic", "openai", "custom"])


def _ensure_api_keys_table(conn):
    """No-op — table is now created in initialize_users_db()."""
    pass


def _encrypt_key(plaintext: str) -> bytes:
    """Encrypt an API key. Returns encrypted bytes. Never log the plaintext."""
    return _fernet.encrypt(plaintext.encode("utf-8"))


def _decrypt_key(encrypted: bytes) -> str:
    """Decrypt an API key. Returns plaintext string. Never log the result."""
    return _fernet.decrypt(encrypted).decode("utf-8")


def save_api_key(user_id: int, provider: str, api_key: str, label: str = None) -> dict:
    """Store an encrypted API key for a user. Overwrites existing key for the provider."""
    if provider not in VALID_PROVIDERS:
        return {"error": f"Invalid provider. Must be one of: {', '.join(sorted(VALID_PROVIDERS))}"}

    if not api_key or len(api_key) < 10:
        return {"error": "API key too short"}

    if len(api_key) > 500:
        return {"error": "API key too long"}

    encrypted = _encrypt_key(api_key)

    with get_users_db() as conn:
        _ensure_api_keys_table(conn)
        # Upsert: delete existing, insert new
        conn.execute(
            "DELETE FROM user_api_keys WHERE user_id = ? AND provider = ?",
            (user_id, provider),
        )
        conn.execute(
            """INSERT INTO user_api_keys (user_id, provider, encrypted_key, label, updated_at)
               VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)""",
            (user_id, provider, encrypted, label or provider),
        )
        conn.commit()

    # Log the save event but NEVER the key value
    logger.info("API key saved for user %d, provider %s", user_id, provider)
    return {"status": "ok", "provider": provider}


def get_api_keys(user_id: int) -> list:
    """List stored API keys for a user. Returns provider names and labels, NEVER key values."""
    with get_users_db() as conn:
        _ensure_api_keys_table(conn)
        rows = conn.execute(
            """SELECT provider, label, created_at, updated_at
               FROM user_api_keys WHERE user_id = ?
               ORDER BY provider""",
            (user_id,),
        ).fetchall()
        return [
            {
                "provider": r["provider"],
                "label": r["label"],
                "created_at": r["created_at"],
                "updated_at": r["updated_at"],
                "has_key": True,
            }
            for r in rows
        ]


def get_api_key_decrypted(user_id: int, provider: str) -> str:
    """Retrieve and decrypt an API key. Returns the plaintext key or None.
    SECURITY: This function returns sensitive data. Never log its output.
    Only call this when the key is needed for an LLM API call."""
    if provider not in VALID_PROVIDERS:
        return None

    with get_users_db() as conn:
        _ensure_api_keys_table(conn)
        row = conn.execute(
            "SELECT encrypted_key FROM user_api_keys WHERE user_id = ? AND provider = ?",
            (user_id, provider),
        ).fetchone()
        if not row:
            return None
        try:
            return _decrypt_key(row["encrypted_key"])
        except Exception:
            logger.error("Failed to decrypt API key for user %d, provider %s", user_id, provider)
            return None


def delete_api_key(user_id: int, provider: str) -> dict:
    """Delete a stored API key for a user."""
    if provider not in VALID_PROVIDERS:
        return {"error": "Invalid provider"}

    with get_users_db() as conn:
        _ensure_api_keys_table(conn)
        result = conn.execute(
            "DELETE FROM user_api_keys WHERE user_id = ? AND provider = ?",
            (user_id, provider),
        )
        conn.commit()
        if result.rowcount > 0:
            logger.info("API key deleted for user %d, provider %s", user_id, provider)
            return {"status": "ok", "provider": provider}
        return {"status": "not_found", "provider": provider}
