"""Plan / tier resolution for premium feature gating."""

from __future__ import annotations

from typing import Literal

from fastapi import HTTPException, Request

from ..config import get_settings

Plan = Literal["free", "pro", "elite"]
TIER_RANK = {"free": 0, "pro": 1, "elite": 2}

# In-memory override for local testing (POST /api/dev/plan)
_dev_plan_override: Plan | None = None


def set_dev_plan(plan: Plan | None) -> None:
    global _dev_plan_override
    _dev_plan_override = plan


def get_dev_plan_override() -> Plan | None:
    return _dev_plan_override


def resolve_plan(request: Request | None = None) -> Plan:
    """Return effective plan for this request."""
    settings = get_settings()

    if not settings.is_production:
        if _dev_plan_override:
            return _dev_plan_override
        if settings.dev_plan:
            return settings.dev_plan  # type: ignore[return-value]
        if request:
            header = request.headers.get("X-Razzle-Plan", "").lower()
            if header in TIER_RANK:
                return header  # type: ignore[return-value]
            cookie = request.cookies.get("razzle_plan", "").lower()
            if cookie in TIER_RANK:
                return cookie  # type: ignore[return-value]

    # TODO: JWT user plan from users.db when auth is wired
    return "free"


def require_tier(min_tier: Plan, request: Request | None = None) -> Plan:
    plan = resolve_plan(request)
    if TIER_RANK[plan] < TIER_RANK[min_tier]:
        raise HTTPException(
            status_code=402,
            detail={
                "error": "upgrade_required",
                "required": min_tier,
                "current": plan,
                "message": f"This feature requires {min_tier.title()}. You're on {plan.title()}.",
            },
        )
    return plan


def panel_accessible(panel_tier: str, request: Request | None = None) -> bool:
    if panel_tier != "pro":
        return True
    return TIER_RANK[resolve_plan(request)] >= TIER_RANK["pro"]
