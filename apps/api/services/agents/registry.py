"""Agent registry mirror — keep in sync with packages/agents/registry.ts."""

from __future__ import annotations

AGENT_IDS = ("razzle", "dolphin", "hawkeye", "bones", "octo", "atlas")

LAUNCH_AGENTS = AGENT_IDS

ROUTE_DESCRIPTIONS = {
    "dolphin": "medical/injury/durability/health",
    "hawkeye": "usage/breakouts/waivers/scouting",
    "bones": "trades/negotiation/leverage",
    "octo": "quant/value/projections/odds",
    "atlas": "history/patterns/league memory",
}

INJURY_KEYWORDS = (
    "injur",
    "hurt",
    "questionable",
    "doubtful",
    "concussion",
    "hamstring",
    "acl",
    "health",
    "durability",
    "gameday",
    "ir ",
    "pup",
)


def suggest_specialists(question: str) -> list[str]:
    q = question.lower()
    if any(k in q for k in INJURY_KEYWORDS):
        return ["dolphin"]
    if any(k in q for k in ("trade", "deal", "offer", "leverage")):
        return ["bones"]
    if any(k in q for k in ("waiver", "pickup", "breakout", "snap", "usage")):
        return ["hawkeye"]
    if any(k in q for k in ("history", "pattern", "precedent", "last time")):
        return ["atlas"]
    if any(k in q for k in ("odds", "probability", "projection", "value", "ppg")):
        return ["octo"]
    return ["octo"]
