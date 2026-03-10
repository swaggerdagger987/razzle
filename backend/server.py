"""
Razzle API server — thin FastAPI layer over SQLite.
All data queries live in live_data.py.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response
from starlette.exceptions import HTTPException as StarletteHTTPException
from pathlib import Path
import html as _html
import logging
import re
import time as _time
import uvicorn

from collections import defaultdict
from . import live_data
from . import auth as auth_module
from . import billing as billing_module

logger = logging.getLogger("razzle")

# Simple in-memory rate limiter for auth endpoints
_rate_buckets = defaultdict(list)  # ip -> [timestamps]
_RATE_LIMIT = 10  # max attempts
_RATE_WINDOW = 60  # per 60 seconds
_RATE_MAX_IPS = 10000  # max tracked IPs to prevent memory leak

def _check_rate_limit(ip: str) -> bool:
    """Return True if request is allowed, False if rate limited."""
    now = _time.time()
    # Prune stale IPs if dict grows too large
    if len(_rate_buckets) > _RATE_MAX_IPS:
        stale = [k for k, v in _rate_buckets.items() if not v or now - v[-1] > _RATE_WINDOW]
        for k in stale:
            del _rate_buckets[k]
    bucket = _rate_buckets[ip]
    # Remove old entries
    _rate_buckets[ip] = [t for t in bucket if now - t < _RATE_WINDOW]
    if len(_rate_buckets[ip]) >= _RATE_LIMIT:
        return False
    _rate_buckets[ip].append(now)
    return True


def bootstrap_database():
    """Sync nflverse + college data if the DB is empty or missing."""
    import sys, os
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from adapters.nflverse_adapter import (
        get_connection, initialize_database, process_season, current_nfl_season,
        sync_rosters, migrate_add_columns, sync_snap_counts,
    )
    from adapters.college_adapter import (
        get_connection as college_conn,
        initialize_tables as college_init_tables,
        process_combine, process_draft_picks,
    )

    conn = get_connection()
    initialize_database(conn)
    migrate_add_columns(conn)

    # Check if we already have data
    try:
        count = conn.execute("SELECT COUNT(*) FROM players").fetchone()[0]
    except Exception:
        count = 0

    if count < 50:
        logger.info("Database empty — bootstrapping nflverse data...")
        seasons = list(range(2020, current_nfl_season() + 1))
        for s in seasons:
            try:
                process_season(conn, s)
                logger.info(f"  Season {s} synced")
            except Exception as e:
                logger.warning(f"  Season {s} failed: {e}")

        # Snap counts
        logger.info("Syncing snap counts...")
        try:
            sync_snap_counts(conn, sorted(seasons))
            logger.info("  Snap count sync complete")
        except Exception as e:
            logger.warning(f"  Snap count sync failed: {e}")

        # Enrich players with age/demographics from roster CSVs
        logger.info("Enriching players with roster demographics...")
        try:
            # Sync all years to catch retired/cut players, newest last (overwrites with latest)
            sync_rosters(conn, sorted(seasons))
            logger.info("  Roster enrichment complete")
        except Exception as e:
            logger.warning(f"  Roster enrichment failed: {e}")
        conn.close()

        # College/prospect data
        logger.info("Bootstrapping college/prospect data...")
        cconn = college_conn()
        college_init_tables(cconn)
        try:
            process_combine(cconn)
            process_draft_picks(cconn)
            logger.info("  College data synced")
        except Exception as e:
            logger.warning(f"  College data failed: {e}")
        cconn.close()

        # cfbfastR college production stats
        logger.info("Bootstrapping cfbfastR college production stats...")
        try:
            from adapters.cfbfastr_adapter import (
                get_connection as cfb_conn,
                initialize_tables as cfb_init_tables,
                fetch_season_csv, aggregate_season, upsert_stats,
                refine_positions_from_combine,
            )
            fconn = cfb_conn()
            cfb_init_tables(fconn)
            for s in range(2020, 2026):
                try:
                    csv_text = fetch_season_csv(s)
                    if csv_text:
                        results = aggregate_season(csv_text, s)
                        upsert_stats(fconn, results)
                        logger.info(f"  cfbfastR {s}: {len(results)} players")
                except Exception as e:
                    logger.warning(f"  cfbfastR {s} failed: {e}")
            try:
                refine_positions_from_combine(fconn)
            except Exception:
                pass
            fconn.close()
            logger.info("  cfbfastR data synced")
        except Exception as e:
            logger.warning(f"  cfbfastR bootstrap failed: {e}")
    else:
        logger.info(f"Database has {count} players — skipping bootstrap")
        conn.close()


@asynccontextmanager
async def lifespan(app):
    bootstrap_database()
    auth_module.initialize_users_db()
    billing_module.initialize_subscriptions_table()
    live_data.init_waitlist_table()
    live_data.init_formula_store_tables()
    live_data._init_analytics_table()
    yield


app = FastAPI(title="Razzle API", version="0.1.0", lifespan=lifespan)

app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://razzle.lol", "http://localhost:8000", "http://localhost:5173", "http://127.0.0.1:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"


# ---------------------------------------------------------------------------
# Custom 404 page for non-API routes
# ---------------------------------------------------------------------------

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404 and not request.url.path.startswith("/api/"):
        four_oh_four = FRONTEND_DIR / "404.html"
        if four_oh_four.exists():
            return HTMLResponse(content=four_oh_four.read_text(), status_code=404)
    return HTMLResponse(content=str(exc.detail), status_code=exc.status_code)


# ---------------------------------------------------------------------------
# API endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    stats = live_data.db_stats()
    return {"status": "ok", "db": stats}


@app.get("/api/featured")
def featured():
    data = live_data.fetch_featured()
    return JSONResponse(content=data, headers={"Cache-Control": "public, max-age=300"})


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------

def _extract_token(request: Request) -> str:
    """Extract Bearer token from Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    return ""


