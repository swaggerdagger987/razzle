"""Billing router — Stripe checkout + Customer Portal + webhooks.

V2 simplification: we delegate plan changes, cancellation, and payment-method
updates to Stripe Customer Portal. Our app handles two things:
1. Starting a checkout session for a new subscriber.
2. Listening to webhooks to flip plan state in users.db.

That's it. The reconciliation loop from legacy/backend/server.py is gone —
Stripe retries failed webhooks for 3 days, which covers every real outage.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Header, Request
from pydantic import BaseModel

from ..services import auth as auth_service
from ..services import billing as billing_service

router = APIRouter(prefix="/api/billing", tags=["billing"])


class CheckoutRequest(BaseModel):
    plan: str = "pro_year"  # only Pro yearly on launch


@router.post("/create-checkout")
def create_checkout(body: CheckoutRequest, user: dict = Depends(auth_service.require_user)) -> dict:
    """Returns a Stripe checkout URL."""
    url = billing_service.create_checkout_session(user_id=user["id"], plan=body.plan)
    return {"url": url}


@router.post("/portal")
def customer_portal(user: dict = Depends(auth_service.require_user)) -> dict:
    """Returns a Stripe Customer Portal URL for self-serve plan management."""
    url = billing_service.create_portal_session(user_id=user["id"])
    return {"url": url}


@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None, alias="Stripe-Signature")):
    body = await request.body()
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="missing signature")
    billing_service.handle_webhook(payload=body, signature=stripe_signature)
    return {"ok": True}


@router.get("/status")
def status(user: dict = Depends(auth_service.require_user)) -> dict:
    return billing_service.subscription_status(user_id=user["id"])
