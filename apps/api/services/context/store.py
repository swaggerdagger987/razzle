"""Persist league context snapshots with TTL."""

from __future__ import annotations

import json
import logging
import sqlite3
import time
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

from ...config import get_settings
from .loader import LeagueContext, fetch_league

logger = logging.getLogger("razzle.context.store")


def _cache_db_path() -> Path:
    return get_settings().data_dir / "api_cache.db"


@contextmanager
def _conn() -> Iterator[sqlite3.Connection]:
    path = _cache_db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path), timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def _ensure_table(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS league_snapshots (
            league_id TEXT PRIMARY KEY,
            payload TEXT NOT NULL,
            fetched_at REAL NOT NULL,
            expires_at REAL NOT NULL
        )
        """
    )


def save_snapshot(ctx: LeagueContext, ttl: int) -> None:
    now = time.time()
    with _conn() as conn:
        _ensure_table(conn)
        conn.execute(
            """
            INSERT INTO league_snapshots (league_id, payload, fetched_at, expires_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(league_id) DO UPDATE SET
                payload = excluded.payload,
                fetched_at = excluded.fetched_at,
                expires_at = excluded.expires_at
            """,
            (ctx.league_id, json.dumps(ctx.to_dict()), now, now + ttl),
        )


def get_cached(league_id: str) -> LeagueContext | None:
    now = time.time()
    with _conn() as conn:
        _ensure_table(conn)
        row = conn.execute(
            "SELECT payload, expires_at FROM league_snapshots WHERE league_id = ?",
            (league_id,),
        ).fetchone()
    if not row or row["expires_at"] <= now:
        return None
    try:
        return LeagueContext.from_dict(json.loads(row["payload"]))
    except (json.JSONDecodeError, KeyError, TypeError):
        logger.warning("corrupt league snapshot for %s", league_id)
        return None


def invalidate(league_id: str) -> None:
    with _conn() as conn:
        _ensure_table(conn)
        conn.execute("DELETE FROM league_snapshots WHERE league_id = ?", (league_id,))


def get_or_refresh(league_id: str, *, force: bool = False, ttl: int | None = None) -> LeagueContext | None:
    """Return cached context or fetch from Sleeper and persist."""
    ttl_seconds = ttl if ttl is not None else get_settings().context_ttl_seconds
    if force:
        invalidate(league_id)
    elif not force:
        cached = get_cached(league_id)
        if cached:
            return cached
    ctx = fetch_league(league_id)
    if ctx:
        save_snapshot(ctx, ttl_seconds)
    return ctx


def snapshot_meta(league_id: str) -> dict | None:
    with _conn() as conn:
        _ensure_table(conn)
        row = conn.execute(
            "SELECT fetched_at, expires_at FROM league_snapshots WHERE league_id = ?",
            (league_id,),
        ).fetchone()
    if not row:
        return None
    return {
        "league_id": league_id,
        "fetched_at": row["fetched_at"],
        "expires_at": row["expires_at"],
        "cached": row["expires_at"] > time.time(),
    }