def require_auth(request: Request) -> dict:
    """Verify auth and return user dict. Raises JSONResponse on failure."""
    token = _extract_token(request)
    if not token:
        return None
    result = auth_module.get_current_user(token)
    if "error" in result:
        return None
    return result["user"]


def require_plan(request: Request, plan: str = "pro"):
    """Verify auth + plan. Returns (user, error_response). If error_response is not None, return it."""
    user = require_auth(request)
    if not user:
        return None, JSONResponse({"error": "Authentication required"}, status_code=401)
    if user.get("plan", "free") != plan and plan != "free":
        return user, JSONResponse({"error": f"Requires {plan} plan"}, status_code=403)
    return user, None


@app.post("/api/auth/register")
async def auth_register(request: Request):
    ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(ip):
        return JSONResponse({"error": "Too many attempts. Try again in a minute."}, status_code=429)
    body = await request.json()
    email = body.get("email", "")
    password = body.get("password", "")
    result = auth_module.register(email, password)
    if "error" in result:
        return JSONResponse({"error": result["error"]}, status_code=result.get("status", 400))
    return result


@app.post("/api/auth/login")
async def auth_login(request: Request):
    ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(ip):
        return JSONResponse({"error": "Too many attempts. Try again in a minute."}, status_code=429)
    body = await request.json()
    email = body.get("email", "")
    password = body.get("password", "")
    result = auth_module.login(email, password)
    if "error" in result:
        return JSONResponse({"error": result["error"]}, status_code=result.get("status", 400))
    return result


@app.get("/api/auth/me")
async def auth_me(request: Request):
    token = _extract_token(request)
    if not token:
        return JSONResponse({"error": "No token provided"}, status_code=401)
    result = auth_module.get_current_user(token)
    if "error" in result:
        return JSONResponse({"error": result["error"]}, status_code=result["status"])
    return result


