"""Agents router — Situation Room."""

from __future__ import annotations

from fastapi import APIRouter

from ..models.agents import AskRequest, AskResponse
from ..services import agents

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest) -> AskResponse:
    result = await agents.orchestrate(
        question=req.question,
        specialists=req.specialists,
        league_id=req.league_id,
        league_format=req.format,
        user_id=req.user_id,
        player_id=req.player_id,
        referrer_panel=req.referrer_panel,
    )
    return AskResponse(**result)


@router.get("/facts")
def facts(league_id: str | None = None) -> dict:
    return agents.facts(league_id=league_id)


@router.get("/quota")
def quota() -> dict:
    return agents.get_quota_status()
