"""Panel dispatcher — runs legacy live_data handlers."""

from __future__ import annotations

import inspect
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from ...legacy_bridge import live_data
from .registry import PanelNotFoundError, catalog_paths, get_panel

logger = logging.getLogger("razzle.panels.dispatcher")

RESERVED_PATHS = frozenset(
    {
        "/api/screener/query",
        "/api/filter-options",
        "/api/players/quick-search",
        "/api/players/compare",
        "/api/panels",
        "/api/health",
    }
)

_BODY_HANDLERS = frozenset({"fetch_screener"})


class PanelError(Exception):
    pass


def _resolve_handler(name: str):
    fn = getattr(live_data(), name, None)
    if fn is None or not callable(fn):
        raise PanelError(f"handler not found: {name}")
    return fn


def _coerce_params(fn, params: dict[str, Any]) -> dict[str, Any]:
    sig = inspect.signature(fn)
    coerced: dict[str, Any] = {}
    for key, param in sig.parameters.items():
        if key not in params:
            continue
        val = params[key]
        ann = str(param.annotation).lower()
        if val is not None and val != "":
            if "int" in ann:
                try:
                    coerced[key] = int(val)
                    continue
                except (TypeError, ValueError):
                    pass
            if "float" in ann:
                try:
                    coerced[key] = float(val)
                    continue
                except (TypeError, ValueError):
                    pass
        coerced[key] = val
    return coerced


def dispatch_handler(handler_name: str, params: dict[str, Any]) -> Any:
    fn = _resolve_handler(handler_name)
    if handler_name in _BODY_HANDLERS:
        return fn(params)
    filtered = _coerce_params(fn, params)
    return fn(**filtered)


def run_panel(slug: str, overrides: dict[str, Any] | None = None) -> Any:
    try:
        panel = get_panel(slug)
    except PanelNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"unknown panel: {slug}") from e
    api = panel["api"]
    params = dict(api.get("params") or {})
    if overrides:
        params.update({k: v for k, v in overrides.items() if v is not None})
    return dispatch_handler(api["handler"], params)


async def _legacy_endpoint(request: Request, panel: dict[str, Any]) -> Any:
    api = panel["api"]
    params = dict(api.get("params") or {})
    if request.method == "POST":
        try:
            body = await request.json()
            if isinstance(body, dict):
                params.update(body)
        except Exception:  # noqa: BLE001
            pass
    else:
        for key, val in request.query_params.multi_items():
            if key != "slug":
                params[key] = val
    return dispatch_handler(api["handler"], params)


def register_catalog_routes(router: APIRouter) -> None:
    for path, panel in catalog_paths().items():
        if path in RESERVED_PATHS:
            continue
        method = (panel["api"].get("method") or "GET").upper()
        route_path = path.removeprefix("/api") or "/"
        if not route_path.startswith("/"):
            route_path = "/" + route_path

        async def handler(request: Request, _panel=panel):  # noqa: B023
            return await _legacy_endpoint(request, _panel)

        router.add_api_route(
            route_path,
            handler,
            methods=[method],
            name=f"panel-legacy-{panel['slug']}",
        )
