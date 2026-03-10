"""
Razzle auth module — user registration, login, JWT tokens.
Uses a separate users.db to persist across terminal.db rebuilds.
"""

import os
import re
import secrets
import sqlite3
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path

import bcrypt
import jwt

logger = logging.getLogger("razzle")

USERS_DB_PATH = Path(__file__).parent.parent / "data" / "users.db"

# JWT config
JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    JWT_SECRET = secrets.token_hex(32)
    logger.warning("JWT_SECRET not set — using random key (tokens will expire on restart)")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def get_users_conn():
    """Get connection to users.db (separate from terminal.db)."""
    USERS_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(USERS_DB_PATH), timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def initialize_users_db():
    """Create users tables if they don't exist."""
    conn = get_users_conn()
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
    """)
    conn.commit()
    conn.close()
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
    return d


def register(email: str, password: str) -> dict:
    """Register a new user. Returns {token, user}."""
    email = email.strip().lower()
    if not EMAIL_REGEX.match(email):
        return {"error": "Invalid email format", "status": 400}
    if len(password) < 6:
        return {"error": "Password must be at least 6 characters", "status": 400}

    conn = get_users_conn()
    try:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            conn.close()
            return {"error": "Email already registered", "status": 409}

        password_hash = _hash_password(password)
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (email, password_hash),
        )
        conn.commit()
        user_id = cursor.lastrowid
        user = {"id": user_id, "email": email, "plan": "free", "sleeper_username": None}
        token = _create_token(user_id, email, "free")
        conn.close()
        return {"token": token, "user": user}
    except Exception as e:
        conn.close()
        logger.error(f"Registration error: {e}")
        return {"error": "Registration failed. Please try again.", "status": 500}


def login(email: str, password: str) -> dict:
    """Login user. Returns {token, user}."""
    email = email.strip().lower()
    conn = get_users_conn()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not row:
        conn.close()
        return {"error": "User not found", "status": 404}

    if not _verify_password(password, row["password_hash"]):
        conn.close()
        return {"error": "Invalid password", "status": 401}

    user = _user_dict(row)
    token = _create_token(user["id"], user["email"], user["plan"])
    conn.close()
    return {"token": token, "user": user}


def get_current_user(token: str) -> dict:
    """Verify token and return user info."""
    try:
        payload = _decode_token(token)
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired", "status": 401}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token", "status": 401}

    conn = get_users_conn()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (payload["user_id"],)).fetchone()
    conn.close()
    if not row:
        return {"error": "User not found", "status": 401}

    return {"user": _user_dict(row)}


def link_sleeper(user_id: int, sleeper_username: str) -> dict:
    """Link a Sleeper username to user account."""
    conn = get_users_conn()
    conn.execute(
        "UPDATE users SET sleeper_username = ? WHERE id = ?",
        (sleeper_username, user_id),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if not row:
        return {"error": "User not found", "status": 404}
    return {"user": _user_dict(row)}


# ── User Formula CRUD ──────────────────────────────────────────────

def get_user_formulas(user_id: int) -> dict:
    conn = get_users_conn()
    rows = conn.execute(
        "SELECT id, name, weights, created_at, updated_at FROM user_formulas WHERE user_id = ? ORDER BY updated_at DESC",
        (user_id,),
    ).fetchall()
    conn.close()
    return {"formulas": [dict(r) for r in rows]}


def save_user_formula(user_id: int, name: str, weights: str) -> dict:
    if not name or not weights:
        return {"error": "Name and weights required", "status": 400}
    conn = get_users_conn()
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
    conn.close()
    return {"status": "ok", "formula_id": formula_id}


def delete_user_formula(user_id: int, formula_id: int) -> dict:
    conn = get_users_conn()
    row = conn.execute("SELECT user_id FROM user_formulas WHERE id = ?", (formula_id,)).fetchone()
    if not row:
        conn.close()
        return {"error": "Formula not found", "status": 404}
    if row["user_id"] != user_id:
        conn.close()
        return {"error": "Not your formula", "status": 403}
    conn.execute("DELETE FROM user_formulas WHERE id = ?", (formula_id,))
    conn.commit()
    conn.close()
    return {"status": "ok"}


def import_formulas(user_id: int, formulas: list) -> dict:
    conn = get_users_conn()
    imported = 0
    for f in formulas:
        name = f.get("name", "")
        weights = f.get("weights", "")
        if not name or not weights:
            continue
        existing = conn.execute(
            "SELECT id FROM user_formulas WHERE user_id = ? AND name = ?",
            (user_id, name),
        ).fetchone()
        if not existing:
            conn.execute(
                "INSERT INTO user_formulas (user_id, name, weights) VALUES (?, ?, ?)",
                (user_id, name, weights),
            )
            imported += 1
    conn.commit()
    conn.close()
    return {"status": "ok", "imported": imported}
