"""Players router — profiles and quick search."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ..legacy_bridge import live_data
from ..services.screener import quick_search

router = APIRouter(prefix="/api/players", tags=["players"])


@router.get("/quick-search")
def player_quick_search(q: str = Query("", max_length=64), limit: int = Query(8, ge=1, le=20)) -> list[dict]:
    return quick_search(q, limit=limit)


@router.get("/compare")
def players_compare(
    player_ids: str = "",
    season: int = 0,
) -> dict:
    ids = [p.strip() for p in player_ids.split(",") if p.strip()]
    return live_data().fetch_players_compare(ids, season=season)


@router.get("/{player_id}")
def player_profile(player_id: str) -> dict:
    try:
        return live_data().fetch_player_profile(player_id)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=404, detail=f"player not found: {player_id}") from e
