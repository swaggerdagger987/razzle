"""Screener service — wraps legacy fetch_screener."""

from __future__ import annotations

from ...legacy_bridge import live_data
from ...models.screener import ScreenerQuery


class ScreenerError(Exception):
    """User-facing screener error."""


def run_screener(query: ScreenerQuery) -> dict:
    body = query.model_dump()
    try:
        return live_data().fetch_screener(body)
    except Exception as e:  # noqa: BLE001
        raise ScreenerError(str(e)) from e


def quick_search(q: str, limit: int = 8) -> list[dict]:
    return live_data().quick_search_players(q, limit=limit)


def get_filter_options() -> dict:
    return live_data().get_filter_options()
