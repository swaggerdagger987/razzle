# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## TICKET 1: Auth System — Registration, Login, JWT, Protected Endpoints

**Phase Name**: Auth System — Registration, Login, JWT, Protected Endpoints
**Exit Criterion**: Users can register with email/password, log in, receive a JWT token, and access protected endpoints. Passwords stored as bcrypt hashes. JWT secret stored as environment variable. Frontend shows login/register modal, stores token in localStorage, sends Authorization header on all API requests. Protected endpoints return 401 without valid token. User table persists in SQLite. Sleeper username linkable to account. Deployed to Render.

### Task 1: Backend auth endpoints + user table
**Requirement**: "Add auth system to the backend: (a) Add bcrypt and PyJWT to requirements.txt. (b) Create a users table in terminal.db: id (INTEGER PRIMARY KEY), email (TEXT UNIQUE NOT NULL), password_hash (TEXT NOT NULL), sleeper_username (TEXT), created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP), plan (TEXT DEFAULT 'free'). (c) Add POST /api/auth/register endpoint: accepts {email, password}. Validate email format (regex). Check email not already registered (409 Conflict). Hash password with bcrypt (12 rounds). Insert into users table. Return {token, user: {id, email, plan}}. (d) Add POST /api/auth/login endpoint: accepts {email, password}. Look up user by email (404 if not found). Verify password against hash (401 if wrong). Generate JWT with {user_id, email, plan} payload, 7-day expiry. Return {token, user: {id, email, plan, sleeper_username}}. (e) Add GET /api/auth/me endpoint: requires Authorization: Bearer <token> header. Verify JWT signature and expiry. Return current user info. (f) JWT secret key read from environment variable JWT_SECRET. If not set, generate a random one on startup (for local dev only, log a warning). (g) Add a require_auth() dependency function that extracts and verifies the JWT from the Authorization header. Returns user dict or raises 401."
**Accept when**:
- POST /api/auth/register creates user and returns JWT
- POST /api/auth/register rejects duplicate email (409)
- POST /api/auth/register rejects invalid email format (400)
- POST /api/auth/login returns JWT for valid credentials
- POST /api/auth/login returns 401 for wrong password
- GET /api/auth/me returns user info with valid token
- GET /api/auth/me returns 401 without token
- Passwords stored as bcrypt hashes (not plaintext)
- JWT_SECRET read from env var
**Depends on**: none
**Size**: L

### Task 2: Frontend login/register modal + token management
**Requirement**: "Add auth UI to the frontend: (a) Add a 'Sign In' button in the top-right nav area of all pages (lab.html, index.html, agents.html, league-intel.html). When logged in, show the user's email and a 'Sign Out' button instead. (b) Clicking 'Sign In' opens a modal with two tabs: 'Sign In' and 'Register'. Register tab has email + password + confirm password fields. Sign In tab has email + password fields. Both have a submit button. (c) On successful register/login, store the JWT token in localStorage under 'razzle_token'. Store user info under 'razzle_user'. (d) Add a getAuthHeaders() function to app.js that returns {Authorization: 'Bearer ' + token} if a token exists in localStorage. (e) Update apiFetch() in app.js to automatically include auth headers on every request using getAuthHeaders(). (f) On page load, check localStorage for existing token. If found, call GET /api/auth/me to verify it's still valid. If expired/invalid, clear localStorage and show Sign In button. (g) Sign Out clears localStorage token and user, reloads the page. (h) Modal follows Razzle design system: sand bg, chunky borders, Luckiest Guy header, Space Mono inputs."
**Accept when**:
- Sign In button visible on all pages when logged out
- Email + Sign Out visible when logged in
- Register flow works end-to-end (creates account, stores token, shows logged-in state)
- Login flow works end-to-end
- Sign Out clears state and shows Sign In button
- Token persists across page reloads
- Expired token gets cleared automatically
- Modal matches Razzle design system
**Depends on**: Task 1
**Size**: L

### Task 3: Link Sleeper username to account
**Requirement**: "Add Sleeper username linking to auth: (a) Add POST /api/auth/link-sleeper endpoint: requires auth. Accepts {sleeper_username}. Validates the username exists by calling Sleeper API (GET https://api.sleeper.app/v1/user/{username}). If valid, update the user's sleeper_username in the users table. Return updated user info. If invalid username, return 400. (b) In the frontend, after login, if the user has no sleeper_username linked, show a prompt: 'Connect your Sleeper account for league features.' with an input field and 'Connect' button. (c) If already linked, show the Sleeper username in the nav next to the email. (d) League Intel page should check for linked Sleeper username and show appropriate state (connected vs. not connected)."
**Accept when**:
- POST /api/auth/link-sleeper validates username against Sleeper API
- Invalid Sleeper username returns 400
- Valid username saved to user record
- Frontend prompts for Sleeper connection after first login
- Connected username shown in nav
- League Intel page respects connection status
**Depends on**: Tasks 1, 2
**Size**: M

