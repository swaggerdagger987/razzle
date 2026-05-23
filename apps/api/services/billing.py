"""Billing service — Stripe wrapper."""

from __future__ import annotations

import logging

import stripe
from fastapi import HTTPException

from ..config import get_settings
from ..legacy_bridge import billing as legacy_billing

logger = logging.getLogger("razzle.services.billing")


def _stripe():
    settings = get_settings()
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="billing not configured")
    stripe.api_key = settings.stripe_secret_key
    return stripe


def create_checkout_session(user_id: int, plan: str) -> str:
    settings = get_settings()
    s = _stripe()
    price_id = {"pro_year": settings.stripe_price_pro_yearly}.get(plan)
    if not price_id:
        raise HTTPException(status_code=400, detail=f"unknown plan: {plan}")
    session = s.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{settings.base_url}/account?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.base_url}/pricing",
        client_reference_id=str(user_id),
        allow_promotion_codes=True,
        subscription_data={"trial_period_days": 7},
    )
    return session.url


def create_portal_session(user_id: int) -> str:
    settings = get_settings()
    s = _stripe()
    customer_id = _get_customer_id(user_id)
    if not customer_id:
        raise HTTPException(status_code=400, detail="no active subscription")
    portal = s.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.base_url}/account",
    )
    return portal.url


def handle_webhook(payload: bytes, signature: str) -> None:
    settings = get_settings()
    s = _stripe()
    try:
        event = s.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=settings.stripe_webhook_secret,
        )
    except (ValueError, s.error.SignatureVerificationError) as e:
        raise HTTPException(status_code=400, detail=f"webhook verify failed: {e}") from e
    _apply_event(event)


def subscription_status(user_id: int) -> dict:
    return {"plan": "free", "status": "inactive", "trial_end": None}


def _get_customer_id(user_id: int) -> str | None:
    legacy = legacy_billing()
    return legacy.get_customer_id(user_id) if hasattr(legacy, "get_customer_id") else None


def _apply_event(event: dict) -> None:
    et = event["type"]
    logger.info("Stripe webhook: %s (id=%s)", et, event["id"])
