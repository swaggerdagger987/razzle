"""Quota tracking.

Free=5/day, Pro=unlimited (synthesized briefings still throttle to 60/hour
for cost control), Elite=unlimited + LLM key included.
"""

from __future__ import annotations


def get_quota_status(plan: str = "free") -> dict:
    if plan == "elite":
        return {"plan": "elite", "queries_today": 0, "limit": None}
    if plan == "pro":
        return {"plan": "pro", "queries_today": 0, "limit": 60, "window": "hour"}
    return {"plan": "free", "queries_today": 0, "limit": 5, "window": "day"}
