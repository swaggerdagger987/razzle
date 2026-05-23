"""Historian fact-store — wraps legacy agent_facts."""

from __future__ import annotations

import logging
from typing import Any

from ...legacy_bridge import agent_facts

logger = logging.getLogger("razzle.agents.facts")


def facts(league_id: str | None) -> dict[str, Any]:
    af = agent_facts()
    result: dict[str, Any] = {"league_id": league_id}
    try:
        if hasattr(af, "injury_report"):
            result["injuries"] = af.injury_report(limit=20)
        if hasattr(af, "trending_players"):
            result["trending_adds"] = af.trending_players(kind="add", limit=10)
        elif hasattr(af, "trending"):
            result["trending_adds"] = af.trending(limit=10, kind="add")
    except Exception:  # noqa: BLE001
        logger.exception("agent_facts call failed")
    return result
