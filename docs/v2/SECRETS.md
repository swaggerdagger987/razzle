# Secrets — Human fills these later

The loop builds everything **except** live credentials. Copy to `apps/api/.env` when ready.

| Variable | Purpose | Required for localhost |
|----------|---------|----------------------|
| `JWT_SECRET` | Auth tokens | Yes — any dev string |
| `DEV_PLAN` | Premium testing | Optional — `elite` |
| `RAZZLE_LLM_API_KEY` | Situation Room agents | Optional — stub mode works |
| `STRIPE_SECRET_KEY` | Billing | **No** — use dev tier toggle |
| `STRIPE_WEBHOOK_SECRET` | Plan sync | **No** |
| `STRIPE_PRICE_PRO_YEARLY` | Checkout | **No** |
| `SENTRY_DSN` | Errors | **No** |
| `POSTHOG_PROJECT_API_KEY` | Analytics | **No** |
| `REDDIT_*` | !razzle bot (fact confirm + intel replies) | **No** — deploy after product + mod outreach (`docs/v2/REDDIT.md`) |

Everything else (routes, UI, webhooks handlers, empty states) ships without these.
