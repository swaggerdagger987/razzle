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

# Early adopter pricing — discounted rates for first N subscribers
STRIPE_PRICE_EA_PRO_YEARLY = os.environ.get("STRIPE_PRICE_EA_PRO_YEARLY", "")     # $59.99/yr (25% off)
STRIPE_PRICE_EA_ELITE_YEARLY = os.environ.get("STRIPE_PRICE_EA_ELITE_YEARLY", "")  # $99.99/yr (33% off)
def _env_int(key, default):
    try:
        return int(os.environ.get(key, str(default)))
    except (ValueError, TypeError):
        return default

EA_PRO_LIMIT = _env_int("EA_PRO_LIMIT", 500)    # First 500 Pro subscribers
EA_ELITE_LIMIT = _env_int("EA_ELITE_LIMIT", 200)  # First 200 Elite subscribers
# Feature flag — set to "1" to enable early adopter pricing
EA_ENABLED = os.environ.get("EA_ENABLED", "0") == "1"

# Lifetime deal pricing — one-time payment
STRIPE_PRICE_LIFETIME_PRO = os.environ.get("STRIPE_PRICE_LIFETIME_PRO", "")      # $249.99
STRIPE_PRICE_LIFETIME_ELITE = os.environ.get("STRIPE_PRICE_LIFETIME_ELITE", "")  # $399.99
LIFETIME_LIMIT = _env_int("LIFETIME_LIMIT", 100)  # First 100 only
LIFETIME_ENABLED = os.environ.get("LIFETIME_ENABLED", "0") == "1"

# Legacy fallback (single-tier) — maps to Pro
STRIPE_PRICE_YEARLY = os.environ.get("STRIPE_PRICE_YEARLY", "") or STRIPE_PRICE_PRO_YEARLY
STRIPE_PRICE_MONTHLY = os.environ.get("STRIPE_PRICE_MONTHLY", "") or STRIPE_PRICE_PRO_MONTHLY

