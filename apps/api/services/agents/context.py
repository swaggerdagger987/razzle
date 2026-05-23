"""Context injection — league + player facts for agent prompts."""

from __future__ import annotations

import logging
from typing import Any

from ..context.store import get_or_refresh
from ...legacy_bridge import live_data
from ..bureau.player_status import roster_status_line
from ..intel.snippets import intel_lines_for_prompt
from .facts import facts as build_facts

logger = logging.getLogger("razzle.agents.context")

_PANEL_LABELS = {
    "dashboard": "Dynasty Dashboard",
    "weekly": "Weekly Heatmap",
    "rankings": "Dynasty Rankings",
    "tradevalues": "Trade Values",
    "breakouts": "Breakouts",
    "prospects": "Prospects",
    "gamelog": "Game Log",
    "efficiency": "Efficiency Rankings",
    "aging": "Aging Curves",
    "buysell": "Buy / Sell",
    "player-intel": "Player Intel",
}


def build_context_block(
    league_id: str | None,
    league_format: str,
    *,
    player_id: str | None = None,
    user_id: str | None = None,
    referrer_panel: str | None = None,
) -> str:
    """Markdown context block injected into every agent prompt."""
    f = build_facts(league_id=league_id)
    lines = ["## Context for this query", f"- Format: {league_format}"]

    if referrer_panel:
        label = _PANEL_LABELS.get(referrer_panel, referrer_panel.replace("-", " ").title())
        lines.append(
            f"- Hallway: user opened Situation Room from Lab **{label}** — reference that surface if relevant."
        )

    if league_id:
        lines.append(f"- Sleeper league: {league_id}")
        league_block = _league_context(league_id, user_id)
        if league_block:
            lines.append(league_block)

    if player_id:
        player_block = _player_context(player_id)
        if player_block:
            lines.append(player_block)
        if league_id and user_id:
            roster_line = roster_status_line(league_id, user_id, player_id)
            if roster_line:
                lines.append(roster_line)
        intel_lines = intel_lines_for_prompt(player_id, None)
        if intel_lines:
            lines.append("- Intel snippets:")
            lines.extend(intel_lines)

    if f.get("injuries"):
        lines.append("- Active injuries (top 10):")
        for inj in f["injuries"][:10]:
            name = inj.get("player_name") or inj.get("full_name") or "?"
            status = inj.get("status") or inj.get("injury_status") or "?"
            note = inj.get("description") or inj.get("note") or ""
            lines.append(f"  - {name}: {status}{f' — {note}' if note else ''}")

    if f.get("trending_adds"):
        names = ", ".join(p.get("player_name") or p.get("name") or "?" for p in f["trending_adds"][:6])
        lines.append(f"- Trending waiver adds: {names}")

    return "\n".join(lines)


def _league_context(league_id: str, user_id: str | None) -> str:
    try:
        ctx = get_or_refresh(league_id)
        if not ctx:
            return "- League context: unavailable (fetch failed)"

        parts = [
            f"- League: {ctx.name} ({ctx.season}, {ctx.total_rosters} teams)",
        ]

        if user_id:
            roster = ctx.roster_for_user(user_id)
            if roster:
                parts.append(f"- Your record: {roster.wins}-{roster.losses}-{roster.ties}, {roster.points_for:.1f} PF")
                parts.append(f"- Roster size: {len(roster.players)} players")

        # Standings snippet
        ranked = sorted(ctx.rosters, key=lambda r: r.points_for, reverse=True)
        parts.append("- Power board (by PF):")
        for i, r in enumerate(ranked[:6], 1):
            u = ctx.user_for_roster(r.roster_id)
            label = (u.team_name if u and u.team_name else None) or (u.display_name if u else f"Team {r.roster_id}")
            parts.append(f"  {i}. {label}: {r.points_for:.1f} PF")

        return "\n".join(parts)
    except Exception:  # noqa: BLE001
        logger.exception("league context build failed")
        return "- League context: error loading"


def _player_context(player_id: str) -> str:
    try:
        profile = live_data().fetch_player_profile(player_id)
        player = profile.get("player") or {}
        if not player.get("full_name"):
            return f"- Player id {player_id}: not found in database"

        lines = [
            f"- Player focus: {player.get('full_name')} ({player.get('position')}, {player.get('team') or 'FA'})",
        ]
        if player.get("age"):
            lines.append(f"  - Age: {player['age']}")
        if player.get("college"):
            lines.append(f"  - College: {player['college']}")

        seasons = profile.get("seasons") or []
        if seasons:
            latest = seasons[-1]
            lines.append(
                f"  - Latest season ({latest.get('season')}): "
                f"{latest.get('games')} GP, {latest.get('fantasy_points_ppr', 0):.1f} PPR pts"
            )

        combine = profile.get("combine")
        if combine:
            lines.append(f"  - Draft: {combine.get('draft_year')} rd {combine.get('draft_round')} pick {combine.get('draft_pick')}")

        return "\n".join(lines)
    except Exception:  # noqa: BLE001
        logger.exception("player context build failed")
        return f"- Player id {player_id}: profile unavailable"
