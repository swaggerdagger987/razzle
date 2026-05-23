"""Pydantic models for the screener API.

These are the typed request/response shapes. The OpenAPI schema generated
from them feeds the TypeScript client in `packages/types`, so a frontend
change that violates the contract fails at build time, not at runtime.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Position = Literal["QB", "RB", "WR", "TE"]
Universe = Literal["nfl", "college", "prospects"]
SortDir = Literal["asc", "desc"]
FilterOp = Literal["gte", "lte", "eq", "ne", "gt", "lt"]


class ScreenerFilter(BaseModel):
    key: str = Field(..., description="Stat column name, e.g. 'fantasy_points_ppr'")
    op: FilterOp
    value: float


class ScreenerQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")

    search: str = ""
    positions: list[Position] = Field(default_factory=list)
    teams: list[str] = Field(default_factory=list)
    season: int | Literal["career"] = 0  # 0 = latest
    week: int = 0  # 0 = season totals
    sort_key: str = "fantasy_points_ppr"
    sort_direction: SortDir = "desc"
    limit: int = Field(50, ge=1, le=1000)
    offset: int = Field(0, ge=0)
    filters: list[ScreenerFilter] = Field(default_factory=list)
    relevance: Literal["all", "fantasy"] = "fantasy"
    min_gp: int = Field(0, ge=0, le=17)


class PlayerRow(BaseModel):
    model_config = ConfigDict(extra="allow")  # stat columns vary by query

    player_id: str
    full_name: str
    position: Position
    team: str
    age: int | None = None
    games: int = 0
    fantasy_points_ppr: float = 0.0


class ScreenerResponse(BaseModel):
    items: list[PlayerRow]
    count: int
    season: int | Literal["career"]
    universe: Universe = "nfl"
