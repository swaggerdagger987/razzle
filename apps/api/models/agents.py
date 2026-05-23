"""Pydantic models for agents API."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

AgentId = Literal["razzle", "octo", "bones", "dolphin", "hawkeye", "atlas"]


class AskRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=2000)
    specialists: list[AgentId] = Field(default_factory=list)
    league_id: str | None = None
    user_id: str | None = None
    player_id: str | None = None
    format: Literal["redraft", "dynasty", "keeper", "best_ball", "superflex"] = "dynasty"
    referrer_panel: str | None = None


class AskResponse(BaseModel):
    briefing: str
    urgency: Literal["URGENT", "MONITOR", "OPPORTUNITY", "ROUTINE"]
    specialists_used: list[AgentId]
    cost_usd: float | None = None