@app.post("/api/auth/link-sleeper")
async def auth_link_sleeper(request: Request):
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    body = await request.json()
    sleeper_username = body.get("sleeper_username", "").strip()
    if not sleeper_username:
        return JSONResponse({"error": "Sleeper username required"}, status_code=400)

    # Validate against Sleeper API
    import urllib.request
    try:
        url = f"https://api.sleeper.app/v1/user/{sleeper_username}"
        req = urllib.request.Request(url)
        req.add_header("User-Agent", "razzle/1.0")
        with urllib.request.urlopen(req, timeout=10) as resp:
            import json
            data = json.loads(resp.read())
            if not data or not data.get("user_id"):
                return JSONResponse({"error": "Sleeper username not found"}, status_code=400)
    except Exception:
        return JSONResponse({"error": "Could not validate Sleeper username"}, status_code=400)

    result = auth_module.link_sleeper(user["id"], sleeper_username)
    if "error" in result:
        return JSONResponse({"error": result["error"]}, status_code=result["status"])
    return result


# ---------------------------------------------------------------------------
# Billing endpoints (Stripe)
# ---------------------------------------------------------------------------

@app.post("/api/billing/create-checkout")
async def create_checkout(request: Request):
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    body = await request.json()
    interval = body.get("interval", "year")  # "year" or "month"
    result = billing_module.create_checkout_session(user, interval)
    if "error" in result:
        return JSONResponse({"error": result["error"]}, status_code=result.get("status", 400))
    return result


@app.post("/api/billing/webhook")
async def billing_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    result = billing_module.handle_webhook(payload, sig_header)
    if "error" in result:
        return JSONResponse({"error": result["error"]}, status_code=result.get("status", 400))
    return result


@app.get("/api/billing/status")
async def billing_status(request: Request):
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    return billing_module.get_billing_status(user)


# ---------------------------------------------------------------------------
# User formula endpoints (stored in users.db)
# ---------------------------------------------------------------------------

@app.get("/api/user/formulas")
async def get_user_formulas(request: Request):
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    return auth_module.get_user_formulas(user["id"])


@app.post("/api/user/formulas")
async def save_user_formula(request: Request):
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    body = await request.json()
    result = auth_module.save_user_formula(
        user["id"], body.get("name", ""), body.get("weights", "")
    )
    if "error" in result:
        return JSONResponse({"error": result["error"]}, status_code=result["status"])
    return result


@app.delete("/api/user/formulas/{formula_id}")
async def delete_user_formula(formula_id: int, request: Request):
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    result = auth_module.delete_user_formula(user["id"], formula_id)
    if "error" in result:
        return JSONResponse({"error": result["error"]}, status_code=result["status"])
    return result


@app.post("/api/user/formulas/import")
async def import_user_formulas(request: Request):
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    body = await request.json()
    return auth_module.import_formulas(user["id"], body.get("formulas", []))


# ---------------------------------------------------------------------------
# Player endpoints
# ---------------------------------------------------------------------------

@app.get("/api/players")
def get_players(
    search: str = "",
    position: str = "",
    positions: str = "",
    team: str = "",
    sort: str = "fantasy_points_ppr",
    order: str = "desc",
    limit: int = 200,
    offset: int = 0,
    season: str = "0",
):
    return live_data.fetch_players(
        search=search,
        position=position,
        positions=positions,
        team=team,
        sort_key=sort,
        sort_dir=order,
        limit=min(limit, 1000),
        offset=offset,
        season=season,
    )


@app.post("/api/screener/query")
async def screener_query(request: Request):
    body = await request.json()
    return live_data.fetch_screener(body)


@app.get("/api/filter-options")
def filter_options():
    data = live_data.get_filter_options()
    return JSONResponse(content=data, headers={"Cache-Control": "public, max-age=300"})


@app.get("/api/players/{player_id}/profile")
def player_profile(player_id: str):
    return live_data.fetch_player_profile(player_id)


@app.get("/api/players/{player_id}/weeks")
def player_weeks(player_id: str, season: str = "0"):
    s = int(season) if season.isdigit() else 0
    return live_data.fetch_player_weeks(player_id, season=s)


@app.get("/api/players/{player_id}/seasons")
def player_seasons(player_id: str):
    return live_data.fetch_player_seasons(player_id)


@app.get("/api/players/{player_id}/comps")
def player_comps(player_id: str, limit: int = 5, season: int = 0):
    return live_data.fetch_player_comps(player_id, limit=min(limit, 10), season=season)


