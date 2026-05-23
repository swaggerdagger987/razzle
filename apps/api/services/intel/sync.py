"""Sync intel tables — contracts (OTC/nflverse) + team tendencies (computed)."""

from __future__ import annotations

import csv
import gzip
import io
import logging
import sqlite3
import urllib.request
from pathlib import Path

logger = logging.getLogger("razzle.intel.sync")

CONTRACTS_URL = (
    "https://github.com/nflverse/nflverse-data/releases/download/contracts/historical_contracts.csv.gz"
)
UA = "razzle/2.0 (+https://razzle.lol)"


def _init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS player_contracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT NOT NULL,
            position TEXT,
            team TEXT,
            year_signed INTEGER,
            years INTEGER,
            value REAL,
            apy REAL,
            guaranteed REAL,
            is_active INTEGER DEFAULT 0,
            player_page TEXT,
            normalized_name TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_contracts_norm ON player_contracts(normalized_name);
        CREATE INDEX IF NOT EXISTS idx_contracts_team ON player_contracts(team, year_signed DESC);

        CREATE TABLE IF NOT EXISTS team_tendencies (
            season INTEGER NOT NULL,
            team TEXT NOT NULL,
            rb_carry_share REAL,
            rb_target_share REAL,
            rush_rate REAL,
            pass_rate REAL,
            rb_friendly_rank INTEGER,
            pass_heavy_rank INTEGER,
            PRIMARY KEY (season, team)
        );

        CREATE TABLE IF NOT EXISTS intel_news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fetched_at TEXT,
            title TEXT NOT NULL,
            summary TEXT,
            category TEXT,
            matched_player_id TEXT,
            matched_team TEXT
        );
        """
    )


def _norm_name(name: str) -> str:
    return "".join(c for c in name.lower() if c.isalnum() or c.isspace()).strip()


def _fetch_contracts() -> list[dict]:
    req = urllib.request.Request(CONTRACTS_URL, headers={"User-Agent": UA})
    raw = gzip.decompress(urllib.request.urlopen(req, timeout=60).read())
    return list(csv.DictReader(io.StringIO(raw.decode("utf-8"))))


def _sync_contracts(conn: sqlite3.Connection) -> int:
    rows = _fetch_contracts()
    conn.execute("DELETE FROM player_contracts")
    batch = []
    for r in rows:
        try:
            batch.append(
                (
                    r.get("player") or "",
                    r.get("position"),
                    r.get("team"),
                    int(r["year_signed"]) if r.get("year_signed") else None,
                    int(float(r["years"])) if r.get("years") else None,
                    float(r["value"]) if r.get("value") else None,
                    float(r["apy"]) if r.get("apy") else None,
                    float(r["guaranteed"]) if r.get("guaranteed") else None,
                    1 if str(r.get("is_active", "")).upper() == "TRUE" else 0,
                    r.get("player_page"),
                    _norm_name(r.get("player") or ""),
                )
            )
        except (ValueError, TypeError):
            continue
    conn.executemany(
        """
        INSERT INTO player_contracts (
            player_name, position, team, year_signed, years, value, apy, guaranteed,
            is_active, player_page, normalized_name
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """,
        batch,
    )
    return len(batch)


def _sync_team_tendencies(conn: sqlite3.Connection, season: int | None = None) -> int:
    if season is None:
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        season = int(row[0] or 2024)

    conn.execute("DELETE FROM team_tendencies WHERE season = ?", (season,))

    rows = conn.execute(
        """
        SELECT
            p.team AS team,
            SUM(CASE WHEN p.position = 'RB' THEN COALESCE(pws.carries, 0) ELSE 0 END) AS rb_carries,
            SUM(COALESCE(pws.carries, 0)) AS total_carries,
            SUM(CASE WHEN p.position = 'RB' THEN COALESCE(pws.targets, 0) ELSE 0 END) AS rb_targets,
            SUM(COALESCE(pws.targets, 0)) AS total_targets,
            SUM(CASE WHEN p.position = 'QB' THEN COALESCE(pws.attempts, 0) ELSE 0 END) AS pass_attempts
        FROM player_week_stats pws
        JOIN players p ON p.player_id = pws.player_id
        WHERE pws.season = ? AND p.team IS NOT NULL AND p.team != ''
        GROUP BY p.team
        """,
        (season,),
    ).fetchall()

    computed: list[tuple] = []
    for r in rows:
        team = r["team"]
        total_carries = float(r["total_carries"] or 0)
        rb_carries = float(r["rb_carries"] or 0)
        total_targets = float(r["total_targets"] or 0)
        rb_targets = float(r["rb_targets"] or 0)
        pass_attempts = float(r["pass_attempts"] or 0)
        rb_carry_share = rb_carries / total_carries if total_carries else 0.0
        rb_target_share = rb_targets / total_targets if total_targets else 0.0
        rush_rate = total_carries / (total_carries + pass_attempts) if (total_carries + pass_attempts) else 0.0
        pass_rate = pass_attempts / (total_carries + pass_attempts) if (total_carries + pass_attempts) else 0.0
        computed.append(
            (season, team, rb_carry_share, rb_target_share, rush_rate, pass_rate, 0, 0)
        )

    # Rank RB-friendly (carry share + target share)
    scored = sorted(
        computed,
        key=lambda x: (x[2] + x[3]) / 2,
        reverse=True,
    )
    rank_map = {item[1]: i + 1 for i, item in enumerate(scored)}

    pass_sorted = sorted(computed, key=lambda x: x[5], reverse=True)
    pass_rank = {item[1]: i + 1 for i, item in enumerate(pass_sorted)}

    final = [
        (s, t, rcs, rts, rr, pr, rank_map.get(t, 99), pass_rank.get(t, 99))
        for s, t, rcs, rts, rr, pr, _, _ in computed
    ]

    conn.executemany(
        """
        INSERT INTO team_tendencies (
            season, team, rb_carry_share, rb_target_share, rush_rate, pass_rate,
            rb_friendly_rank, pass_heavy_rank
        ) VALUES (?,?,?,?,?,?,?,?)
        """,
        final,
    )
    return len(final)


def _sync_espn_contract_news(conn: sqlite3.Connection) -> int:
    from ...legacy_bridge import agent_facts

    af = agent_facts()
    if not hasattr(af, "espn_news"):
        return 0

    keywords = ("contract", "extension", "signs", "signed", "deal", "million", "guaranteed", "franchise tag")
    items = af.espn_news(limit=24)
    conn.execute("DELETE FROM intel_news")
    count = 0
    for item in items:
        title = (item.get("title") or "").lower()
        if not any(k in title for k in keywords):
            continue
        conn.execute(
            """
            INSERT INTO intel_news (fetched_at, title, summary, category)
            VALUES (datetime('now'), ?, ?, 'contract_news')
            """,
            (item.get("title"), item.get("summary")),
        )
        count += 1
    return count


def sync_intel(db_path: Path) -> dict[str, int]:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    try:
        _init_schema(conn)
        contracts = _sync_contracts(conn)
        tendencies = _sync_team_tendencies(conn)
        news = _sync_espn_contract_news(conn)
        conn.commit()
        logger.info("intel sync: contracts=%s tendencies=%s news=%s", contracts, tendencies, news)
        return {"contracts": contracts, "team_tendencies": tendencies, "contract_news": news}
    finally:
        conn.close()
