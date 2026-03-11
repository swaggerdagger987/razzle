"""
Razzle billing module — Stripe integration for subscriptions.
Reads all keys from environment variables. Never hardcodes secrets.
"""

import os
import logging
from datetime import datetime, timezone

import stripe

from . import auth as auth_module

logger = logging.getLogger("razzle.billing")

# Stripe config — all from env vars
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

# Price IDs — set in env (must be created in Stripe dashboard)
# Two-tier pricing: Pro ($9.99/mo, $79.99/yr) and Elite ($19.99/mo, $149.99/yr)
STRIPE_PRICE_PRO_MONTHLY = os.environ.get("STRIPE_PRICE_PRO_MONTHLY", "")
STRIPE_PRICE_PRO_YEARLY = os.environ.get("STRIPE_PRICE_PRO_YEARLY", "")
STRIPE_PRICE_ELITE_MONTHLY = os.environ.get("STRIPE_PRICE_ELITE_MONTHLY", "")
STRIPE_PRICE_ELITE_YEARLY = os.environ.get("STRIPE_PRICE_ELITE_YEARLY", "")

# Legacy fallback (single-tier) — maps to Pro
STRIPE_PRICE_YEARLY = os.environ.get("STRIPE_PRICE_YEARLY", "") or STRIPE_PRICE_PRO_YEARLY
STRIPE_PRICE_MONTHLY = os.environ.get("STRIPE_PRICE_MONTHLY", "") or STRIPE_PRICE_PRO_MONTHLY

# Map plan identifiers to Stripe price IDs
_PRICE_MAP = {
    "pro_month": STRIPE_PRICE_PRO_MONTHLY,
    "pro_year": STRIPE_PRICE_PRO_YEARLY,
    "elite_month": STRIPE_PRICE_ELITE_MONTHLY,
    "elite_year": STRIPE_PRICE_ELITE_YEARLY,
    # Legacy identifiers
    "month": STRIPE_PRICE_MONTHLY,
    "year": STRIPE_PRICE_YEARLY,
}

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY
else:
    logger.warning("STRIPE_SECRET_KEY not set — billing endpoints will fail")

_BASE_URL = os.environ.get("RAZZLE_BASE_URL", "https://razzle.lol")
SUCCESS_URL = f"{_BASE_URL}/agents?session_id={{CHECKOUT_SESSION_ID}}"
CANCEL_URL = f"{_BASE_URL}/agents"


