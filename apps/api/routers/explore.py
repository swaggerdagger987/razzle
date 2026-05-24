"""Explore router — screener and filter options."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..models.screener import ScreenerQuery, ScreenerResponse
from ..services.screener import ScreenerError, get_filter_options, run_screener

router = APIRouter(prefix="/api", tags=["explore"])


def _screener_query_response(body: ScreenerQuery) -> ScreenerResponse:
    try:
        result = run_screener(body)
    except ScreenerError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return ScreenerResponse(**result)


@router.post("/screener/query", response_model=ScreenerResponse)
def screener_query(body: ScreenerQuery) -> ScreenerResponse:
    return _screener_query_response(body)


@router.post("/explore/query", response_model=ScreenerResponse)
def explore_query(body: ScreenerQuery) -> ScreenerResponse:
    return _screener_query_response(body)


@router.get("/filter-options")
def filter_options() -> dict:
    return get_filter_options()


@router.get("/explore/filter-options")
def explore_filter_options() -> dict:
    return get_filter_options()