@app.get("/api/players/{player_id}/boom-bust")
def player_boom_bust(player_id: str, season: int = 0):
    return live_data.fetch_player_boom_bust(player_id, season=season)


@app.get("/api/players/compare")
def players_compare(ids: str = "", season: str = "0"):
    player_ids = [p.strip() for p in ids.split(",") if p.strip()]
    return live_data.fetch_players_compare(player_ids, season=season)


@app.get("/api/prospects")
def get_prospects(
    search: str = "",
    position: str = "",
    positions: str = "",
    school: str = "",
    sort: str = "draft_pick",
    order: str = "asc",
    limit: int = 200,
    offset: int = 0,
    draft_year: int = 0,
):
    return live_data.fetch_prospects(
        search=search,
        position=position,
        positions=positions,
        school=school,
        sort_key=sort,
        sort_dir=order,
        limit=min(limit, 1000),
        offset=offset,
        draft_year=draft_year,
    )


@app.get("/api/prospect-profile")
def prospect_profile(name: str = "", position: str = "", draft_year: int = 0):
    return live_data.fetch_prospect_profile(name=name, position=position, draft_year=draft_year)


@app.get("/api/prospects/compare")
def prospects_compare(names: str = "", draft_year: int = 0):
    name_list = [n.strip() for n in names.split(",") if n.strip()]
    return live_data.fetch_prospects_compare(names=name_list, draft_year=draft_year)


@app.get("/api/prospect-tiers")
def prospect_tiers(position: str = "", draft_year: int = 0):
    return live_data.fetch_prospect_tiers(position=position, draft_year=draft_year)


@app.get("/api/prospect-comps")
def prospect_comps(name: str = "", position: str = "", draft_year: int = 0, limit: int = 5):
    return live_data.fetch_prospect_comps(name=name, position=position, draft_year=draft_year, limit=min(limit, 10))


@app.get("/api/prospect-scores")
def prospect_scores(position: str = "", draft_year: int = 0):
    return live_data.fetch_prospect_scores(position=position, draft_year=draft_year)


@app.get("/api/draft-class-analytics")
def draft_class_analytics(position: str = ""):
    return live_data.fetch_draft_class_analytics(position=position)


@app.get("/api/prospect-options")
def prospect_options():
    return live_data.fetch_prospect_years()


# ---------------------------------------------------------------------------
# College production stats endpoints (cfbfastR data)
# ---------------------------------------------------------------------------

@app.get("/api/college/players")
def get_college_players(
    search: str = "",
    position: str = "",
    positions: str = "",
    team: str = "",
    conference: str = "",
    sort: str = "total_yards",
    order: str = "desc",
    limit: int = 200,
    offset: int = 0,
    season: int = 0,
):
    return live_data.fetch_college_players(
        search=search,
        position=position,
        positions=positions,
        team=team,
        conference=conference,
        sort_key=sort,
        sort_dir=order,
        limit=min(limit, 1000),
        offset=offset,
        season=season,
    )


@app.get("/api/college/player-profile/{player_id}")
def college_player_profile(player_id: str):
    return live_data.fetch_college_player_profile(player_id)


@app.get("/api/college/filter-options")
def college_filter_options():
    return live_data.fetch_college_filter_options()


@app.get("/api/aging-curves")
def aging_curves(position: str = "WR"):
    return live_data.fetch_aging_curves(position=position)


@app.get("/api/heatmap")
def heatmap(position: str = "WR", group: str = "production", season: int = None):
    return live_data.fetch_heatmap(position=position, group=group, season=season)


_waitlist_rate: dict[str, float] = {}
_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')

@app.post("/api/waitlist")
async def waitlist(request: Request):
    body = await request.json()
    email = body.get("email", "").strip()
    if not email or not _EMAIL_RE.match(email):
        return JSONResponse({"error": "Invalid email format"}, status_code=400)
    ip = request.client.host if request.client else "unknown"
    now_ts = _time.time()
    if ip in _waitlist_rate and now_ts - _waitlist_rate[ip] < 60:
        return JSONResponse({"error": "Rate limited. Try again in 60 seconds."}, status_code=429)
    _waitlist_rate[ip] = now_ts
    return live_data.add_to_waitlist(email)