# Map plan identifiers to Stripe price IDs
_PRICE_MAP = {
    "pro_month": STRIPE_PRICE_PRO_MONTHLY,
    "pro_year": STRIPE_PRICE_PRO_YEARLY,
    "elite_month": STRIPE_PRICE_ELITE_MONTHLY,
    "elite_year": STRIPE_PRICE_ELITE_YEARLY,
    # Early adopter (annual only)
    "ea_pro_year": STRIPE_PRICE_EA_PRO_YEARLY,
    "ea_elite_year": STRIPE_PRICE_EA_ELITE_YEARLY,
    # Lifetime (one-time)
    "lifetime_pro": STRIPE_PRICE_LIFETIME_PRO,
    "lifetime_elite": STRIPE_PRICE_LIFETIME_ELITE,
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
        # Add plan_type column for lifetime tracking
        try:
            conn.execute("ALTER TABLE subscriptions ADD COLUMN plan_type TEXT DEFAULT 'subscription'")
        except Exception:
            logger.debug("plan_type column already exists or migration failed", exc_info=True)
        # Early adopter reservation table for atomic slot checking
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ea_reservations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                tier TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.commit()
    logger.info("Subscriptions table initialized")


def _reserve_ea_slot(user_id: int, tier: str, limit: int, plan_filter: str) -> dict | None:
    """Atomically reserve an early adopter slot. Returns error dict or None on success."""
    with auth_module.get_users_db() as conn:
        # Clean up expired reservations first
        conn.execute("DELETE FROM ea_reservations WHERE expires_at < CURRENT_TIMESTAMP")
        # Atomic check: count confirmed users + active reservations
        confirmed = conn.execute(
            f"SELECT COUNT(*) FROM users WHERE plan IN {plan_filter}"
        ).fetchone()[0]
        reserved = conn.execute(
            "SELECT COUNT(*) FROM ea_reservations WHERE tier = ? AND expires_at > CURRENT_TIMESTAMP",
            (tier,),
        ).fetchone()[0]
        if confirmed + reserved >= limit:
            conn.commit()
            return {"error": f"Early adopter {tier.title()} spots are full", "status": 400}
        # Reserve slot (expires in 30 minutes — Stripe checkout timeout)
        conn.execute(
            "INSERT INTO ea_reservations (user_id, tier, expires_at) VALUES (?, ?, datetime('now', '+30 minutes'))",
            (user_id, tier),
        )
        conn.commit()
    return None


def _clear_ea_reservation(user_id: int, tier: str):
    """Clear reservation after successful checkout completion."""
    try:
        with auth_module.get_users_db() as conn:
            conn.execute("DELETE FROM ea_reservations WHERE user_id = ? AND tier = ?", (user_id, tier))
            conn.commit()
    except Exception:
        logger.exception("Failed to clear EA reservation for user %s", user_id)


def get_subscriber_counts() -> dict:
    """Count current active subscribers by tier. Used for early adopter / lifetime caps."""
    with auth_module.get_users_db() as conn:
        pro_count = conn.execute(
            "SELECT COUNT(*) FROM users WHERE plan IN ('pro', 'pro_lifetime')"
        ).fetchone()[0]
        elite_count = conn.execute(
            "SELECT COUNT(*) FROM users WHERE plan IN ('elite', 'elite_lifetime')"
        ).fetchone()[0]
        lifetime_count = conn.execute(
            "SELECT COUNT(*) FROM users WHERE plan IN ('pro_lifetime', 'elite_lifetime')"
        ).fetchone()[0]
        return {
            "pro_total": pro_count,
            "elite_total": elite_count,
            "lifetime_total": lifetime_count,
        }


def get_early_adopter_status() -> dict:
    """Return early adopter pricing availability and remaining slots."""
    counts = get_subscriber_counts()
    return {
        "early_adopter": {
            "enabled": EA_ENABLED,
            "pro": {
                "limit": EA_PRO_LIMIT,
                "used": counts["pro_total"],
                "remaining": max(0, EA_PRO_LIMIT - counts["pro_total"]),
                "available": EA_ENABLED and counts["pro_total"] < EA_PRO_LIMIT,
                "price": "$59.99/yr",
                "savings": "25% off",
            },
            "elite": {
                "limit": EA_ELITE_LIMIT,
                "used": counts["elite_total"],
                "remaining": max(0, EA_ELITE_LIMIT - counts["elite_total"]),
                "available": EA_ENABLED and counts["elite_total"] < EA_ELITE_LIMIT,
                "price": "$99.99/yr",
                "savings": "33% off",
            },
        },
        "lifetime": {
            "enabled": LIFETIME_ENABLED,
            "limit": LIFETIME_LIMIT,
            "used": counts["lifetime_total"],
            "remaining": max(0, LIFETIME_LIMIT - counts["lifetime_total"]),
            "available": LIFETIME_ENABLED and counts["lifetime_total"] < LIFETIME_LIMIT,
            "pro_price": "$249.99",
            "elite_price": "$399.99",
        },
    }


# Promo codes — validated server-side, applied as Stripe coupon
# Map promo code string -> Stripe coupon ID (set in env, created in Stripe dashboard)
_PROMO_CODES = {
    "RAZZLE": os.environ.get("STRIPE_COUPON_RAZZLE", ""),  # 20% off first year
}

# Trial duration in days
_TRIAL_DAYS = 7


def _user_had_trial(user_id: int) -> bool:
    """Check if user has ever had a trial (prevent re-trial abuse).
    Checks both the subscriptions table (Stripe trial) and users table (no-CC trial)."""
    with auth_module.get_users_db() as conn:
        # Check Stripe subscription trial
        row = conn.execute(
            "SELECT trial_used FROM subscriptions WHERE user_id = ? AND trial_used = 1 LIMIT 1",
            (user_id,),
        ).fetchone()
        if row:
            return True
        # Check no-CC registration trial (users.trial_used column)
        try:
            user_row = conn.execute(
                "SELECT trial_used FROM users WHERE id = ? AND trial_used = 1 LIMIT 1",
                (user_id,),
            ).fetchone()
            if user_row:
                return True
        except Exception:
            logger.warning("Failed to check trial_used column for user %s", user_id, exc_info=True)
        return False


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
    ea_pro_year, ea_elite_year (early adopter),
    lifetime_pro, lifetime_elite (one-time),
    or legacy: month, year (maps to Pro).
    promo_code: optional promo code for discount.
    """
    if not STRIPE_SECRET_KEY:
        return {"error": "Stripe not configured", "status": 503}

    # Idempotency: reject if user already has an active paid plan
    # Use raw_plan (not user["plan"]) because _user_dict() elevates trial users to "pro"
    raw_plan = user.get("raw_plan", user.get("plan", "free"))
    if raw_plan in ("pro", "elite", "pro_lifetime", "elite_lifetime"):
        return {"error": "You already have an active subscription. Manage it from your billing portal.", "status": 400}

    # Secondary check: catch the race between checkout creation and webhook processing
    with auth_module.get_users_db() as conn:
        active_sub = conn.execute(
            "SELECT id FROM subscriptions WHERE user_id = ? AND status IN ('active', 'trialing') LIMIT 1",
            (user["id"],),
        ).fetchone()
    if active_sub:
        return {"error": "You already have an active subscription.", "status": 400}

    is_lifetime = interval.startswith("lifetime_")
    is_early_adopter = interval.startswith("ea_")

    # Validate early adopter availability with atomic reservation
    if is_early_adopter:
        if not EA_ENABLED:
            return {"error": "Early adopter pricing is not currently active", "status": 400}
        ea_tier = "elite" if "elite" in interval else "pro"
        ea_limit = EA_ELITE_LIMIT if ea_tier == "elite" else EA_PRO_LIMIT
        ea_plan_filter = "('elite', 'elite_lifetime')" if ea_tier == "elite" else "('pro', 'pro_lifetime')"
        reservation_err = _reserve_ea_slot(user["id"], ea_tier, ea_limit, ea_plan_filter)
        if reservation_err:
            return reservation_err

    # Validate lifetime availability
    if is_lifetime:
        if not LIFETIME_ENABLED:
            return {"error": "Lifetime deals are not currently active", "status": 400}
        counts = get_subscriber_counts()
        if counts["lifetime_total"] >= LIFETIME_LIMIT:
            return {"error": "Lifetime deal spots are full", "status": 400}

    price_id = _PRICE_MAP.get(interval, "")
    if not price_id:
        return {"error": f"Stripe price ID for '{interval}' not configured", "status": 503}

    # Determine plan tier for metadata
    if "elite" in interval:
        plan_tier = "elite_lifetime" if is_lifetime else "elite"
    else:
        plan_tier = "pro_lifetime" if is_lifetime else "pro"

    # Check trial eligibility (only for regular subscriptions, not lifetime/EA)
    trial_eligible = not is_lifetime and not is_early_adopter and not _user_had_trial(user["id"])
    trial_days = _TRIAL_DAYS if trial_eligible else None

    # Validate promo code if provided
    coupon_id = None
    if promo_code:
        code_upper = promo_code.strip().upper()
        coupon_id = _PROMO_CODES.get(code_upper)
        if not coupon_id:
            return {"error": "Invalid promo code", "status": 400}

    try:
        # Get or create Stripe customer
        customer_id = _get_or_create_customer(user)

        if is_lifetime:
            # Lifetime deals use one-time payment mode
            session_kwargs = {
                "customer": customer_id,
                "payment_method_types": ["card"],
                "line_items": [{"price": price_id, "quantity": 1}],
                "mode": "payment",
                "success_url": SUCCESS_URL,
                "cancel_url": CANCEL_URL,
                "metadata": {"user_id": str(user["id"]), "plan_tier": plan_tier},
            }
        else:
            # Subscription mode (regular, early adopter)
            sub_data = {"metadata": {"plan_tier": plan_tier}}
            if trial_days:
                sub_data["trial_period_days"] = trial_days

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

        # Apply coupon if promo code valid (not for lifetime)
        if coupon_id and not is_lifetime:
            session_kwargs["discounts"] = [{"coupon": coupon_id}]

        session = stripe.checkout.Session.create(**session_kwargs)
        return {
            "checkout_url": session.url,
            "session_id": session.id,
            "trial_days": trial_days,
        }
    except stripe.error.StripeError as e:
        logger.error("Stripe checkout error: %s", e, exc_info=True)
        return {"error": "Payment processing failed. Please try again or contact support.", "status": 400}


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

    event_type = event.get("type")
    data = event.get("data", {}).get("object")
    if not event_type or data is None:
        logger.error("Malformed Stripe webhook: missing type or data.object")
        return {"error": "Invalid event structure", "status": 400}

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(data)
    elif event_type == "customer.subscription.updated":
        _handle_subscription_updated(data)
    elif event_type == "customer.subscription.deleted":
        _handle_subscription_deleted(data)
    elif event_type == "invoice.payment_failed":
        _handle_payment_failed(data)
    elif event_type == "invoice.paid":
        _handle_invoice_paid(data)
    elif event_type == "charge.dispute.created":
        _handle_dispute_created(data)
    elif event_type == "charge.refunded":
        _handle_charge_refunded(data)
    elif event_type == "customer.subscription.paused":
        _handle_subscription_paused(data)

    return {"status": "ok"}


def _handle_checkout_completed(session):
    """Upgrade user to pro or elite after successful checkout."""
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")
    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id")
    plan_tier = metadata.get("plan_tier", "pro")  # default to pro for legacy

    # Validate plan tier
    if plan_tier not in ("pro", "elite", "pro_lifetime", "elite_lifetime"):
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

    # Validate user_id is numeric before DB operations
    try:
        _uid = int(user_id)
    except (TypeError, ValueError):
        logger.error(f"Invalid user_id in checkout metadata: {user_id!r}")
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
        conn.execute("UPDATE users SET plan = ? WHERE id = ?", (plan_tier, _uid))

        # Upsert subscription record
        existing = conn.execute(
            "SELECT id FROM subscriptions WHERE user_id = ?", (_uid,)
        ).fetchone()
        status = "trialing" if is_trial else "active"
        is_lifetime = plan_tier.endswith("_lifetime")
        p_type = "lifetime" if is_lifetime else "subscription"
        trial_used_val = 1 if is_trial else 0
        if existing:
            conn.execute("""
                UPDATE subscriptions SET
                    stripe_customer_id = ?, stripe_subscription_id = ?,
                    plan = ?, status = ?, trial_used = MAX(trial_used, ?), trial_end = ?,
                    plan_type = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (customer_id, subscription_id, plan_tier, status, trial_used_val, trial_end, p_type, _uid))
        else:
            conn.execute("""
                INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, trial_used, trial_end, plan_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (_uid, customer_id, subscription_id, plan_tier, status, trial_used_val, trial_end, p_type))

        conn.commit()
    # Clear any early adopter reservation now that checkout is confirmed
    ea_tier = "elite" if "elite" in plan_tier else "pro"
    _clear_ea_reservation(_uid, ea_tier)
    logger.info(f"User {user_id} upgraded to {plan_tier} (subscription {subscription_id}, trial={is_trial})")


def _handle_subscription_updated(subscription):
    """Sync plan when subscription is updated via Stripe portal (plan change, reactivation, etc.).
    Skips lifetime users — their plan is permanent."""
    customer_id = subscription.get("customer")
    status = subscription.get("status") or "unknown"  # active, past_due, trialing, canceled, etc.
    metadata = subscription.get("metadata", {})
    plan_tier = metadata.get("plan_tier")

    with auth_module.get_users_db() as conn:
        row = conn.execute("SELECT id, plan FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
        if not row:
            logger.warning(f"Subscription updated for unknown customer {customer_id}")
            return

        # Never touch lifetime plans
        if row["plan"] in ("pro_lifetime", "elite_lifetime"):
            logger.info(f"User {row['id']} has lifetime plan — skipping subscription update")
            return

        # If subscription went to canceled/unpaid, downgrade
        if status in ("canceled", "unpaid"):
            conn.execute("UPDATE users SET plan = 'free' WHERE id = ?", (row["id"],))
            conn.execute("""
                UPDATE subscriptions SET plan = 'free', status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (status, row["id"]))
            conn.commit()
            logger.info(f"User {row['id']} downgraded to free (subscription {status})")
            return

        # If plan_tier in metadata, sync it (handles upgrades/downgrades via portal)
        if plan_tier and plan_tier in ("pro", "elite"):
            conn.execute("UPDATE users SET plan = ? WHERE id = ?", (plan_tier, row["id"]))
            conn.execute("""
                UPDATE subscriptions SET plan = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (plan_tier, status, row["id"]))
            conn.commit()
            logger.info(f"User {row['id']} plan synced to {plan_tier} (subscription {status})")
        else:
            # At minimum sync the status
            conn.execute("""
                UPDATE subscriptions SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (status, row["id"]))
            conn.commit()


