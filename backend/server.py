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


@app.get("/api/players/quick-search")
def quick_search(q: str = "", limit: int = 8):
    return live_data.quick_search_players(q, limit=limit)


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
    return live_data.fetch_player_comps(player_id, limit=max(1, min(limit, 10)), season=season)


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
    pos = position.strip().upper() if position else ""
    if pos and pos not in ("QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "EDGE"):
        pos = ""
    return live_data.fetch_prospect_scores(position=pos, draft_year=draft_year)


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
# Dynamic OG tags for team roster pages
# ---------------------------------------------------------------------------

@app.get("/team/{abbr}")
async def team_page(abbr: str):
    """Serve team.html with dynamic OG meta tags for the team."""
    team_file = FRONTEND_DIR / "team.html"
    if not team_file.exists():
        return HTMLResponse("Not found", status_code=404)

    html = team_file.read_text(encoding="utf-8")

    abbr_upper = abbr.strip().upper()
    team_name = live_data.ABBREV_TO_TEAM.get(abbr_upper, abbr_upper)
    og_title = _html.escape(f"{team_name} Roster — Razzle", quote=True)
    og_desc = _html.escape(
        f"{team_name} fantasy football roster breakdown. Depth chart, stats, PPG on razzle.lol",
        quote=True,
    )

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
        ("/rankings.html", "0.9", "weekly"),
        ("/leaders.html", "0.9", "weekly"),
        ("/prospects.html", "0.9", "weekly"),
        ("/scarcity.html", "0.8", "weekly"),
        ("/breakouts.html", "0.8", "weekly"),
        ("/buysell.html", "0.8", "weekly"),
        ("/aging.html", "0.8", "weekly"),
        ("/weekly.html", "0.8", "weekly"),
        ("/targets.html", "0.8", "weekly"),
        ("/matchups.html", "0.8", "weekly"),
        ("/usage.html", "0.8", "weekly"),
        ("/yoy.html", "0.8", "weekly"),
        ("/airyards.html", "0.8", "weekly"),
        ("/explorer.html", "0.8", "weekly"),
        ("/redzone.html", "0.8", "weekly"),
        ("/efficiency.html", "0.8", "weekly"),
        ("/consistency.html", "0.8", "weekly"),
        ("/schedule.html", "0.8", "weekly"),
        ("/stocks.html", "0.8", "weekly"),
        ("/opportunity.html", "0.8", "weekly"),
        ("/reportcard.html", "0.8", "weekly"),
        ("/awards.html", "0.8", "weekly"),
        ("/vorp.html", "0.8", "weekly"),
        ("/tradevalues.html", "0.8", "weekly"),
        ("/tradefinder.html", "0.8", "weekly"),
        ("/tools.html", "0.8", "weekly"),
        ("/rosterbuilder.html", "0.8", "weekly"),
        ("/scoring.html", "0.8", "weekly"),
        ("/cheatsheet.html", "0.8", "weekly"),
        ("/auction.html", "0.8", "weekly"),
        ("/dashboard.html", "0.9", "weekly"),
        ("/tiers.html", "0.8", "weekly"),
        ("/archetypes.html", "0.8", "weekly"),
        ("/league-intel.html", "0.7", "monthly"),
        ("/agents.html", "0.7", "monthly"),
    ]

    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    for path, priority, freq in pages:
        url = ET.SubElement(urlset, "url")
        ET.SubElement(url, "loc").text = f"{base}{path}"
        ET.SubElement(url, "priority").text = priority
        ET.SubElement(url, "changefreq").text = freq

    # All 32 NFL team pages
    for abbr in sorted(live_data.ABBREV_TO_TEAM.keys()):
        url = ET.SubElement(urlset, "url")
        ET.SubElement(url, "loc").text = f"{base}/team/{abbr}"
        ET.SubElement(url, "priority").text = "0.7"
        ET.SubElement(url, "changefreq").text = "weekly"

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
# Dynasty Rankings Board
# ---------------------------------------------------------------------------

@app.get("/api/dynasty-rankings")
def dynasty_rankings(position: str = "", limit: int = 200):
    """Return tiered dynasty rankings for all fantasy-relevant players."""
    pos = position.strip().upper() if position else None
    limit = max(1, min(300, limit))
    return live_data.fetch_dynasty_rankings(position=pos, limit=limit)


