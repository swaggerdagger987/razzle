"""Panels router — catalog metadata, slug dispatch, legacy catalog paths."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request

from ..models.panels import PanelListResponse, PanelMeta
from ..services.panels import PanelError, PanelNotFoundError, get_panel, list_panels, run_panel
from ..services.panels.dispatcher import register_catalog_routes
from ..services.tier import require_tier

router = APIRouter(tags=["panels"])
legacy_router = APIRouter(prefix="/api", tags=["panels-legacy"])


@router.get("/api/panels", response_model=PanelListResponse)
def panels_list() -> PanelListResponse:
    panels = [PanelMeta(**p) for p in list_panels()]
    return PanelListResponse(count=len(panels), panels=panels)


@router.get("/api/panels/{slug}")
def panel_by_slug(
    slug: str,
    request: Request,
    season: int | None = Query(None),
    limit: int | None = Query(None),
    position: str | None = Query(None),
    week: int | None = Query(None),
) -> Any:
    overrides: dict[str, Any] = {}
    if season is not None:
        overrides["season"] = season
    if limit is not None:
        overrides["limit"] = limit
    if position is not None:
        overrides["position"] = position
    if week is not None:
        overrides["week"] = week
    for key, val in request.query_params.multi_items():
        if key not in overrides and key not in ("season", "limit", "position", "week"):
            overrides[key] = val

    try:
        panel = get_panel(slug)
    except PanelNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"unknown panel: {slug}") from e

    if panel.get("tier") == "pro":
        require_tier("pro", request)

    try:
        return run_panel(slug, overrides=overrides or None)
    except HTTPException:
        raise
    except PanelError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


register_catalog_routes(legacy_router)
