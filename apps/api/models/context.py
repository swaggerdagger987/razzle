"""Pydantic models for league context API."""

from __future__ import annotations

from pydantic import BaseModel


class LeagueContextResponse(BaseModel):
    league_id: str
    name: str
    season: int
    sport: str
    total_rosters: int
    roster_positions: list[str]
    cached: bool = False
    fetched_at: float | None = None
    expires_at: float | None = None


class RefreshResponse(BaseModel):
    league_id: str
    refreshed: bool
    expires_at: float | None = None