@app.get("/api/stat-leaders")
def stat_leaders(season: int = 0, position: str = "", limit: int = 10):
    """Return top players in each key fantasy stat category."""
    s = season if season > 0 else None
    pos = position.strip().upper() if position else None
    limit = max(1, min(25, limit))
    return live_data.fetch_stat_leaders(season=s, position=pos, limit=limit)


# ---------------------------------------------------------------------------
# Team Roster Pages
# ---------------------------------------------------------------------------

@app.get("/api/team-roster")
def team_roster(team: str = "", season: int = 0):
    """Return all fantasy-relevant players for a team grouped by position."""
    t = team.strip().upper() if team else None
    s = season if season > 0 else None
    return live_data.fetch_team_roster(team=t, season=s)


# ---------------------------------------------------------------------------
# Analytics (lightweight page views)
# ---------------------------------------------------------------------------

@app.post("/api/analytics/pageview")
async def log_pageview(request: Request):
    body = await request.json()
    page = body.get("page", "/")
    live_data.log_pageview(page)
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Positional Scarcity Dashboard
# ---------------------------------------------------------------------------

@app.get("/api/positional-scarcity")
def positional_scarcity(season: int = 0):
    """Return PPG drop-off data by position for scarcity analysis."""
    s = season if season > 0 else None
    return live_data.fetch_positional_scarcity(season=s)


@app.get("/api/breakout-candidates")
def breakout_candidates(season: int = 0, position: str = "", limit: int = 50):
    """Return players ranked by breakout potential (opportunity-production gap)."""
    s = season if season > 0 else None
    pos = position.upper() if position else None
    return live_data.fetch_breakout_candidates(season=s, position=pos, limit=max(1, min(limit, 100)))


@app.get("/api/buy-sell-candidates")
def buy_sell_candidates(season: int = 0, position: str = "", limit: int = 15):
    """Return players split into buy-low and sell-high based on efficiency vs dynasty rank."""
    s = season if season > 0 else None
    pos = position.upper() if position else None
    return live_data.fetch_buy_sell_candidates(season=s, position=pos, limit=max(1, min(limit, 30)))


@app.get("/api/aging-curves")
def aging_curves(season: int = 0, position: str = ""):
    """Return aging curve data — average PPG by age per position with player dots."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_aging_curves(season=s, position=pos)
    except Exception as e:
        logger.error(f"aging_curves error: {e}")
        return JSONResponse({"error": "Failed to fetch aging curves"}, status_code=500)


@app.get("/api/weekly-heatmap")
def weekly_heatmap(season: int = 0, position: str = "", limit: int = 40):
    """Return weekly scoring heatmap — players × weeks with PPR scores."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_weekly_heatmap(season=s, position=pos, limit=max(1, min(limit, 50)))
    except Exception as e:
        logger.error(f"weekly_heatmap error: {e}")
        return JSONResponse({"error": "Failed to fetch weekly heatmap"}, status_code=500)


@app.get("/api/target-distribution")
def target_distribution(season: int = 0, team: str = ""):
    """Return target and carry distribution by team."""
    try:
        s = season if season > 0 else None
        t = team.upper() if team else None
        return live_data.fetch_target_distribution(season=s, team=t)
    except Exception as e:
        logger.error(f"target_distribution error: {e}")
        return JSONResponse({"error": "Failed to fetch target distribution"}, status_code=500)


@app.get("/api/matchup-heatmap")
def matchup_heatmap(season: int = 0, position: str = ""):
    """Return fantasy points allowed by defense per position — matchup heatmap."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_matchup_heatmap(season=s, position=pos)
    except Exception as e:
        logger.error(f"matchup_heatmap error: {e}")
        return JSONResponse({"error": "Failed to fetch matchup heatmap"}, status_code=500)


@app.get("/api/usage-trends")
def usage_trends(season: int = 0, position: str = "", window: int = 5, limit: int = 30):
    """Return snap count usage trends — risers and fallers."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        w = max(3, min(window, 18))
        lim = max(1, min(limit, 50))
        return live_data.fetch_usage_trends(season=s, position=pos, window=w, limit=lim)
    except Exception as e:
        logger.error(f"usage_trends error: {e}")
        return JSONResponse({"error": "Failed to fetch usage trends"}, status_code=500)


