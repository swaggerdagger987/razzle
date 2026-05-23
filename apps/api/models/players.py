"""Pydantic models for players API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PlayerProfileResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    player_id: str
    player: dict[str, Any] = Field(default_factory=dict)
    seasons: list[Any] = Field(default_factory=list)
    career: dict[str, Any] | None = None
    combine: dict[str, Any] | None = None