def _handle_subscription_deleted(subscription):
    """Downgrade user to free when subscription cancelled. Skips lifetime users."""
    customer_id = subscription.get("customer")

    with auth_module.get_users_db() as conn:
        row = conn.execute("SELECT id, plan FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
        if row:
            # Never downgrade lifetime plans
            if row["plan"] in ("pro_lifetime", "elite_lifetime"):
                logger.info(f"User {row['id']} has lifetime plan — skipping downgrade")
                return
            conn.execute("UPDATE users SET plan = 'free' WHERE id = ?", (row["id"],))
            conn.execute("""
                UPDATE subscriptions SET plan = 'free', status = 'cancelled', updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (row["id"],))
            conn.commit()
            logger.info(f"User {row['id']} downgraded to free (subscription cancelled)")


def _handle_payment_failed(invoice):
    """Mark subscription as payment_failed but do NOT downgrade plan.

    Stripe retries failed payments multiple times over days. The actual
    downgrade happens in _handle_subscription_deleted when Stripe gives up
    and cancels the subscription.
    """
    customer_id = invoice.get("customer")

    with auth_module.get_users_db() as conn:
        row = conn.execute("SELECT id, plan FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
        if row:
            if row["plan"] in ("pro_lifetime", "elite_lifetime"):
                logger.info(f"User {row['id']} has lifetime plan — skipping payment failure")
                return
            conn.execute("""
                UPDATE subscriptions SET status = 'payment_failed', updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (row["id"],))
            conn.commit()
            logger.warning(f"Payment failed for user {row['id']} — marked payment_failed (plan unchanged, awaiting Stripe retry)")


def _handle_invoice_paid(invoice):
    """Confirm subscription is active after successful recurring payment.

    Handles the case where checkout.session.completed was missed or
    a renewal payment succeeds — ensures user plan stays in sync.
    """
    customer_id = invoice.get("customer")
    subscription_id = invoice.get("subscription")
    if not subscription_id:
        return  # One-time invoices (lifetime deals) don't need sync

    with auth_module.get_users_db() as conn:
        row = conn.execute("SELECT id, plan FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
        if not row:
            logger.warning(f"Invoice paid for unknown customer {customer_id}")
            return

        # Lifetime plans don't need renewal sync
        if row["plan"] in ("pro_lifetime", "elite_lifetime"):
            return

        # If user is on free but has an active subscription, restore their plan
        if row["plan"] == "free":
            try:
                sub = stripe.Subscription.retrieve(subscription_id)
                plan_tier = sub.get("metadata", {}).get("plan_tier", "pro")
                if plan_tier not in ("pro", "elite"):
                    plan_tier = "pro"
                conn.execute("UPDATE users SET plan = ? WHERE id = ?", (plan_tier, row["id"]))
                conn.execute("""
                    UPDATE subscriptions SET plan = ?, status = 'active', updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                """, (plan_tier, row["id"]))
                conn.commit()
                logger.info(f"User {row['id']} restored to {plan_tier} via invoice.paid")
            except stripe.error.StripeError:
                logger.exception(f"Failed to retrieve subscription {subscription_id} for invoice.paid")
        else:
            # User already on correct plan — just confirm active status
            conn.execute("""
                UPDATE subscriptions SET status = 'active', updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (row["id"],))
            conn.commit()


def _handle_dispute_created(dispute):
    """Log chargeback disputes. Does not auto-downgrade — disputes can be won."""
    customer_id = dispute.get("customer")
    amount = dispute.get("amount", 0)
    reason = dispute.get("reason", "unknown")

    with auth_module.get_users_db() as conn:
        row = conn.execute("SELECT id, plan, email FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
        if row:
            logger.warning(
                f"DISPUTE: user {row['id']} ({row['email']}), amount={amount}, "
                f"reason={reason}, plan={row['plan']}"
            )
        else:
            logger.warning(f"DISPUTE: unknown customer {customer_id}, amount={amount}, reason={reason}")


def _handle_charge_refunded(charge):
    """Downgrade user to free after a refund."""
    customer_id = charge.get("customer")
    if not customer_id:
        return

    with auth_module.get_users_db() as conn:
        row = conn.execute("SELECT id, plan FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
        if not row:
            logger.warning(f"Charge refunded for unknown customer {customer_id}")
            return

        if row["plan"] in ("pro_lifetime", "elite_lifetime"):
            logger.info(f"User {row['id']} has lifetime plan — skipping refund downgrade")
            return

        conn.execute("UPDATE users SET plan = 'free' WHERE id = ?", (row["id"],))
        conn.execute("""
            UPDATE subscriptions SET plan = 'free', status = 'refunded', updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        """, (row["id"],))
        conn.commit()
        logger.info(f"User {row['id']} downgraded to free after charge refund")


def _handle_subscription_paused(subscription):
    """Set user to free while subscription is paused."""
    customer_id = subscription.get("customer")

    with auth_module.get_users_db() as conn:
        row = conn.execute("SELECT id, plan FROM users WHERE stripe_customer_id = ?", (customer_id,)).fetchone()
        if not row:
            logger.warning(f"Subscription paused for unknown customer {customer_id}")
            return

        if row["plan"] in ("pro_lifetime", "elite_lifetime"):
            logger.info(f"User {row['id']} has lifetime plan — skipping pause downgrade")
            return

        conn.execute("UPDATE users SET plan = 'free' WHERE id = ?", (row["id"],))
        conn.execute("""
            UPDATE subscriptions SET plan = 'free', status = 'paused', updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        """, (row["id"],))
        conn.commit()
        logger.info(f"User {row['id']} downgraded to free (subscription paused)")


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
                return_url=f"{_BASE_URL}/agents",
            )
            result["portal_url"] = portal.url
        except Exception as e:
            logger.error(f"Portal creation error: {e}")

    return result


def reconcile_subscriptions():
    """Sync user plans with Stripe subscription state.

    Runs periodically to catch cases where webhooks failed silently.
    Queries all paid (non-lifetime) users, checks Stripe, and fixes mismatches.
    """
    if not STRIPE_SECRET_KEY:
        logger.debug("Stripe not configured — skipping reconciliation")
        return

    fixed = 0
    errors = 0

    with auth_module.get_users_db() as conn:
        # Get all paid subscription users (exclude lifetime — those are permanent)
        rows = conn.execute(
            "SELECT u.id, u.plan, u.email, s.stripe_subscription_id "
            "FROM users u JOIN subscriptions s ON u.id = s.user_id "
            "WHERE u.plan IN ('pro', 'elite') AND s.plan_type = 'subscription' "
            "AND s.stripe_subscription_id IS NOT NULL"
        ).fetchall()

    for row in rows:
        try:
            sub = stripe.Subscription.retrieve(row["stripe_subscription_id"])
            stripe_status = sub.get("status", "unknown")

            if stripe_status in ("canceled", "unpaid", "past_due", "paused"):
                # Stripe says inactive but user still has paid plan — downgrade
                with auth_module.get_users_db() as conn:
                    conn.execute("UPDATE users SET plan = 'free' WHERE id = ?", (row["id"],))
                    conn.execute(
                        "UPDATE subscriptions SET plan = 'free', status = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
                        (stripe_status, row["id"]),
                    )
                    conn.commit()
                logger.warning(
                    f"Reconciliation: user {row['id']} ({row['email']}) downgraded — "
                    f"Stripe status={stripe_status}, was plan={row['plan']}"
                )
                fixed += 1
        except stripe.error.StripeError as e:
            logger.error(f"Reconciliation: Stripe API error for user {row['id']}: {e}")
            errors += 1

    # Also check free users who might have active Stripe subscriptions (webhook missed)
    with auth_module.get_users_db() as conn:
        free_rows = conn.execute(
            "SELECT u.id, u.email, s.stripe_subscription_id "
            "FROM users u JOIN subscriptions s ON u.id = s.user_id "
            "WHERE u.plan = 'free' AND s.plan_type = 'subscription' "
            "AND s.stripe_subscription_id IS NOT NULL AND s.status != 'cancelled'"
        ).fetchall()

    for row in free_rows:
        try:
            sub = stripe.Subscription.retrieve(row["stripe_subscription_id"])
            stripe_status = sub.get("status", "unknown")

            if stripe_status == "active":
                plan_tier = sub.get("metadata", {}).get("plan_tier", "pro")
                if plan_tier not in ("pro", "elite"):
                    plan_tier = "pro"
                with auth_module.get_users_db() as conn:
                    conn.execute("UPDATE users SET plan = ? WHERE id = ?", (plan_tier, row["id"]))
                    conn.execute(
                        "UPDATE subscriptions SET plan = ?, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
                        (plan_tier, row["id"]),
                    )
                    conn.commit()
                logger.warning(
                    f"Reconciliation: user {row['id']} ({row['email']}) restored to {plan_tier} — "
                    f"Stripe active but was plan=free"
                )
                fixed += 1
        except stripe.error.StripeError as e:
            logger.error(f"Reconciliation: Stripe API error for user {row['id']}: {e}")
            errors += 1

    logger.info(f"Subscription reconciliation complete: {fixed} fixed, {errors} errors, {len(rows) + len(free_rows)} checked")