@app.get("/api/year-over-year")
def year_over_year(season: int = 0, position: str = "", metric: str = "ppg", limit: int = 25):
    """Return year-over-year stat comparison — risers and fallers."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        m = metric if metric in ("ppg", "tgt_g", "rec_yd_g", "rush_yd_g", "td_total", "snap_pct") else "ppg"
        lim = max(1, min(limit, 50))
        return live_data.fetch_year_over_year(season=s, position=pos, metric=m, limit=lim)
    except Exception as e:
        logger.error(f"year_over_year error: {e}")
        return JSONResponse({"error": "Failed to fetch year-over-year data"}, status_code=500)


@app.get("/api/stat-explorer")
def stat_explorer(season: int = 0, position: str = "", x_stat: str = "targets_g", y_stat: str = "ppg"):
    """Return scatter plot data for two user-chosen stats."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_stat_explorer(season=s, position=pos, x_stat=x_stat, y_stat=y_stat)
    except Exception as e:
        logger.error(f"stat_explorer error: {e}")
        return JSONResponse({"error": "Failed to fetch explorer data"}, status_code=500)


@app.get("/api/air-yards")
def air_yards(season: int = 0, position: str = "", limit: int = 25):
    """Return air yards leaderboard with regression indicators."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        lim = max(1, min(limit, 50))
        return live_data.fetch_air_yards(season=s, position=pos, limit=lim)
    except Exception as e:
        logger.error(f"air_yards error: {e}")
        return JSONResponse({"error": "Failed to fetch air yards data"}, status_code=500)


@app.get("/api/redzone-usage")
def redzone_usage(season: int = 0, position: str = "", limit: int = 30):
    """Return goal-line usage leaders and TD-dependent players."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        lim = max(1, min(limit, 50))
        return live_data.fetch_redzone_usage(season=s, position=pos, limit=lim)
    except Exception as e:
        logger.error(f"redzone_usage error: {e}")
        return JSONResponse({"error": "Failed to fetch red zone data"}, status_code=500)


@app.get("/api/efficiency-rankings")
def efficiency_rankings(season: int = 0, position: str = "", limit: int = 30):
    """Return fantasy efficiency rankings: most efficient + volume kings."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        lim = max(1, min(limit, 50))
        return live_data.fetch_efficiency_rankings(season=s, position=pos, limit=lim)
    except Exception as e:
        logger.error(f"efficiency_rankings error: {e}")
        return JSONResponse({"error": "Failed to fetch efficiency data"}, status_code=500)


@app.get("/api/consistency-rankings")
def consistency_rankings(season: int = 0, position: str = "", limit: int = 30):
    """Return consistency rankings: rock solid (low variance) + wild cards (high variance)."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        lim = max(1, min(limit, 50))
        return live_data.fetch_consistency_rankings(season=s, position=pos, limit=lim)
    except Exception as e:
        logger.error(f"consistency_rankings error: {e}")
        return JSONResponse({"error": "Failed to fetch consistency data"}, status_code=500)


@app.get("/api/strength-of-schedule")
def strength_of_schedule(season: int = 0, position: str = "", limit: int = 30):
    """Return strength of schedule analysis: suppressed (hard SOS) + inflated (easy SOS)."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        lim = max(1, min(limit, 50))
        return live_data.fetch_strength_of_schedule(season=s, position=pos, limit=lim)
    except Exception as e:
        logger.error(f"strength_of_schedule error: {e}")
        return JSONResponse({"error": "Failed to fetch strength of schedule data"}, status_code=500)


@app.get("/api/stock-watch")
def stock_watch(season: int = 0, position: str = "", limit: int = 30):
    """Return dynasty stock watch: rising (undervalued) + falling (overvalued)."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        lim = max(1, min(limit, 50))
        return live_data.fetch_stock_watch(season=s, position=pos, limit=lim)
    except Exception as e:
        logger.error(f"stock_watch error: {e}")
        return JSONResponse({"error": "Failed to fetch stock watch data"}, status_code=500)