### Task 4: Protect War Room endpoints + free vs paid gating
**Requirement**: "Add auth-based access control: (a) Mark these endpoints as requiring auth using the require_auth() dependency: POST /api/formulas/publish, POST /api/waitlist (remove — users are now registered), any future agent/briefing endpoints. (b) Add plan-based gating: create a require_plan(plan) dependency that checks user.plan against required plan ('free', 'pro'). (c) War Room agent endpoints should work in 'free' mode (generic queries) without auth, but 'pro' mode (league-contextualized) requires auth + plan='pro'. (d) Frontend: update the existing paywall blur UI to check actual auth state instead of hardcoded gating. If user is logged in with plan='free', show the blur with 'Upgrade to Pro — $240/year' CTA. If plan='pro', show full content. If not logged in, show 'Sign In to access'. (e) The Lab remains fully free and functional without login — auth is never required for screener, formulas, charts, or export."
**Accept when**:
- Lab works fully without login (no auth required for any Lab feature)
- Formula publish requires auth
- War Room free mode works without auth
- War Room pro mode requires auth + pro plan
- Paywall UI shows correct state based on actual auth
- Upgrade CTA visible for free-plan users
- require_plan() returns 403 for insufficient plan
**Depends on**: Tasks 1, 2
**Size**: M

### Task 5: Migrate user formulas from localStorage to database
**Requirement**: "Move formula storage from localStorage to the database for logged-in users: (a) Add user_formulas table: id, user_id (FK to users), name (TEXT), weights (JSON TEXT), created_at, updated_at. (b) Add GET /api/formulas/mine endpoint (requires auth): returns all formulas for the current user. (c) Add POST /api/formulas endpoint (requires auth): saves a formula to the database. (d) Add DELETE /api/formulas/:id endpoint (requires auth): deletes a formula owned by the current user. (e) Frontend: if user is logged in, load formulas from API instead of localStorage. Save new formulas to API. Keep localStorage as fallback for non-logged-in users — their formulas still work, they just don't sync across devices. (f) On first login, if the user has formulas in localStorage, offer to migrate them to their account (one-time prompt: 'You have N saved formulas. Save them to your account?')."
**Accept when**:
- Logged-in users' formulas stored in database
- Formulas persist across devices when logged in
- Non-logged-in users still use localStorage (no regression)
- Formula migration prompt appears on first login with existing localStorage formulas
- GET/POST/DELETE formula endpoints work with auth
- Can't delete another user's formula
**Depends on**: Tasks 1, 2
**Size**: M

### Task 6: Add persistent user database separate from stats
**Requirement**: "The main terminal.db gets rebuilt from nflverse CSVs on every Render deploy. User data (accounts, formulas, subscriptions) must NOT be wiped on deploy. Fix: (a) Create a separate users.db SQLite file for all user data (users, user_formulas, subscriptions, formula_store tables). (b) Update all auth and formula endpoints to use users.db connection instead of terminal.db. (c) Update render.yaml buildCommand: the nflverse adapter rebuild should NOT touch users.db. Only terminal.db gets rebuilt. (d) Add users.db to the Render persistent disk path if using paid instance, OR document that users.db must be backed up separately. (e) On startup, server.py should create users.db and run migrations (CREATE TABLE IF NOT EXISTS) if it doesn't exist. (f) Keep terminal.db for all player stats (read-only, rebuilt on deploy). Keep users.db for all user data (persistent, never rebuilt)."
**Accept when**:
- users.db exists separate from terminal.db
- Auth endpoints use users.db
- Formula endpoints use users.db
- Deploying/rebuilding terminal.db does not affect users.db
- Server creates users.db with schema on first startup
- All user data survives a simulated rebuild of terminal.db
**Depends on**: Tasks 1, 5
**Size**: M

