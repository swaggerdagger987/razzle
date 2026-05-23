"""Screener service — NFL via legacy fetch_screener, college via fetch_college_players."""

from __future__ import annotations

from ...legacy_bridge import live_data
from ...models.screener import ScreenerQuery
from .college import run_college_screener


class ScreenerError(Exception):
    """User-facing screener error."""


def run_screener(query: ScreenerQuery) -> dict:
    try:
        if query.universe == "college":
            return run_college_screener(query, live_data())
        body = query.model_dump(exclude={"universe"})
        result = live_data().fetch_screener(body)
        result["universe"] = "nfl"
        return result
    except Exception as e:  # noqa: BLE001
        raise ScreenerError(str(e)) from e


def quick_search(q: str, limit: int = 8) -> list[dict]:
    return live_data().quick_search_players(q, limit=limit)


def get_filter_options() -> dict:
    return live_data().get_filter_options()