@app.get("/api/opportunity-share")
def opportunity_share(season: int = 0, position: str = "", limit: int = 30):
    """Return opportunity share leaders and dominator rating leaders."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        lim = max(1, min(limit, 50))
        return live_data.fetch_opportunity_share(season=s, position=pos, limit=lim)
    except Exception as e:
        logger.error(f"opportunity_share error: {e}")
        return JSONResponse({"error": "Failed to fetch opportunity share data"}, status_code=500)


@app.get("/api/report-cards")
def report_cards(season: int = 0, position: str = "", limit: int = 25):
    """Return player report cards with composite Fantasy GPA."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        lim = max(1, min(limit, 50))
        return live_data.fetch_report_cards(season=s, position=pos, limit=lim)
    except Exception as e:
        logger.error(f"report_cards error: {e}")
        return JSONResponse({"error": "Failed to fetch report card data"}, status_code=500)


@app.get("/api/season-awards")
def season_awards(season: int = 0, position: str = ""):
    """Return fantasy season superlatives / awards."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_season_awards(season=s, position=pos)
    except Exception as e:
        logger.error(f"season_awards error: {e}")
        return JSONResponse({"error": "Failed to fetch season awards data"}, status_code=500)


@app.get("/api/vorp")
def vorp(season: int = 0, position: str = "", limit: int = 30):
    """Return Value Over Replacement Player rankings."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_vorp(season=s, position=pos, limit=limit)
    except Exception as e:
        logger.error(f"vorp error: {e}")
        return JSONResponse({"error": "Failed to fetch VORP data"}, status_code=500)


@app.get("/api/analytics/summary")
def analytics_summary():
    return live_data.get_analytics_summary()


@app.get("/api/trade-value-chart")
def trade_value_chart(season: int = 0, position: str = "", limit: int = 150):
    """Return all fantasy-relevant players ranked by dynasty trade value."""
    try:
        limit = max(1, min(300, limit))
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_trade_value_chart(season=s, position=pos, limit=limit)
    except Exception as e:
        logger.error(f"trade-value-chart error: {e}")
        return JSONResponse({"error": "Failed to fetch trade value chart"}, status_code=500)


@app.get("/api/trade-finder")
def trade_finder(player_id: str = "", season: int = 0):
    """Find value-matched trade targets for a given player."""
    if not player_id:
        return JSONResponse({"error": "player_id is required"}, status_code=400)
    try:
        s = season if season > 0 else None
        return live_data.fetch_trade_finder(player_id=player_id, season=s)
    except Exception as e:
        logger.error(f"trade-finder error: {e}")
        return JSONResponse({"error": "Failed to fetch trade finder data"}, status_code=500)


@app.get("/api/cheat-sheet")
def cheat_sheet(season: int = 0, format: str = "ppr"):
    """Return a draft cheat sheet grouped by position."""
    try:
        s = season if season > 0 else None
        fmt = format if format in ("ppr", "half", "std") else "ppr"
        return live_data.fetch_cheat_sheet(season=s, fmt=fmt)
    except Exception as e:
        logger.error(f"cheat-sheet error: {e}")
        return JSONResponse({"error": "Failed to fetch cheat sheet"}, status_code=500)


@app.get("/api/scoring-comparison")
def scoring_comparison(season: int = 0, position: str = ""):
    """Compare player rankings across PPR, Half-PPR, and Standard scoring."""
    try:
        s = season if season > 0 else None
        pos = position if position else None
        return live_data.fetch_scoring_comparison(season=s, position=pos)
    except Exception as e:
        logger.error(f"scoring-comparison error: {e}")
        return JSONResponse({"error": "Failed to fetch scoring comparison"}, status_code=500)