def initialize_subscriptions_table():
    """Create subscriptions table in users.db if it doesn't exist."""
    with auth_module.get_users_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                stripe_customer_id TEXT,
                stripe_subscription_id TEXT,
                plan TEXT DEFAULT 'free',
                status TEXT DEFAULT 'inactive',
                current_period_end TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
            CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(stripe_customer_id);
        """)
        # Add stripe_customer_id to users table if not exists
        try:
            conn.execute("ALTER TABLE users ADD COLUMN stripe_customer_id TEXT")
        except Exception:
            logger.debug("stripe_customer_id column already exists or migration failed", exc_info=True)
        # Add trial_used column to subscriptions if not exists
        try:
            conn.execute("ALTER TABLE subscriptions ADD COLUMN trial_used INTEGER DEFAULT 0")
        except Exception:
            logger.debug("trial_used column already exists or migration failed", exc_info=True)
        # Add trial_end column to subscriptions if not exists
        try:
            conn.execute("ALTER TABLE subscriptions ADD COLUMN trial_end TIMESTAMP")
        except Exception:
            logger.debug("trial_end column already exists or migration failed", exc_info=True)
        conn.commit()
    logger.info("Subscriptions table initialized")


# Promo codes — validated server-side, applied as Stripe coupon
# Map promo code string -> Stripe coupon ID (set in env, created in Stripe dashboard)
_PROMO_CODES = {
    "RAZZLE": os.environ.get("STRIPE_COUPON_RAZZLE", ""),  # 20% off first year
}

# Trial duration in days
_TRIAL_DAYS = 7


def _user_had_trial(user_id: int) -> bool:
    """Check if user has ever had a trial (prevent re-trial abuse)."""
    with auth_module.get_users_db() as conn:
        row = conn.execute(
            "SELECT trial_used FROM subscriptions WHERE user_id = ? AND trial_used = 1 LIMIT 1",
            (user_id,),
        ).fetchone()
        return bool(row)


def validate_promo_code(code: str) -> dict:
    """Validate a promo code and return discount info."""
    code = code.strip().upper()
    coupon_id = _PROMO_CODES.get(code)
    if not coupon_id:
        return {"valid": False, "error": "Invalid promo code"}
    try:
        coupon = stripe.Coupon.retrieve(coupon_id)
        return {
            "valid": True,
            "code": code,
            "percent_off": coupon.get("percent_off"),
            "amount_off": coupon.get("amount_off"),
            "duration": coupon.get("duration"),
        }
    except stripe.error.StripeError:
        return {"valid": False, "error": "Promo code expired or invalid"}


def create_checkout_session(user: dict, interval: str = "year", promo_code: str = "") -> dict:
    """Create a Stripe Checkout Session for the user.

    interval can be: pro_month, pro_year, elite_month, elite_year,
    or legacy: month, year (maps to Pro).
    promo_code: optional promo code for discount.
    """
    if not STRIPE_SECRET_KEY:
        return {"error": "Stripe not configured", "status": 503}

    price_id = _PRICE_MAP.get(interval, "")
    if not price_id:
        return {"error": f"Stripe price ID for '{interval}' not configured", "status": 503}

    # Determine plan tier for metadata
    plan_tier = "elite" if interval.startswith("elite") else "pro"

    # Check trial eligibility (only for new subscribers)
    trial_eligible = not _user_had_trial(user["id"])
    trial_days = _TRIAL_DAYS if trial_eligible else None

    # Validate promo code if provided
    coupon_id = None
    if promo_code:
        code_upper = promo_code.strip().upper()
        coupon_id = _PROMO_CODES.get(code_upper)
        if not coupon_id:
            return {"error": f"Invalid promo code: {promo_code}", "status": 400}

    try:
        # Get or create Stripe customer
        customer_id = _get_or_create_customer(user)

        # Build subscription_data
        sub_data = {"metadata": {"plan_tier": plan_tier}}
        if trial_days:
            sub_data["trial_period_days"] = trial_days

        # Build session kwargs
        session_kwargs = {
            "customer": customer_id,
            "payment_method_types": ["card"],
            "line_items": [{"price": price_id, "quantity": 1}],
            "mode": "subscription",
            "success_url": SUCCESS_URL,
            "cancel_url": CANCEL_URL,
            "metadata": {"user_id": str(user["id"]), "plan_tier": plan_tier},
            "subscription_data": sub_data,
        }

        # Apply coupon if promo code valid
        if coupon_id:
            session_kwargs["discounts"] = [{"coupon": coupon_id}]

        session = stripe.checkout.Session.create(**session_kwargs)
        return {
            "checkout_url": session.url,
            "session_id": session.id,
            "trial_days": trial_days,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe checkout error: {e}")
        return {"error": str(e), "status": 400}


def _get_or_create_customer(user: dict) -> str:
    """Get existing Stripe customer ID or create new one."""
    with auth_module.get_users_db() as conn:
        row = conn.execute("SELECT stripe_customer_id FROM users WHERE id = ?", (user["id"],)).fetchone()
        if row and row["stripe_customer_id"]:
            return row["stripe_customer_id"]

        # Create new customer
        customer = stripe.Customer.create(
            email=user["email"],
            metadata={"razzle_user_id": str(user["id"])},
        )
        conn.execute(
            "UPDATE users SET stripe_customer_id = ? WHERE id = ?",
            (customer.id, user["id"]),
        )
        conn.commit()
        return customer.id


def handle_webhook(payload: bytes, sig_header: str) -> dict:
    """Process Stripe webhook event."""
    if not STRIPE_WEBHOOK_SECRET:
        return {"error": "Webhook secret not configured", "status": 503}

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        return {"error": "Invalid signature", "status": 400}
    except ValueError:
        return {"error": "Invalid payload", "status": 400}

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(data)
    elif event_type == "customer.subscription.deleted":
        _handle_subscription_deleted(data)
    elif event_type == "invoice.payment_failed":
        _handle_payment_failed(data)

    return {"status": "ok"}


def _handle_checkout_completed(session):
    """Upgrade user to pro or elite after successful checkout."""
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")
    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id")
    plan_tier = metadata.get("plan_tier", "pro")  # default to pro for legacy

    # Validate plan tier
    if plan_tier not in ("pro", "elite"):
        plan_tier = "pro"

    if not user_id:
        # Try to find user by customer_id
        with auth_module.get_users_db() as conn:
            row = conn.execute("SELECT id FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
            if row:
                user_id = str(row["id"])
            else:
                logger.error(f"Checkout completed but can't find user for customer {customer_id}")
                return

    # Check if subscription has a trial
    trial_end = None
    is_trial = False
    if subscription_id:
        try:
            sub_obj = stripe.Subscription.retrieve(subscription_id)
            if sub_obj.get("trial_end"):
                trial_end = datetime.fromtimestamp(sub_obj["trial_end"], tz=timezone.utc).isoformat()
                is_trial = sub_obj.get("status") == "trialing"
        except Exception:
            logger.debug("Could not retrieve subscription trial info", exc_info=True)

    with auth_module.get_users_db() as conn:
        # Update user plan
        conn.execute("UPDATE users SET plan = ? WHERE id = ?", (plan_tier, int(user_id)))

        # Upsert subscription record
        existing = conn.execute(
            "SELECT id FROM subscriptions WHERE user_id = ?", (int(user_id),)
        ).fetchone()
        status = "trialing" if is_trial else "active"
        if existing:
            conn.execute("""
                UPDATE subscriptions SET
                    stripe_customer_id = ?, stripe_subscription_id = ?,
                    plan = ?, status = ?, trial_used = 1, trial_end = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (customer_id, subscription_id, plan_tier, status, trial_end, int(user_id)))
        else:
            conn.execute("""
                INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, trial_used, trial_end)
                VALUES (?, ?, ?, ?, ?, 1, ?)
            """, (int(user_id), customer_id, subscription_id, plan_tier, status, trial_end))

        conn.commit()
    logger.info(f"User {user_id} upgraded to {plan_tier} (subscription {subscription_id}, trial={is_trial})")