# ---------------------------------------------------------------------------
# Formula Store
# ---------------------------------------------------------------------------

@app.get("/api/formulas/store")
def get_formula_store(
    position: str = "",
    sort: str = "newest",
    search: str = "",
    limit: int = 50,
    offset: int = 0,
):
    return live_data.fetch_formula_store(
        position=position, sort=sort, search=search,
        limit=min(limit, 200), offset=offset,
    )


@app.post("/api/formulas/publish")
async def publish_formula(request: Request):
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Sign in to publish formulas"}, status_code=401)
    body = await request.json()
    return live_data.publish_formula(
        name=body.get("name", ""),
        description=body.get("description", ""),
        position_tags=body.get("position_tags", []),
        stat_weights=body.get("stat_weights", {}),
        creator_name=user.get("sleeper_username") or user["email"].split("@")[0],
    )


@app.get("/api/formulas/{formula_id}")
def get_formula_detail(formula_id: int):
    return live_data.get_formula_detail(formula_id)


@app.post("/api/formulas/{formula_id}/rate")
async def rate_formula(formula_id: int, request: Request):
    body = await request.json()
    return live_data.rate_formula(
        formula_id=formula_id,
        rating=body.get("rating", 0),
        review=body.get("review", ""),
    )


# ---------------------------------------------------------------------------
# Dynamic OG tags for Lab shared URLs
# ---------------------------------------------------------------------------

@app.get("/lab.html")
async def lab_with_og_tags(request: Request):
    """Serve lab.html with dynamic OG meta tags based on URL params."""
    lab_file = FRONTEND_DIR / "lab.html"
    if not lab_file.exists():
        return HTMLResponse("Not found", status_code=404)

    html = lab_file.read_text(encoding="utf-8")

    # Extract URL params for OG tag generation
    params = request.query_params
    position = params.get("position", "").upper()
    sort_key = params.get("sort", "fantasy_points_ppr")
    season = params.get("season", "2024")
    universe = params.get("universe", "nfl").upper()

    # Build dynamic title
    pos_label = position if position and position != "ALL" else "All Positions"
    sort_labels = {
        "fantasy_points_ppr": "PPR Points",
        "fantasy_points_std": "Standard Points",
        "fantasy_points_half_ppr": "Half-PPR Points",
        "dynasty_value": "Dynasty Value",
        "passing_yards": "Passing Yards",
        "rushing_yards": "Rushing Yards",
        "receiving_yards": "Receiving Yards",
        "receptions": "Receptions",
        "touchdowns": "Touchdowns",
        "target_share": "Target Share",
    }
    sort_label = sort_labels.get(sort_key, sort_key.replace("_", " ").title())
    season_label = "Career" if season.lower() == "career" else season

    if universe == "PROSPECTS":
        og_title = f"Razzle Lab — {pos_label} Prospect Rankings"
    elif universe == "COLLEGE":
        og_title = f"Razzle Lab — College {pos_label} by {sort_label}"
    else:
        og_title = f"Razzle Lab — {pos_label} by {sort_label} ({season_label})"

    og_desc = f"Fantasy football screener: {pos_label}, sorted by {sort_label}"
    if season_label != "Career":
        og_desc += f", {season_label} season"
    min_gp = params.get("min_gp", "")
    if min_gp:
        og_desc += f", min {min_gp} GP"
    teams = params.get("teams", "")
    if teams:
        og_desc += f", teams: {teams}"
    og_desc += ". Powered by razzle.lol"

    # Escape for safe HTML attribute insertion
    og_title = _html.escape(og_title, quote=True)
    og_desc = _html.escape(og_desc, quote=True)

    # Replace static OG tags with dynamic ones
    html = re.sub(
        r'<meta property="og:title" content="[^"]*">',
        f'<meta property="og:title" content="{og_title}">',
        html,
    )
    html = re.sub(
        r'<meta property="og:description" content="[^"]*">',
        f'<meta property="og:description" content="{og_desc}">',
        html,
    )
    html = re.sub(
        r'<meta name="twitter:title" content="[^"]*">',
        f'<meta name="twitter:title" content="{og_title}">',
        html,
    )
    html = re.sub(
        r'<meta name="twitter:description" content="[^"]*">',
        f'<meta name="twitter:description" content="{og_desc}">',
        html,
    )

    return HTMLResponse(content=html)


