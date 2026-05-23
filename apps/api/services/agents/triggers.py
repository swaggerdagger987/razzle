"""Cross-agent triggers — Room L4.

When one specialist flags a signal, invoke a follow-up specialist before synthesis.
Pattern ported from legacy warroom.js (injury → scout handcuff scan).
"""

from __future__ import annotations

import re
from typing import Any

_INJURY_FOLLOWUP = re.compile(
    r"\b(out|doubtful|questionable|injured|ir\b|pup|acl|mcl|concussion|hamstring|"
    r"ankle|knee|fracture|torn|surgery|season.ending|weeks?\s+out)\b",
    re.IGNORECASE,
)

_FOLLOWUP_LABELS = {
    "hawkeye": "injury flagged — scanning replacement options",
    "bones": "injury flagged — mapping trade targets",
}


def detect_followups(
    outputs: list[dict[str, Any]],
    already_called: set[str],
) -> list[dict[str, str]]:
    """Return follow-up specialist calls triggered by prior outputs (max 1)."""
    dolphin_text = ""
    for row in outputs:
        if row.get("agent") == "dolphin":
            dolphin_text = row.get("text") or ""
            break

    if not dolphin_text or not _INJURY_FOLLOWUP.search(dolphin_text):
        return []

    if "hawkeye" not in already_called:
        return [
            {
                "agent": "hawkeye",
                "label": _FOLLOWUP_LABELS["hawkeye"],
                "question": (
                    "FOLLOW-UP from Dr. Dolphin's injury read:\n\n"
                    f"{dolphin_text[:500]}\n\n"
                    "Evaluate backup/handcuff options and waiver replacements. "
                    "Rank by opportunity quality in <=180 words."
                ),
            }
        ]

    if "bones" not in already_called:
        return [
            {
                "agent": "bones",
                "label": _FOLLOWUP_LABELS["bones"],
                "question": (
                    "FOLLOW-UP from Dr. Dolphin's injury read:\n\n"
                    f"{dolphin_text[:500]}\n\n"
                    "Identify trade targets to fill the gap. Who has depth? "
                    "Propose specific trade frameworks in <=180 words."
                ),
            }
        ]

    return []
