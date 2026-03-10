# Razzle Loop — Phase 42 Task List

> Consumed from TICKETS.md (Ticket 1).

**Current Phase**: 42 — Auth System — Registration, Login, JWT, Protected Endpoints
**Exit Criterion**: Users can register with email/password, log in, receive a JWT token, and access protected endpoints. Passwords stored as bcrypt hashes. JWT secret stored as environment variable. Frontend shows login/register modal, stores token in localStorage, sends Authorization header on all API requests. Protected endpoints return 401 without valid token. User table persists in SQLite. Sleeper username linkable to account. Deployed to Render.

---

## Task 1: Backend auth endpoints + user table
**Status**: PASS
**Result**: Created backend/auth.py with users.db (separate from terminal.db), bcrypt password hashing (12 rounds), JWT tokens (7-day expiry). Endpoints: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me, POST /api/auth/link-sleeper (validates against Sleeper API). All error cases handled (409 duplicate, 400 invalid email, 401 wrong password, 401 invalid token). JWT_SECRET from env var with dev fallback. Added bcrypt and PyJWT to requirements.txt.
**Acceptance Criteria**:
- POST /api/auth/register creates user and returns JWT
- POST /api/auth/register rejects duplicate email (409)
- POST /api/auth/register rejects invalid email format (400)
- POST /api/auth/login returns JWT for valid credentials
- POST /api/auth/login returns 401 for wrong password
- GET /api/auth/me returns user info with valid token
- GET /api/auth/me returns 401 without token
- Passwords stored as bcrypt hashes (not plaintext)
- JWT_SECRET read from env var

## Task 2: Frontend login/register modal + token management
**Status**: PASS
**Result**: Added auth UI to app.js (injected via JS on all pages): login/register modal with tabbed interface, Sign In button in nav, email + Sign Out when logged in. Token stored in localStorage (razzle_token/razzle_user). checkAuth() verifies token on page load via GET /api/auth/me, auto-clears expired tokens. Added app.js to index.html, player.html, compare.html, 404.html. Auth modal CSS follows Razzle design system (sand bg, chunky 3px borders, orange tabs, Space Mono inputs). Responsive at 768px and 480px.
**Acceptance Criteria**:
- Sign In button visible on all pages when logged out
- Email + Sign Out visible when logged in
- Register flow works end-to-end
- Login flow works end-to-end
- Sign Out clears state and shows Sign In button
- Token persists across page reloads
- Expired token gets cleared automatically
- Modal matches Razzle design system

## Task 3: Link Sleeper username to account
**Status**: PASS
**Result**: After login/register, users without a linked Sleeper username see a prompt in the auth modal to connect. linkSleeperToAccount() calls POST /api/auth/link-sleeper. Connected username shown in nav instead of email prefix. League Intel page auto-connects using account-linked Sleeper username. Connecting on League Intel page also links to account if logged in.
**Acceptance Criteria**:
- POST /api/auth/link-sleeper validates username against Sleeper API
- Invalid Sleeper username returns 400
- Valid username saved to user record
- Frontend prompts for Sleeper connection after first login
- Connected username shown in nav
- League Intel page respects connection status

## Task 4: Protect War Room endpoints + free vs paid gating
**Status**: PASS
**Result**: Added require_plan() helper to server.py (returns 403 for insufficient plan). Formula publish requires auth (401 without token, uses account name as creator). War Room upsell CTA is auth-aware: "Sign In" for logged-out, "Connect Sleeper" for no-sleeper, "Upgrade to Pro" for free-plan. Formula Store handles 401 with auth prompt. Lab fully accessible without login.
**Acceptance Criteria**:
- Lab works fully without login
- Formula publish requires auth
- War Room free mode works without auth
- War Room pro mode requires auth + pro plan
- Paywall UI shows correct state based on actual auth
- Upgrade CTA visible for free-plan users
- require_plan() returns 403 for insufficient plan

## Task 5: Migrate user formulas from localStorage to database
**Status**: PASS
**Result**: Added formula CRUD to auth.py (get_user_formulas, save_user_formula, delete_user_formula, import_formulas). Endpoints: GET/POST /api/user/formulas, DELETE /api/user/formulas/{id}, POST /api/user/formulas/import. All require auth (401 without token). Can't delete another user's formula (403). formulas.js syncs saves/deletes to server when logged in. On login/register, migrateLocalFormulas() auto-imports localStorage formulas to server. Non-logged-in users still use localStorage only.
**Acceptance Criteria**:
- Logged-in users' formulas stored in database
- Formulas persist across devices when logged in
- Non-logged-in users still use localStorage (no regression)
- Formula migration prompt on first login
- GET/POST/DELETE formula endpoints work with auth
- Can't delete another user's formula

## Task 6: Add persistent user database separate from stats
**Status**: PASS
**Result**: users.db at data/users.db is completely separate from data/terminal.db. Auth + formula endpoints all use users.db via auth.py get_users_conn(). Server initializes users.db schema on startup via initialize_users_db() in lifespan. Build command only runs nflverse/college adapters (terminal.db), never touches users.db. Tables: users, user_formulas. Note: Render persistent disk needed for full cross-deploy persistence (documented for Phase 43).
**Acceptance Criteria**:
- users.db exists separate from terminal.db
- Auth endpoints use users.db
- Formula endpoints use users.db
- Deploying/rebuilding terminal.db does not affect users.db
- Server creates users.db with schema on first startup
- All user data survives a simulated rebuild of terminal.db

## Task 7: Deploy + smoke test auth system
**Status**: PENDING
**Acceptance Criteria**:
- All syntax clean
- Auth flow works end-to-end
- Protected endpoints enforce auth
- Lab stays free
- users.db separate from terminal.db
- Committed and pushed to master

---

## Loop State
```
Current Phase: 42
Current Task: 7
Current Stage: BUILD
Attempt: 1
Tasks Completed: 6/7
```
