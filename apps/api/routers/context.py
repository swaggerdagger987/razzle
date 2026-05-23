"""League context router — persist + TTL snapshots."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..models.context import LeagueContextResponse, RefreshResponse
from ..services.context import get_or_refresh, snapshot_meta

router = APIRouter(prefix="/api/context", tags=["context"])


@router.post("/league/{league_id}/refresh", response_model=RefreshResponse)
def refresh_league_context(league_id: str) -> RefreshResponse:
    ctx = get_or_refresh(league_id, force=True)
    if not ctx:
        raise HTTPException(status_code=404, detail="league not found")
    meta = snapshot_meta(league_id) or {}
    return RefreshResponse(
        league_id=league_id,
        refreshed=True,
        expires_at=meta.get("expires_at"),
    )


@router.get("/league/{league_id}", response_model=LeagueContextResponse)
def get_league_context(league_id: str) -> LeagueContextResponse:
    ctx = get_or_refresh(league_id)
    if not ctx:
        raise HTTPException(status_code=404, detail="league not found")
    meta = snapshot_meta(league_id) or {}
    return LeagueContextResponse(
        league_id=ctx.league_id,
        name=ctx.name,
        season=ctx.season,
        sport=ctx.sport,
        total_rosters=ctx.total_rosters,
        roster_positions=ctx.roster_positions,
        cached=bool(meta.get("cached")),
        fetched_at=meta.get("fetched_at"),
        expires_at=meta.get("expires_at"),
    )
