"""Pydantic models for bureau API."""

from __future__ import annotations

from pydantic import BaseModel


class LeagueRef(BaseModel):
    league_id: str
    user_id: str


class H2HRef(LeagueRef):
    opponent_user_id: str | None = None


class ScenarioTradeRef(LeagueRef):
    give_player_id: str
    get_player_id: str
    partner_roster_id: int
    scoring: str = "half_ppr"


class PlayerLeagueRef(LeagueRef):
    player_id: str