@app.post("/api/roster-grade")
async def roster_grade(request: Request):
    """Grade a hypothetical dynasty roster from a list of player IDs."""
    try:
        body = await request.json()
        raw_ids = body.get("player_ids", [])
        season = body.get("season", None)
        if not raw_ids or not isinstance(raw_ids, list):
            return JSONResponse({"error": "player_ids array is required"}, status_code=400)
        # Validate strings, deduplicate, cap at 25
        player_ids = list(dict.fromkeys(str(pid) for pid in raw_ids if isinstance(pid, str) and pid))[:25]
        if not player_ids:
            return JSONResponse({"error": "No valid player IDs provided"}, status_code=400)
        return live_data.fetch_roster_grade(player_ids=player_ids, season=season)
    except Exception as e:
        logger.error(f"roster-grade error: {e}")
        return JSONResponse({"error": "Failed to grade roster"}, status_code=500)


@app.get("/api/auction-values")
def auction_values(season: int = 0, budget: int = 200, roster_size: int = 15):
    """Convert trade values into auction dollar amounts."""
    try:
        s = season if season > 0 else None
        return live_data.fetch_auction_values(season=s, budget=budget, roster_size=roster_size)
    except Exception as e:
        logger.error(f"auction-values error: {e}")
        return JSONResponse({"error": "Failed to fetch auction values"}, status_code=500)


@app.get("/api/tier-list")
def tier_list(season: int = 0, position: str = ""):
    """Return players grouped into S/A/B/C/D/F tiers by trade value."""
    try:
        s = season if season > 0 else None
        pos = position if position else None
        return live_data.fetch_tier_list(season=s, position=pos)
    except Exception as e:
        logger.error(f"tier-list error: {e}")
        return JSONResponse({"error": "Failed to fetch tier list"}, status_code=500)


@app.get("/api/player-archetypes")
def player_archetypes(season: int = 0, position: str = ""):
    """Classify players into statistical archetypes."""
    try:
        s = season if season > 0 else None
        pos = position if position else None
        return live_data.fetch_player_archetypes(season=s, position=pos)
    except Exception as e:
        logger.error(f"player-archetypes error: {e}")
        return JSONResponse({"error": "Failed to fetch player archetypes"}, status_code=500)


@app.get("/api/dynasty-dashboard")
def dynasty_dashboard(season: int = 0):
    """Aggregated dynasty dashboard with risers, fallers, value picks, and scarcity."""
    try:
        s = season if season > 0 else None
        return live_data.fetch_dynasty_dashboard(season=s)
    except Exception as e:
        logger.error(f"dynasty-dashboard error: {e}")
        return JSONResponse({"error": "Failed to fetch dynasty dashboard"}, status_code=500)


