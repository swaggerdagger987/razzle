"""Pydantic models for panels API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class PanelApiMeta(BaseModel):
    handler: str
    method: str
    path: str
    params: dict[str, Any] = Field(default_factory=dict)


class PanelMeta(BaseModel):
    slug: str
    legacyId: str | None = None
    title: str
    blurb: str = ""
    icon: str = ""
    tier: str = "free"
    category: str = ""
    renderType: str = ""
    api: PanelApiMeta


class PanelListResponse(BaseModel):
    count: int
    panels: list[PanelMeta]
