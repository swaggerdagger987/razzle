"""Intel snippets — coaching tendencies, contracts, breaking news."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..services.intel import intel_for_player, intel_for_team

router = APIRouter(prefix="/api/intel", tags=["intel"])


@router.get("/player/{player_id}")
def player_intel(player_id: str) -> dict:
    snippets = intel_for_player(player_id)
    if not snippets:
        raise HTTPException(status_code=404, detail="no intel for player")
    return {"player_id": player_id, "snippets": snippets}


@router.get("/team/{team}")
def team_intel(team: str) -> dict:
    snippets = intel_for_team(team.upper())
    return {"team": team.upper(), "snippets": snippets}