def _handle_subscription_deleted(subscription):
    """Downgrade user to free when subscription cancelled."""
    customer_id = subscription.get("customer")

    with auth_module.get_users_db() as conn:
        row = conn.execute("SELECT id FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
        if row:
            conn.execute("UPDATE users SET plan = 'free' WHERE id = ?", (row["id"],))
            conn.execute("""
                UPDATE subscriptions SET plan = 'free', status = 'cancelled', updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (row["id"],))
            conn.commit()
            logger.info(f"User {row['id']} downgraded to free (subscription cancelled)")


def _handle_payment_failed(invoice):
    """Flag user when payment fails."""
    customer_id = invoice.get("customer")

    with auth_module.get_users_db() as conn:
        row = conn.execute("SELECT id FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
        if row:
            conn.execute("""
                UPDATE subscriptions SET status = 'payment_failed', updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (row["id"],))
            conn.commit()
            logger.warning(f"Payment failed for user {row['id']}")


def get_billing_status(user: dict) -> dict:
    """Get current billing status for a user."""
    with auth_module.get_users_db() as conn:
        sub = conn.execute(
            "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1",
            (user["id"],),
        ).fetchone()

    result = {
        "plan": user.get("plan", "free"),
        "subscription_status": None,
        "current_period_end": None,
        "portal_url": None,
        "trial_active": False,
        "trial_end": None,
        "trial_days_remaining": None,
    }

    if sub:
        result["subscription_status"] = sub["status"]
        result["current_period_end"] = sub["current_period_end"]

        # Trial info
        trial_end_str = sub["trial_end"] if "trial_end" in sub.keys() else None
        if trial_end_str and sub["status"] == "trialing":
            result["trial_active"] = True
            result["trial_end"] = trial_end_str
            try:
                trial_end_dt = datetime.fromisoformat(trial_end_str.replace("Z", "+00:00"))
                days_left = (trial_end_dt - datetime.now(timezone.utc)).days
                result["trial_days_remaining"] = max(0, days_left)
            except (ValueError, TypeError):
                pass

    # Generate portal URL if user has a Stripe customer
    if user.get("stripe_customer_id") or (sub and sub["stripe_customer_id"]):
        customer_id = user.get("stripe_customer_id") or sub["stripe_customer_id"]
        try:
            portal = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url="https://razzle.lol/agents",
            )
            result["portal_url"] = portal.url
        except Exception as e:
            logger.error(f"Portal creation error: {e}")

    return result
