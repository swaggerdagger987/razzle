"""Panel catalog — load and query packages/panels/catalog.json."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

_CATALOG_PATH = Path(__file__).resolve().parents[4] / "packages" / "panels" / "catalog.json"


class PanelNotFoundError(KeyError):
    pass


@lru_cache(maxsize=1)
def load_catalog() -> list[dict[str, Any]]:
    return json.loads(_CATALOG_PATH.read_text(encoding="utf-8"))


def list_panels() -> list[dict[str, Any]]:
    rows = []
    for p in load_catalog():
        rows.append(
            {
                "slug": p["slug"],
                "legacyId": p.get("legacyId"),
                "title": p["title"],
                "blurb": p.get("blurb", ""),
                "icon": p.get("icon", ""),
                "tier": p.get("tier", "free"),
                "category": p.get("category", ""),
                "renderType": p.get("renderType", ""),
                "api": p.get("api", {}),
            }
        )
    return rows


def get_panel(slug: str) -> dict[str, Any]:
    for p in load_catalog():
        if p["slug"] == slug:
            return p
    raise PanelNotFoundError(slug)


def catalog_paths() -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for p in load_catalog():
        out.setdefault(p["api"]["path"], p)
    return out
