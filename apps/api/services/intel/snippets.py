"""Generate human-readable intel snippets for players and teams."""

from __future__ import annotations

import sqlite3
from typing import Any

from ...db import get_db


def _ordinal(n: int) -> str:
    suffix = "th" if 10 <= n % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def _norm_name(name: str) -> str:
    return "".join(c for c in name.lower() if c.isalnum() or c.isspace()).strip()


def _snippet(
    *,
    category: str,
    text: str,
    agent_id: str,
    priority: int = 50,
    source: str,
    player_id: str | None = None,
    team: str | None = None,
) -> dict[str, Any]:
    return {
        "category": category,
        "text": text,
        "agent_id": agent_id,
        "priority": priority,
        "source": source,
        "player_id": player_id,
        "team": team,
    }


def _player_row(conn: sqlite3.Connection, player_id: str) -> sqlite3.Row | None:
    return conn.execute(
        "SELECT player_id, full_name, position, team FROM players WHERE player_id = ?",
        (player_id,),
    ).fetchone()


def _team_tendency_snippets(conn: sqlite3.Connection, team: str, season: int | None = None) -> list[dict]:
    if not team:
        return []
    if season is None:
        season = conn.execute("SELECT MAX(season) FROM team_tendencies").fetchone()[0]
    if not season:
        return []

    row = conn.execute(
        "SELECT * FROM team_tendencies WHERE season = ? AND team = ?",
        (season, team),
    ).fetchone()
    if not row:
        return []

    out: list[dict] = []
    rank = int(row["rb_friendly_rank"] or 99)
    rb_share = float(row["rb_carry_share"] or 0) * 100
    rb_tgt = float(row["rb_target_share"] or 0) * 100

    if rank <= 8:
        out.append(
            _snippet(
                category="coaching",
                text=(
                    f"{team}'s offense is {_ordinal(rank)}-most RB-friendly by usage "
                    f"({rb_share:.0f}% of carries to RBs, {rb_tgt:.0f}% of targets)."
                ),
                agent_id="hawkeye",
                priority=80 - rank,
                source="team_tendencies",
                team=team,
            )
        )
    elif rank >= 28:
        out.append(
            _snippet(
                category="coaching",
                text=(
                    f"{team} is pass-heavier than most — RBs see only {rb_share:.0f}% of carries "
                    f"(rank {_ordinal(rank)} in RB usage)."
                ),
                agent_id="hawkeye",
                priority=40,
                source="team_tendencies",
                team=team,
            )
        )

    pass_rank = int(row["pass_heavy_rank"] or 99)
    if pass_rank <= 5:
        out.append(
            _snippet(
                category="coaching",
                text=f"{team} ranks {_ordinal(pass_rank)} in pass rate — volume funnels to WRs and TEs.",
                agent_id="hawkeye",
                priority=55,
                source="team_tendencies",
                team=team,
            )
        )
    return out


def _contract_snippets(conn: sqlite3.Connection, player_name: str, team: str | None) -> list[dict]:
    norm = _norm_name(player_name)
    rows = conn.execute(
        """
        SELECT * FROM player_contracts
        WHERE normalized_name = ?
        ORDER BY year_signed DESC, value DESC
        LIMIT 3
        """,
        (norm,),
    ).fetchall()

    if not rows and team:
        rows = conn.execute(
            """
            SELECT * FROM player_contracts
            WHERE normalized_name LIKE ? AND team = ?
            ORDER BY year_signed DESC, value DESC
            LIMIT 2
            """,
            (f"%{norm.split()[0]}%", team),
        ).fetchall()

    out: list[dict] = []
    for r in rows:
        years = int(r["years"] or 0)
        apy_m = float(r["apy"] or 0) / 1_000_000
        value_m = float(r["value"] or 0) / 1_000_000
        yr = int(r["year_signed"] or 0)
        active = int(r["is_active"] or 0)
        label = "active deal" if active else f"{yr} signing"
        out.append(
            _snippet(
                category="contract",
                text=(
                    f"{r['player_name']}: {years}-year, ${value_m:.1f}M total "
                    f"(${apy_m:.1f}M APY) — {label}."
                ),
                agent_id="bones",
                priority=70 if active else 45,
                source="overthecap",
                team=r["team"],
            )
        )
    return out


def _news_snippets(conn: sqlite3.Connection, player_name: str) -> list[dict]:
    last = player_name.split()[-1].lower() if player_name else ""
    if len(last) < 3:
        return []
    rows = conn.execute(
        """
        SELECT title, summary FROM intel_news
        WHERE category = 'contract_news' AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ?)
        ORDER BY id DESC LIMIT 2
        """,
        (f"%{last}%", f"%{last}%"),
    ).fetchall()
    return [
        _snippet(
            category="contract_news",
            text=r["title"],
            agent_id="bones",
            priority=90,
            source="espn_rss",
        )
        for r in rows
    ]


def intel_for_team(team: str, *, season: int | None = None) -> list[dict[str, Any]]:
    with get_db() as conn:
        return _team_tendency_snippets(conn, team.upper(), season)


def intel_for_player(player_id: str) -> list[dict[str, Any]]:
    with get_db() as conn:
        player = _player_row(conn, player_id)
        if not player:
            return []

        snippets: list[dict] = []
        snippets.extend(_team_tendency_snippets(conn, player["team"] or ""))
        snippets.extend(_contract_snippets(conn, player["full_name"], player["team"]))
        snippets.extend(_news_snippets(conn, player["full_name"]))

        if player["position"] == "RB" and player["team"]:
            row = conn.execute(
                "SELECT rb_friendly_rank FROM team_tendencies WHERE team = ? ORDER BY season DESC LIMIT 1",
                (player["team"],),
            ).fetchone()
            if row and int(row["rb_friendly_rank"] or 99) <= 5:
                snippets.append(
                    _snippet(
                        category="coaching",
                        text=(
                            f"Scheme fit: {player['team']} is a top-5 RB usage offense — "
                            f"this is one of the best landing spots for volume."
                        ),
                        agent_id="hawkeye",
                        priority=85,
                        source="team_tendencies",
                        player_id=player_id,
                        team=player["team"],
                    )
                )

        snippets.sort(key=lambda s: -int(s.get("priority") or 0))
        for s in snippets:
            s.setdefault("player_id", player_id)
        return snippets[:8]


def intel_lines_for_prompt(player_id: str | None, team: str | None) -> list[str]:
    """Markdown lines for agent context block."""
    lines: list[str] = []
    if player_id:
        for s in intel_for_player(player_id):
            lines.append(f"- [{s['category']}] {s['text']}")
    elif team:
        for s in intel_for_team(team):
            lines.append(f"- [{s['category']}] {s['text']}")
    return lines[:6]