@app.get("/api/tools-hub")
def tools_hub():
    """Return the static tools catalog organized by category."""
    categories = [
        {
            "id": "rankings",
            "name": "Rankings & Values",
            "icon": "\U0001f3c6",
            "tools": [
                {"name": "Dynasty Rankings", "desc": "Tiered player rankings across all positions", "url": "/rankings.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Trade Values", "desc": "Composite trade value chart with production, age, and scarcity", "url": "/tradevalues.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "VORP", "desc": "Value Over Replacement Player — cross-position ranking", "url": "/vorp.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Stat Leaders", "desc": "Top performers across 10 statistical categories", "url": "/leaders.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Season Awards", "desc": "Data-driven fantasy superlatives — MVP, Iron Man, and more", "url": "/awards.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Report Card", "desc": "Composite Fantasy GPA grading efficiency, consistency, and more", "url": "/reportcard.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Draft Cheat Sheet", "desc": "Printable position rankings with tier breaks — PPR, Half, Standard", "url": "/cheatsheet.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Auction Values", "desc": "Trade values converted to auction dollars for any budget", "url": "/auction.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Dynasty Dashboard", "desc": "At-a-glance overview: risers, fallers, value picks, scarcity alerts", "url": "/dashboard.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Tier List", "desc": "S/A/B/C/D/F tier rankings based on composite trade value", "url": "/tiers.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Player Archetypes", "desc": "Statistical archetypes — Workhorse, Deep Threat, Dual-Threat, and more", "url": "/archetypes.html", "positions": ["QB", "RB", "WR", "TE"]},
            ],
        },
        {
            "id": "discovery",
            "name": "Player Discovery",
            "icon": "\U0001f50d",
            "tools": [
                {"name": "Trade Finder", "desc": "Search a player, find equal-value, buy-low, and sell-high targets", "url": "/tradefinder.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Buy Low / Sell High", "desc": "Efficiency vs. dynasty rank mismatches", "url": "/buysell.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Stock Watch", "desc": "Rising and falling dynasty stocks by composite metrics", "url": "/stocks.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Breakout Candidates", "desc": "Opportunity vs. production gap — who's due for a leap", "url": "/breakouts.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Rookie Big Board", "desc": "Prospect tiers with RPS scoring and percentile bars", "url": "/prospects.html", "positions": ["QB", "RB", "WR", "TE"]},
            ],
        },
        {
            "id": "performance",
            "name": "Performance Analysis",
            "icon": "\U0001f4ca",
            "tools": [
                {"name": "Efficiency", "desc": "Fantasy points per opportunity and volume rankings", "url": "/efficiency.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Consistency", "desc": "Coefficient of variation, floor, ceiling, and scoring range", "url": "/consistency.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Air Yards", "desc": "aDOT, RACR, WOPR, and regression buy/sell indicators", "url": "/airyards.html", "positions": ["WR", "RB", "TE"]},
                {"name": "Red Zone & Goal-Line", "desc": "Goal-line carries, targets, TDs, and TD dependency", "url": "/redzone.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Player Comparison", "desc": "Side-by-side stat comparison with radar charts and boom/bust rates", "url": "/compare.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Scoring Formats", "desc": "How PPR vs Half-PPR vs Standard changes rankings", "url": "/scoring.html", "positions": ["QB", "RB", "WR", "TE"]},
            ],
        },
        {
            "id": "usage",
            "name": "Usage & Opportunity",
            "icon": "\u26a1",
            "tools": [
                {"name": "Opportunity Share", "desc": "Target and carry share as percentage of team volume", "url": "/opportunity.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Snap Trends", "desc": "Risers and fallers with sparklines over 3/5/8 week windows", "url": "/usage.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Target Distribution", "desc": "Team-level target and carry allocation by position", "url": "/targets.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Positional Scarcity", "desc": "PPG drop-off by position — where the cliffs are", "url": "/scarcity.html", "positions": ["QB", "RB", "WR", "TE"]},
            ],
        },
        {
            "id": "matchup",
            "name": "Matchup & Schedule",
            "icon": "\U0001f4c5",
            "tools": [
                {"name": "Matchup Heatmap", "desc": "32-team defensive PPG allowed by position — find soft matchups", "url": "/matchups.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Strength of Schedule", "desc": "SOS grades, buy targets vs. sell candidates", "url": "/schedule.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Weekly Heatmap", "desc": "Player-by-week scoring grid with color-coded tiers", "url": "/weekly.html", "positions": ["QB", "RB", "WR", "TE"]},
            ],
        },
        {
            "id": "visualizations",
            "name": "Visualizations",
            "icon": "\U0001f3a8",
            "tools": [
                {"name": "Stat Explorer", "desc": "Scatter plot — any stat vs. any stat with trendlines", "url": "/explorer.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Aging Curves", "desc": "PPG-by-age curves per position with player overlays", "url": "/aging.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Year-over-Year", "desc": "Cross-season stat deltas — risers and fallers", "url": "/yoy.html", "positions": ["QB", "RB", "WR", "TE"]},
            ],
        },
        {
            "id": "team",
            "name": "Team & League",
            "icon": "\U0001f3c8",
            "tools": [
                {"name": "Roster Builder", "desc": "Build a hypothetical roster and get it graded on value, VORP, age, depth", "url": "/rosterbuilder.html", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "Team Rosters", "desc": "Full roster breakdown by position group with age badges", "url": "/team/KC", "positions": ["QB", "RB", "WR", "TE"]},
                {"name": "League Intel", "desc": "Connect Sleeper — see leagues, rosters, and manager profiles", "url": "/league-intel.html", "positions": []},
                {"name": "The Lab", "desc": "Full Bloomberg screener — 100+ columns, filters, formulas", "url": "/lab.html", "positions": ["QB", "RB", "WR", "TE"]},
            ],
        },
    ]
    total_tools = sum(len(c["tools"]) for c in categories)
    return JSONResponse(
        content={"categories": categories, "total_tools": total_tools},
        headers={"Cache-Control": "public, max-age=3600"},
    )


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