# ---------------------------------------------------------------------------
# Dynamic OG tags for player profile pages
# ---------------------------------------------------------------------------

@app.get("/player/{player_id:path}")
async def player_profile_page(player_id: str):
    """Serve player.html with dynamic OG meta tags for the specific player."""
    import re
    player_file = FRONTEND_DIR / "player.html"
    if not player_file.exists():
        return HTMLResponse("Not found", status_code=404)

    html = player_file.read_text(encoding="utf-8")

    # Try to get player info for OG tags
    try:
        data = live_data.fetch_player_profile(player_id)
        p = data.get("player", {})
        name = p.get("full_name", "Unknown Player")
        pos = p.get("position", "")
        team = p.get("team", "")
        career = data.get("career", {})
        ppr = career.get("fantasy_points_ppr")
        games = career.get("games")
        pprg = f"{ppr / games:.1f}" if ppr and games else ""

        og_title = f"{name} ({pos}, {team}) — Razzle"
        og_desc = f"Player profile for {name}"
        if pos and team:
            og_desc = f"{name} ({pos}, {team})"
            if pprg:
                og_desc += f" — {pprg} PPR/G career"
            og_desc += ". Full stats, radar chart, career arc on razzle.lol"
    except Exception:
        og_title = "Player Profile — Razzle"
        og_desc = "Fantasy football player profile on razzle.lol"

    og_title = _html.escape(og_title, quote=True)
    og_desc = _html.escape(og_desc, quote=True)

    html = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{og_title}">', html)
    html = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{og_desc}">', html)
    html = re.sub(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{og_title}">', html)
    html = re.sub(r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{og_desc}">', html)
    html = re.sub(r'<title>[^<]*</title>', f'<title>{og_title}</title>', html)

    # Inject JSON-LD structured data
    try:
        import json as _json
        jsonld = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": name,
            "url": f"https://razzle.lol/player/{player_id}",
        }
        if pos:
            jsonld["jobTitle"] = f"{pos} — Fantasy Football"
        if team:
            jsonld["affiliation"] = {"@type": "SportsTeam", "name": team}
        jsonld_tag = f'<script type="application/ld+json">{_json.dumps(jsonld)}</script>'
        html = html.replace("</head>", f"{jsonld_tag}\n</head>")
    except Exception:
        pass

    return HTMLResponse(content=html)


# ---------------------------------------------------------------------------
# Dynamic OG tags for player comparison pages
# ---------------------------------------------------------------------------

@app.get("/compare/{id1}/{id2}")
async def compare_page(id1: str, id2: str):
    """Serve compare.html with dynamic OG meta tags for two players."""
    compare_file = FRONTEND_DIR / "compare.html"
    if not compare_file.exists():
        return HTMLResponse("Not found", status_code=404)

    html = compare_file.read_text(encoding="utf-8")

    try:
        d1 = live_data.fetch_player_profile(id1)
        d2 = live_data.fetch_player_profile(id2)
        p1 = d1.get("player", {})
        p2 = d2.get("player", {})
        n1 = p1.get("full_name", "Player 1")
        n2 = p2.get("full_name", "Player 2")
        pos1 = p1.get("position", "")
        pos2 = p2.get("position", "")
        team1 = p1.get("team", "")
        team2 = p2.get("team", "")

        og_title = f"{n1} vs {n2} — Razzle"
        parts = []
        if pos1 and team1:
            parts.append(f"{n1} ({pos1}, {team1})")
        else:
            parts.append(n1)
        if pos2 and team2:
            parts.append(f"{n2} ({pos2}, {team2})")
        else:
            parts.append(n2)
        og_desc = " vs ".join(parts) + ". Head-to-head stats, radar overlay, career arc on razzle.lol"
    except Exception:
        og_title = "Player Comparison — Razzle"
        og_desc = "Head-to-head fantasy football player comparison on razzle.lol"

    og_title = _html.escape(og_title, quote=True)
    og_desc = _html.escape(og_desc, quote=True)

    html = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{og_title}">', html)
    html = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{og_desc}">', html)
    html = re.sub(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{og_title}">', html)
    html = re.sub(r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{og_desc}">', html)
    html = re.sub(r'<title>[^<]*</title>', f'<title>{og_title}</title>', html)

    return HTMLResponse(content=html)


# ---------------------------------------------------------------------------
# Sitemap + robots.txt
# ---------------------------------------------------------------------------

@app.get("/sitemap.xml")
def sitemap_xml():
    """Dynamic sitemap with all pages + top player profiles."""
    import xml.etree.ElementTree as ET

    base = "https://razzle.lol"
    pages = [
        ("", "1.0", "weekly"),
        ("/lab.html", "1.0", "daily"),
        ("/league-intel.html", "0.7", "monthly"),
        ("/agents.html", "0.7", "monthly"),
    ]

    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    for path, priority, freq in pages:
        url = ET.SubElement(urlset, "url")
        ET.SubElement(url, "loc").text = f"{base}{path}"
        ET.SubElement(url, "priority").text = priority
        ET.SubElement(url, "changefreq").text = freq

    # Top 200 NFL players by PPR
    try:
        data = live_data.fetch_players(sort_key="fantasy_points_ppr", limit=200)
        for p in data.get("players", []):
            pid = p.get("player_id", "")
            if pid:
                url = ET.SubElement(urlset, "url")
                ET.SubElement(url, "loc").text = f"{base}/player/{pid}"
                ET.SubElement(url, "priority").text = "0.6"
                ET.SubElement(url, "changefreq").text = "weekly"
    except Exception:
        pass

    xml_str = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_str += ET.tostring(urlset, encoding="unicode")
    return Response(content=xml_str, media_type="application/xml")


@app.get("/robots.txt")
def robots_txt():
    content = """User-agent: *
Allow: /

Sitemap: https://razzle.lol/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")


# ---------------------------------------------------------------------------
# Trade Value Model
# ---------------------------------------------------------------------------

@app.get("/api/trade/values")
def trade_values(player_ids: str = ""):
    ids = [pid.strip() for pid in player_ids.split(",") if pid.strip()]
    if not ids:
        return {"players": []}
    return {"players": live_data.fetch_trade_values(ids)}


@app.get("/api/trade/pick-values")
def trade_pick_values(year: int = 2025, rounds: int = 4, teams: int = 12):
    """Return dynasty draft pick trade values."""
    year = max(2024, min(2030, year))
    rounds = max(1, min(5, rounds))
    teams = max(4, min(16, teams))
    return {"picks": live_data.fetch_pick_values(year, rounds, teams)}


@app.post("/api/roster-value")
async def roster_value(request: Request):
    """Calculate dynasty roster value analysis."""
    body = await request.json()
    player_ids = body.get("player_ids", [])
    if not isinstance(player_ids, list):
        return {"error": "player_ids must be a list"}
    # Limit to 60 players max (full dynasty roster)
    player_ids = player_ids[:60]
    return live_data.fetch_roster_value(player_ids)


# ---------------------------------------------------------------------------
# Analytics (lightweight page views)
# ---------------------------------------------------------------------------

@app.post("/api/analytics/pageview")
async def log_pageview(request: Request):
    body = await request.json()
    page = body.get("page", "/")
    live_data.log_pageview(page)
    return {"status": "ok"}


@app.get("/api/analytics/summary")
def analytics_summary():
    return live_data.get_analytics_summary()


# ---------------------------------------------------------------------------
# Serve frontend as static files (catch-all for SPA-like behavior)
# ---------------------------------------------------------------------------

PERSONAS_DIR = Path(__file__).parent.parent / "agent-personas"
if PERSONAS_DIR.exists():
    app.mount("/agent-personas", StaticFiles(directory=str(PERSONAS_DIR)), name="personas")

if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main():
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
