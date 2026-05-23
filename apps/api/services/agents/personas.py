"""Persona loader — reads the system prompt for each agent from disk once.

Personas live as Markdown in /agent-personas/ so PMs can edit them without
touching code. The three Phase-6 launch agents are razzle, octo, bones;
the other three are loaded but disabled in the routing layer.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger("razzle.agents.personas")

_DIR = Path(__file__).resolve().parents[4] / "agent-personas"

PERSONA_FILES = {
    "razzle": "razzle.md",
    "octo": "quant.md",
    "bones": "diplomat.md",
    "dolphin": "medical.md",
    "hawkeye": "scout.md",
    "atlas": "historian.md",
}

# Per DECISIONS.md: launch with these three. Add the others as they prove value.
LAUNCH_AGENTS = ("razzle", "octo", "bones")


@lru_cache(maxsize=8)
def load(agent_id: str) -> str:
    fname = PERSONA_FILES.get(agent_id)
    if not fname:
        return ""
    path = _DIR / fname
    if not path.exists():
        logger.warning("Persona missing: %s", path)
        return ""
    return path.read_text(encoding="utf-8")
