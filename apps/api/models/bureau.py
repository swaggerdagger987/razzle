"""Pydantic models for bureau API."""

from __future__ import annotations

from pydantic import BaseModel


class LeagueRef(BaseModel):
    league_id: str
    user_id: str


class H2HRef(LeagueRef):
    opponent_user_id: str


class PlayerLeagueRef(LeagueRef):
    player_id: str