### Task 7: Deploy + smoke test auth system
**Requirement**: "Verify the complete auth system works: (a) All JS passes syntax check. (b) All Python imports clean (bcrypt, PyJWT added to requirements.txt). (c) Register a test user → receive JWT → verify /api/auth/me works. (d) Login with test user → token returned. (e) Wrong password → 401. (f) Duplicate email → 409. (g) Link Sleeper username → validates against Sleeper API. (h) Protected endpoints return 401 without token. (i) Lab works fully without login. (j) users.db persists separately from terminal.db. (k) Set JWT_SECRET env var on Render. Push to master."
**Accept when**: All syntax clean. Auth flow works end-to-end. Protected endpoints enforce auth. Lab stays free. users.db separate from terminal.db. Committed and pushed to master.
**Depends on**: Tasks 1-6
**Size**: S

---

## TICKET 2: Stripe Integration — $240/yr Subscription

**Phase Name**: Stripe Integration — Subscriptions and Payment
**Exit Criterion**: Users can subscribe to Razzle Pro ($240/year or $20/month) via Stripe Checkout. Successful payment updates user plan to 'pro' in users.db. Webhook handles subscription events (created, cancelled, payment failed). Pro users see full War Room content. Cancelled users downgrade to free. Deployed to Render.

### Task 1: Backend Stripe endpoints + webhook
**Requirement**: "Add Stripe integration to the backend: (a) Add stripe to requirements.txt. (b) Read STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET from environment variables. (c) Add POST /api/billing/create-checkout endpoint (requires auth): creates a Stripe Checkout Session for the current user. Include two price options: $240/year (default) and $20/month. Set success_url to https://razzle.lol/agents?session_id={CHECKOUT_SESSION_ID}. Set cancel_url to https://razzle.lol/agents. Store stripe_customer_id on the user record after first checkout. (d) Add POST /api/billing/webhook endpoint (no auth — Stripe calls this directly): verify webhook signature using STRIPE_WEBHOOK_SECRET. Handle events: checkout.session.completed → update user plan to 'pro' and store subscription_id. customer.subscription.deleted → update user plan to 'free'. invoice.payment_failed → flag user for follow-up. (e) Add GET /api/billing/status endpoint (requires auth): returns current user's plan, subscription status, next billing date, and a Stripe Customer Portal URL for managing subscription. (f) Add subscriptions table to users.db: user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end."
**Accept when**:
- POST /api/billing/create-checkout returns a Stripe Checkout URL
- Checkout session includes yearly and monthly price options
- Webhook correctly handles checkout.session.completed (upgrades to pro)
- Webhook correctly handles subscription.deleted (downgrades to free)
- GET /api/billing/status returns current plan info
- Stripe Customer Portal URL works for managing subscription
- All Stripe keys read from environment variables (never hardcoded)
**Depends on**: none
**Size**: L

### Task 2: Frontend upgrade flow + billing UI
**Requirement**: "Add subscription UI to the frontend: (a) On the War Room page (agents.html), the existing paywall blur should show an 'Upgrade to Pro' button for free-plan users. Clicking it calls POST /api/billing/create-checkout and redirects to Stripe Checkout. (b) After successful payment, user is redirected back to /agents with plan='pro'. The paywall blur should be gone and full War Room content visible. (c) Add a 'Manage Subscription' link in the user dropdown (when logged in as pro). Clicking it calls GET /api/billing/status and redirects to the Stripe Customer Portal. (d) Show plan badge next to username in nav: 'Free' (gray) or 'Pro' (terracotta/orange). (e) On the home page, add pricing info to the CTA section: 'Razzle Pro — $240/year ($20/month). Full league context. Agent memory. Personalized briefings.' with a 'Get Started' button that goes to register (if not logged in) or checkout (if logged in). (f) Follow Razzle design system for all billing UI."
**Accept when**:
- Upgrade button on War Room redirects to Stripe Checkout
- After payment, War Room content is fully accessible
- Manage Subscription link opens Stripe Customer Portal
- Plan badge shows in nav (Free vs Pro)
- Pricing CTA on home page
- Design system followed
**Depends on**: Task 1
**Size**: M

### Task 3: Deploy + smoke test Stripe integration
**Requirement**: "Verify Stripe integration works: (a) All JS passes syntax check. (b) All Python imports clean (stripe added to requirements.txt). (c) Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET env vars on Render. (d) Create Stripe products: 'Razzle Pro Annual' at $240/year and 'Razzle Pro Monthly' at $20/month. (e) Test checkout flow with Stripe test mode card (4242 4242 4242 4242). (f) Verify webhook updates user plan after successful payment. (g) Verify cancelled subscription downgrades user to free. (h) Pro users see full War Room, free users see paywall. Push to master."
**Accept when**: All syntax clean. Stripe test checkout works. Webhook processes events. Plan gating works. Committed and pushed to master.
**Depends on**: Tasks 1, 2
**Size**: S
