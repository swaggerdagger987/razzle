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
import httpx
import logging
import os
import re
import time as _time
import uvicorn

from collections import defaultdict
from . import live_data
from . import auth as auth_module
from . import billing as billing_module
from .logging_config import setup_logging

logger = logging.getLogger("razzle.server")

# ---------------------------------------------------------------------------
# Response-level cache — caches full JSON response bytes for GET /api/* endpoints.
# Eliminates both data-level cache lookup and JSON serialization on hits.
# ---------------------------------------------------------------------------
_resp_cache: dict = {}  # url_path -> {"body": bytes, "t": float, "headers": dict}
_RESP_CACHE_TTL = 120  # 2 minutes
_RESP_CACHE_MAX = 100


def _resp_cache_get(key: str):
    """Get cached response bytes. Returns (body, headers) or None."""
    entry = _resp_cache.get(key)
    if entry and _time.time() - entry["t"] < _RESP_CACHE_TTL:
        return entry["body"], entry["headers"]
    return None


def _resp_cache_set(key: str, body: bytes, headers: dict):
    """Cache response bytes."""
    if len(_resp_cache) >= _RESP_CACHE_MAX:
        # Evict oldest entries
        oldest = sorted(_resp_cache.items(), key=lambda x: x[1]["t"])
        for k, _ in oldest[:20]:
            del _resp_cache[k]
    _resp_cache[key] = {"body": body, "t": _time.time(), "headers": headers}


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


# Broader rate limiter for billing + API key management (5 requests / 60 seconds per IP)
_sensitive_rate_buckets = defaultdict(list)
_SENSITIVE_RATE_LIMIT = 5
_SENSITIVE_RATE_WINDOW = 60

def _check_sensitive_rate(ip: str) -> bool:
    """Rate limit for sensitive mutation endpoints (billing, API key management)."""
    now = _time.time()
    if len(_sensitive_rate_buckets) > _RATE_MAX_IPS:
        stale = [k for k, v in _sensitive_rate_buckets.items()
                 if not v or now - v[-1] > _SENSITIVE_RATE_WINDOW]
        for k in stale:
            del _sensitive_rate_buckets[k]
    bucket = _sensitive_rate_buckets[ip]
    _sensitive_rate_buckets[ip] = [t for t in bucket if now - t < _SENSITIVE_RATE_WINDOW]
    if len(_sensitive_rate_buckets[ip]) >= _SENSITIVE_RATE_LIMIT:
        return False
    _sensitive_rate_buckets[ip].append(now)
    return True


# Screener rate limiter: 30 requests / 60 seconds per IP
_screener_rate_buckets = defaultdict(list)
_SCREENER_RATE_LIMIT = 30
_SCREENER_RATE_WINDOW = 60

def _check_screener_rate(ip: str) -> bool:
    """Rate limit for screener POST endpoint."""
    now = _time.time()
    if len(_screener_rate_buckets) > _RATE_MAX_IPS:
        stale = [k for k, v in _screener_rate_buckets.items()
                 if not v or now - v[-1] > _SCREENER_RATE_WINDOW]
        for k in stale:
            del _screener_rate_buckets[k]
    bucket = _screener_rate_buckets[ip]
    _screener_rate_buckets[ip] = [t for t in bucket if now - t < _SCREENER_RATE_WINDOW]
    if len(_screener_rate_buckets[ip]) >= _SCREENER_RATE_LIMIT:
        return False
    _screener_rate_buckets[ip].append(now)
    return True


def bootstrap_database():
    """Sync nflverse + college data if the DB is empty or missing."""
    import sys, os
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from adapters.nflverse_adapter import (
        get_db as nflverse_db, initialize_database, process_season,
        current_nfl_season, sync_rosters, migrate_add_columns, sync_snap_counts,
    )
    from adapters.college_adapter import (
        get_db as college_db,
        initialize_tables as college_init_tables,
        process_combine, process_draft_picks,
    )

    with nflverse_db() as conn:
        initialize_database(conn)
        migrate_add_columns(conn)

        # Check if we already have data
        try:
            count = conn.execute("SELECT COUNT(*) FROM players").fetchone()[0]
        except Exception:
            logger.warning("Could not count players table — may not exist yet", exc_info=True)
            count = 0

        if count < 50:
            logger.info("Database empty — bootstrapping nflverse data...")
            seasons = list(range(2015, current_nfl_season() + 1))
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
                sync_rosters(conn, sorted(seasons))
                logger.info("  Roster enrichment complete")
            except Exception as e:
                logger.warning(f"  Roster enrichment failed: {e}")
        else:
            logger.info(f"Database has {count} players — skipping bootstrap")

    if count < 50:
        # College/prospect data
        logger.info("Bootstrapping college/prospect data...")
        with college_db() as cconn:
            try:
                college_init_tables(cconn)
                process_combine(cconn)
                process_draft_picks(cconn)
                logger.info("  College data synced")
            except Exception as e:
                logger.warning(f"  College data failed: {e}")

        # cfbfastR college production stats
        logger.info("Bootstrapping cfbfastR college production stats...")
        try:
            from adapters.cfbfastr_adapter import (
                get_db as cfb_db,
                initialize_tables as cfb_init_tables,
                fetch_season_csv, aggregate_season, upsert_stats,
                refine_positions_from_combine,
            )
            with cfb_db() as fconn:
                cfb_init_tables(fconn)
                for s in range(2015, current_nfl_season() + 1):
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
                    logger.warning("refine_positions_from_combine failed", exc_info=True)
                logger.info("  cfbfastR data synced")
        except Exception as e:
            logger.warning(f"  cfbfastR bootstrap failed: {e}")


def _ensure_season_stats_table():
    """Create player_season_stats as an aggregate from player_week_stats if missing."""
    from .db import get_db
    with get_db() as conn:
        exists = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='player_season_stats'"
        ).fetchone()
        if exists:
            return
        logger.info("Creating player_season_stats aggregate table...")
        conn.execute("""
            CREATE TABLE player_season_stats AS
            SELECT
                player_id, season,
                COUNT(DISTINCT week) as games,
                SUM(passing_yards) as passing_yards,
                SUM(passing_tds) as passing_tds,
                SUM(interceptions) as interceptions,
                SUM(rushing_yards) as rushing_yards,
                SUM(rushing_tds) as rushing_tds,
                SUM(receiving_yards) as receiving_yards,
                SUM(receiving_tds) as receiving_tds,
                SUM(receptions) as receptions,
                SUM(carries) as carries,
                SUM(targets) as targets,
                SUM(touchdowns) as touchdowns,
                SUM(turnovers) as turnovers,
                SUM(fantasy_points_ppr) as fantasy_points_ppr,
                COALESCE(SUM(fantasy_points_half_ppr), SUM(fantasy_points_ppr) - 0.5 * SUM(receptions)) as fantasy_points_half_ppr,
                SUM(fantasy_points_std) as fantasy_points_std,
                SUM(completions) as completions,
                SUM(attempts) as attempts,
                SUM(offense_snaps) as offense_snaps,
                AVG(offense_pct) as offense_pct
            FROM player_week_stats
            WHERE season_type = 'regular'
            GROUP BY player_id, season
        """)
        conn.execute("CREATE INDEX idx_pss_player_season ON player_season_stats(player_id, season)")
        conn.execute("CREATE INDEX idx_pss_season ON player_season_stats(season)")
        conn.commit()
        count = conn.execute("SELECT COUNT(*) FROM player_season_stats").fetchone()[0]
        logger.info(f"  player_season_stats: {count} rows")


import threading

# Track bootstrap status for health check
_bootstrap_status = {"done": False, "running": False, "error": None}


def _warm_cache():
    """Pre-populate cache with commonly-hit endpoints to prevent cold-start stampede."""
    warm_targets = [
        ("filter_options", lambda: live_data.get_filter_options()),
        ("featured", lambda: live_data.fetch_featured()),
        ("dynasty_dashboard", lambda: live_data.fetch_dynasty_dashboard()),
        ("dynasty_rankings", lambda: live_data.fetch_dynasty_rankings()),
        ("trade_value_chart", lambda: live_data.fetch_trade_value_chart()),
        ("stat_leaders_2025", lambda: live_data.fetch_stat_leaders(season=2025)),
        ("breakout_2025", lambda: live_data.fetch_breakout_candidates(season=2025)),
        ("matchup_heatmap_2025", lambda: live_data.fetch_matchup_heatmap(season=2025)),
        ("aging_curves", lambda: live_data.fetch_aging_curves()),
        ("players_QB", lambda: live_data.fetch_players(position="QB", limit=50)),
        ("players_RB", lambda: live_data.fetch_players(position="RB", limit=50)),
        ("players_WR", lambda: live_data.fetch_players(position="WR", limit=50)),
        ("players_TE", lambda: live_data.fetch_players(position="TE", limit=50)),
        ("screener_QB", lambda: live_data.fetch_screener({"position": "QB", "season": "2025", "limit": 50, "sort_key": "fantasy_points_half_ppr", "sort_dir": "desc"})),
        ("screener_RB", lambda: live_data.fetch_screener({"position": "RB", "season": "2025", "limit": 50, "sort_key": "fantasy_points_half_ppr", "sort_dir": "desc"})),
        ("screener_WR", lambda: live_data.fetch_screener({"position": "WR", "season": "2025", "limit": 200, "sort_key": "fantasy_points_half_ppr", "sort_dir": "desc"})),
        ("weekly_heatmap_QB", lambda: live_data.fetch_weekly_heatmap(season=2025, position="QB")),
        ("consistency_2025", lambda: live_data.fetch_consistency_rankings(season=2025)),
        ("efficiency_2025", lambda: live_data.fetch_efficiency_rankings(season=2025)),
    ]
    warmed = 0
    for name, fn in warm_targets:
        try:
            fn()
            warmed += 1
        except Exception:
            logger.debug(f"Cache warm skip: {name}")
    logger.info(f"Cache warmed: {warmed}/{len(warm_targets)} endpoints")


def _background_bootstrap():
    """Run heavy data bootstrap in a background thread so the server starts fast."""
    _bootstrap_status["running"] = True
    try:
        bootstrap_database()
        _ensure_season_stats_table()
        _bootstrap_status["done"] = True
        logger.info("Background bootstrap complete")
        _warm_cache()
    except Exception as e:
        _bootstrap_status["error"] = str(e)
        logger.exception("Background bootstrap failed")
    finally:
        _bootstrap_status["running"] = False


def _validate_env():
    """Log structured summary of environment variable status at startup."""
    env_vars = [
        # (name, required, description when missing)
        ("JWT_SECRET", True, "auth tokens will expire on restart"),
        ("STRIPE_SECRET_KEY", False, "billing endpoints disabled"),
        ("STRIPE_WEBHOOK_SECRET", False, "webhook signature verification disabled"),
        ("STRIPE_PRICE_PRO_MONTHLY", False, "Pro monthly checkout disabled"),
        ("STRIPE_PRICE_PRO_ANNUAL", False, "Pro annual checkout disabled"),
        ("STRIPE_PRICE_ELITE_MONTHLY", False, "Elite monthly checkout disabled"),
        ("STRIPE_PRICE_ELITE_ANNUAL", False, "Elite annual checkout disabled"),
        ("ENCRYPTION_KEY", False, "BYOK key encryption falls back to JWT_SECRET"),
        ("RAZZLE_LLM_API_KEY", False, "AI-included mode (Elite) disabled"),
        ("RAZZLE_LLM_BASE_URL", False, "defaults to OpenRouter"),
        ("RAZZLE_LLM_MODEL", False, "defaults to claude-3.5-haiku"),
        ("RAZZLE_BASE_URL", False, "defaults to https://razzle.lol"),
    ]
    lines = ["Environment variable status:"]
    warnings = 0
    for name, critical, desc in env_vars:
        val = os.environ.get(name)
        if val:
            lines.append(f"  {name:.<40s} SET")
        elif critical:
            lines.append(f"  {name:.<40s} MISSING (warning: {desc})")
            warnings += 1
        else:
            lines.append(f"  {name:.<40s} not set ({desc})")
    if warnings:
        logger.warning("\n".join(lines))
    else:
        logger.info("\n".join(lines))


@asynccontextmanager
async def lifespan(app):
    setup_logging()
    _validate_env()
    # Increase thread pool for sync endpoints (default is min(32, cpu+4))
    import asyncio
    from concurrent.futures import ThreadPoolExecutor
    loop = asyncio.get_running_loop()
    loop.set_default_executor(ThreadPoolExecutor(max_workers=20))
    # Essential tables first (fast, < 100ms) — server can respond immediately
    auth_module.initialize_users_db()
    billing_module.initialize_subscriptions_table()
    live_data.init_waitlist_table()
    live_data.init_formula_store_tables()
    live_data._init_analytics_table()
    # Heavy data sync in background thread (may take minutes on cold start)
    t = threading.Thread(target=_background_bootstrap, daemon=True)
    t.start()
    yield


app = FastAPI(title="Razzle API", version="0.1.0", lifespan=lifespan)

app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://razzle.lol", "http://localhost:8000", "http://localhost:5173", "http://127.0.0.1:8000"],
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Serve from frontend/dist/ in production (minified), fallback to frontend/ for local dev
_DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
FRONTEND_DIR = _DIST_DIR if _DIST_DIR.exists() else Path(__file__).resolve().parent.parent / "frontend"

_req_logger = logging.getLogger("razzle.requests")

# Paths that should be cached at response level (GET only, public data)
_RESP_CACHEABLE_PREFIXES = (
    "/api/players", "/api/filter-options", "/api/featured",
    "/api/dynasty-dashboard", "/api/dynasty-rankings", "/api/trade-value-chart",
    "/api/stat-leaders", "/api/breakout-candidates", "/api/matchup-heatmap",
    "/api/aging-curves", "/api/weekly-heatmap", "/api/efficiency-rankings",
    "/api/consistency-rankings", "/api/health",
)


@app.middleware("http")
async def response_cache_middleware(request: Request, call_next):
    """Cache full response bytes for GET /api/* endpoints."""
    path = request.url.path
    if request.method == "GET" and any(path.startswith(p) for p in _RESP_CACHEABLE_PREFIXES):
        cache_key = str(request.url)
        cached = _resp_cache_get(cache_key)
        if cached:
            body, headers = cached
            resp = Response(content=body, media_type="application/json")
            for k, v in headers.items():
                resp.headers[k] = v
            return resp
        response = await call_next(request)
        # Only cache successful responses
        if response.status_code == 200:
            body = b""
            async for chunk in response.body_iterator:
                body += chunk if isinstance(chunk, bytes) else chunk.encode()
            save_headers = {k: v for k, v in response.headers.items()
                           if k.lower() in ("cache-control", "content-type")}
            _resp_cache_set(cache_key, body, save_headers)
            return Response(content=body, status_code=200,
                           media_type=response.media_type, headers=dict(response.headers))
        return response
    return await call_next(request)


_STATIC_ASSET_EXTS = (".js", ".css", ".png", ".svg", ".woff2", ".woff", ".ico", ".jpg", ".jpeg", ".webp")


@app.middleware("http")
async def static_cache_middleware(request: Request, call_next):
    """Add Cache-Control headers for static assets and screener endpoints."""
    response = await call_next(request)
    path = request.url.path

    # Static assets — long cache
    if any(path.endswith(ext) for ext in _STATIC_ASSET_EXTS):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    # Screener POST endpoints — short cache
    elif request.method == "POST" and path in ("/api/screener/query", "/api/screener/sparklines"):
        response.headers["Cache-Control"] = "public, max-age=60"

    return response


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    """Log every HTTP request with method, path, status, duration, and request ID."""
    import uuid as _uuid
    # Generate or propagate request ID
    req_id = request.headers.get("X-Request-ID") or _uuid.uuid4().hex[:12]
    path = request.url.path
    method = request.method
    client = request.client.host if request.client else "unknown"
    start = _time.time()
    try:
        response = await call_next(request)
    except Exception:
        duration_ms = round((_time.time() - start) * 1000)
        _req_logger.exception(
            "500 %s %s (%dms) [%s] client=%s", method, path, duration_ms, req_id, client,
            extra={"request_id": req_id, "method": method, "path": path,
                   "duration_ms": duration_ms, "client": client, "status": 500},
        )
        raise
    duration_ms = round((_time.time() - start) * 1000)
    status = response.status_code
    # Add request ID to response headers for client-side tracing
    response.headers["X-Request-ID"] = req_id
    log_extra = {
        "request_id": req_id, "method": method, "path": path,
        "duration_ms": duration_ms, "client": client, "status": status,
    }
    # Skip noisy health checks at DEBUG level
    if path == "/api/health":
        _req_logger.debug(
            "%d %s %s (%dms) [%s]", status, method, path, duration_ms, req_id,
            extra=log_extra,
        )
    else:
        _req_logger.info(
            "%d %s %s (%dms) [%s]", status, method, path, duration_ms, req_id,
            extra=log_extra,
        )
    return response


# ---------------------------------------------------------------------------
# Security Headers middleware
# ---------------------------------------------------------------------------

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add security headers to every response."""
    response = await call_next(request)

    # Prevent MIME-type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"

    # Prevent clickjacking — DENY for API, SAMEORIGIN for HTML pages
    response.headers["X-Frame-Options"] = "DENY"

    # Modern best practice: disable legacy XSS filter (rely on CSP instead)
    response.headers["X-XSS-Protection"] = "0"

    # Control referrer information leakage
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # HSTS — enforce HTTPS for 1 year, include subdomains
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # Restrict unnecessary browser features
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=(), payment=(self), "
        "usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
    )

    # Content Security Policy — allow Razzle assets, Google Fonts, OpenRouter, Stripe
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://js.stripe.com https://pagead2.googlesyndication.com https://html2canvas.hertzen.com https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: blob: https:; "
        "connect-src 'self' https://openrouter.ai https://api.anthropic.com https://api.openai.com "
        "https://api.sleeper.app https://api.stripe.com https://*.sleeper.app; "
        "frame-src https://js.stripe.com; "
        "object-src 'none'; "
        "base-uri 'self'; "
        "form-action 'self' https://checkout.stripe.com; "
        "upgrade-insecure-requests"
    )

    return response


# ---------------------------------------------------------------------------
# Cache-Control middleware for read-only API endpoints
# ---------------------------------------------------------------------------

# Paths that should NEVER be cached (auth, billing, user-specific, writes)
_NO_CACHE_PREFIXES = (
    "/api/health", "/api/auth/", "/api/billing/", "/api/user/",
    "/api/llm/", "/api/analytics/", "/api/waitlist",
)
# Stable data endpoints get longer cache (60 min) — historical data that rarely changes
_STABLE_CACHE_PATHS = (
    "/api/aging-curves", "/api/college/aging-curves", "/api/college/records",
    "/api/draft-class", "/api/prospect-scores", "/api/prospect-tiers",
    "/api/prospect-comps", "/api/athletic-radar", "/api/trade/pick-values",
    "/api/records", "/api/career-stats", "/api/college/season-recap",
    "/api/college/season-awards", "/api/season-recap", "/api/season-awards",
)


@app.middleware("http")
async def cache_control_middleware(request: Request, call_next):
    """Add Cache-Control headers to GET API responses for cacheable endpoints."""
    response = await call_next(request)
    path = request.url.path
    method = request.method

    # Only cache successful GET requests to /api/ paths
    if method != "GET" or not path.startswith("/api/") or response.status_code >= 400:
        return response

    # Skip if response already has Cache-Control (set explicitly by endpoint)
    existing_cc = response.headers.get("cache-control")
    if existing_cc:
        return response

    # Never cache auth, billing, user-specific endpoints
    if any(path.startswith(p) for p in _NO_CACHE_PREFIXES):
        response.headers["Cache-Control"] = "no-store"
        return response

    # Stable/historical data: 60 min cache
    if any(path.startswith(p) for p in _STABLE_CACHE_PATHS):
        response.headers["Cache-Control"] = "public, max-age=3600"
        return response

    # All other GET /api/ endpoints: 5 min cache
    response.headers["Cache-Control"] = "public, max-age=300"
    return response


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


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions — log full traceback, return generic 500."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    if request.url.path.startswith("/api/"):
        return JSONResponse({"error": "Internal server error"}, status_code=500)
    return HTMLResponse("Internal server error", status_code=500)


# ---------------------------------------------------------------------------
# API endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health(request: Request):
    checks = {}
    overall = "ok"

    # Check 1: terminal.db (main data)
    t0 = _time.time()
    try:
        stats = live_data.db_stats()
        checks["terminal_db"] = {
            "status": "ok",
            "players": stats.get("players", 0),
            "stat_rows": stats.get("stat_rows", 0),
            "seasons": stats.get("seasons", []),
            "query_ms": round((_time.time() - t0) * 1000, 1),
        }
    except Exception as e:
        logger.error("Health check terminal_db error: %s", e, exc_info=True)
        checks["terminal_db"] = {"status": "error", "error": str(e)}
        overall = "degraded"

    # Check 2: users.db (auth/billing)
    t1 = _time.time()
    try:
        with auth_module.get_users_db() as conn:
            user_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            checks["users_db"] = {
                "status": "ok",
                "users": user_count,
                "query_ms": round((_time.time() - t1) * 1000, 1),
            }
    except Exception as e:
        logger.error("Health check users_db error: %s", e, exc_info=True)
        checks["users_db"] = {"status": "error", "error": str(e)}
        overall = "degraded"

    # Check 3: bootstrap status
    checks["bootstrap"] = {
        "done": _bootstrap_status["done"],
        "running": _bootstrap_status["running"],
    }
    if _bootstrap_status["error"]:
        checks["bootstrap"]["error"] = _bootstrap_status["error"]
        overall = "degraded"

    # Check 4: cache stats
    from .live_data.core import cache_stats
    checks["cache"] = cache_stats()

    # Check 5: connection pool stats
    from .db import pool_stats
    checks["connection_pool"] = pool_stats()

    # Always log full diagnostics server-side
    logger.info("Health check: status=%s checks=%s", overall, checks)

    status_code = 200 if overall == "ok" else 503

    # Without valid auth, return only minimal status (no internal details)
    user = require_auth(request)
    if not user:
        return JSONResponse({"status": overall}, status_code=status_code)

    # Authenticated: return full diagnostics
    return JSONResponse(
        {"status": overall, "checks": checks},
        status_code=status_code,
    )


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


_PLAN_HIERARCHY = {"free": 0, "pro": 1, "pro_lifetime": 1, "elite": 2, "elite_lifetime": 2}

def require_plan(request: Request, plan: str = "pro"):
    """Verify auth + plan tier. Elite users can access Pro features.
    Returns (user, error_response). If error_response is not None, return it."""
    user = require_auth(request)
    if not user:
        return None, JSONResponse({"error": "Authentication required"}, status_code=401)
    user_plan = user.get("plan", "free")
    user_level = _PLAN_HIERARCHY.get(user_plan, 0)
    required_level = _PLAN_HIERARCHY.get(plan, 0)
    if user_level < required_level:
        return user, JSONResponse({"error": f"Requires {plan} plan"}, status_code=403)
    return user, None


@app.post("/api/auth/register")
async def auth_register(request: Request):
    ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(ip):
        return JSONResponse({"error": "Too many attempts. Try again in a minute."}, status_code=429, headers={"Retry-After": "60"})
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
        return JSONResponse({"error": "Too many attempts. Try again in a minute."}, status_code=429, headers={"Retry-After": "60"})
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
    # Strict validation to prevent SSRF via username injection
    if not re.match(r'^[a-zA-Z0-9_]{1,30}$', sleeper_username):
        return JSONResponse({"error": "Invalid Sleeper username"}, status_code=400)

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
        logger.warning("Sleeper username validation failed for %s", sleeper_username, exc_info=True)
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
    ip = request.client.host if request.client else "unknown"
    if not _check_sensitive_rate(ip):
        return JSONResponse(
            {"error": "Too many checkout attempts. Try again in a minute."},
            status_code=429,
            headers={"Retry-After": "60"},
        )
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    body = await request.json()
    interval = body.get("interval", "year")  # "year" or "month"
    promo_code = body.get("promo_code", "")
    result = billing_module.create_checkout_session(user, interval, promo_code=promo_code)
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


@app.post("/api/billing/validate-promo")
async def validate_promo(request: Request):
    """Validate a promo code before checkout."""
    body = await request.json()
    code = body.get("code", "")
    if not code:
        return JSONResponse({"valid": False, "error": "No code provided"}, status_code=400)
    return billing_module.validate_promo_code(code)


@app.get("/api/billing/promotions")
async def billing_promotions():
    """Get early adopter / lifetime deal availability. Public endpoint (no auth)."""
    return billing_module.get_early_adopter_status()


# ---------------------------------------------------------------------------
# AI Query Rate Limiting (server-side, all tiers)
# ---------------------------------------------------------------------------

@app.get("/api/agents/quota")
async def get_query_quota(request: Request):
    """Check remaining AI query quota for today."""
    ip = request.client.host if request.client else "unknown"
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user_id = None
    plan = "free"

    if token:
        try:
            result = auth_module.get_current_user(token)
            if "user" in result:
                user_id = result["user"]["id"]
                plan = result["user"].get("plan", "free")
        except Exception:
            pass

    return auth_module.check_query_quota(user_id=user_id, ip_address=ip, plan=plan)


@app.post("/api/agents/track")
async def track_query(request: Request):
    """Record an AI query and return updated quota. Call BEFORE making LLM request.
    Returns 429 if quota exhausted."""
    ip = request.client.host if request.client else "unknown"
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user_id = None
    plan = "free"

    if token:
        try:
            result = auth_module.get_current_user(token)
            if "user" in result:
                user_id = result["user"]["id"]
                plan = result["user"].get("plan", "free")
        except Exception:
            pass

    # Check quota first
    quota = auth_module.check_query_quota(user_id=user_id, ip_address=ip, plan=plan)
    if not quota["allowed"]:
        return JSONResponse({
            "error": "Daily query limit reached",
            "used": quota["used"],
            "limit": quota["limit"],
            "remaining": 0,
            "plan": plan,
        }, status_code=429, headers={"Retry-After": "3600"})

    # Record the query
    auth_module.record_query(user_id=user_id, ip_address=ip)

    # Return updated quota
    updated = auth_module.check_query_quota(user_id=user_id, ip_address=ip, plan=plan)
    return updated


# ---------------------------------------------------------------------------
# LLM Proxy (Elite tier — AI-included mode)
# ---------------------------------------------------------------------------

# Server-side LLM key for Elite users (never exposed to frontend)
_LLM_API_KEY = os.environ.get("RAZZLE_LLM_API_KEY", "")  # OpenRouter API key
_LLM_BASE_URL = os.environ.get("RAZZLE_LLM_BASE_URL", "https://openrouter.ai/api/v1/chat/completions")
_LLM_MODEL = os.environ.get("RAZZLE_LLM_MODEL", "anthropic/claude-3.5-haiku")  # cost-efficient default
_LLM_FREE_MODEL = os.environ.get("RAZZLE_LLM_FREE_MODEL", "meta-llama/llama-3.1-8b-instruct:free")
_LLM_TIMEOUT = 25  # seconds
_LLM_MAX_TOKENS = 2000
_LLM_FREE_MAX_TOKENS = 1000

# Per-user server-side rate limiter for LLM proxy
_llm_rate_buckets = defaultdict(list)  # user_id -> [timestamps]
_LLM_RATE_LIMIT_ELITE = 100  # max queries per day for Elite (server-side)
_LLM_RATE_WINDOW = 86400  # 24 hours in seconds


def _check_llm_rate(user_id: int) -> bool:
    """Check if user is within LLM rate limit. Returns True if allowed."""
    now = _time.time()
    bucket = _llm_rate_buckets[user_id]
    # Prune old entries
    _llm_rate_buckets[user_id] = [t for t in bucket if now - t < _LLM_RATE_WINDOW]
    if len(_llm_rate_buckets[user_id]) >= _LLM_RATE_LIMIT_ELITE:
        return False
    _llm_rate_buckets[user_id].append(now)
    return True


@app.post("/api/llm/chat")
async def llm_chat(request: Request):
    """Server-side LLM proxy for Elite tier users.
    Accepts OpenRouter-compatible request body. Proxies to configured LLM provider.
    Elite users don't need their own API key — the server pays for the inference.
    """
    # Require Elite tier
    user, err = require_plan(request, "elite")
    if err:
        return err

    if not _LLM_API_KEY:
        return JSONResponse(
            {"error": "AI-included mode not yet configured. Use BYOK mode with your own API key."},
            status_code=503,
        )

    # Rate limit
    if not _check_llm_rate(user["id"]):
        return JSONResponse(
            {"error": "Daily server-side query limit reached. Try again tomorrow."},
            status_code=429,
        )

    # Parse request
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid request body"}, status_code=400)

    messages = body.get("messages", [])
    if not messages:
        return JSONResponse({"error": "No messages provided"}, status_code=400)

    # Sanitize: enforce max_tokens and model
    llm_body = {
        "model": _LLM_MODEL,
        "messages": messages,
        "temperature": body.get("temperature", 0.3),
        "max_tokens": min(body.get("max_tokens", _LLM_MAX_TOKENS), _LLM_MAX_TOKENS),
    }

    # Proxy to LLM provider
    try:
        async with httpx.AsyncClient(timeout=_LLM_TIMEOUT) as client:
            resp = await client.post(
                _LLM_BASE_URL,
                json=llm_body,
                headers={
                    "Authorization": f"Bearer {_LLM_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://razzle.lol",
                    "X-Title": "Razzle Situation Room",
                },
            )
        if resp.status_code != 200:
            # Don't expose provider error details to user
            logger.error(f"LLM proxy error: {resp.status_code} {resp.text[:200]}")
            return JSONResponse(
                {"error": "Agent is temporarily unavailable. Try again in a moment."},
                status_code=502,
            )
        return JSONResponse(resp.json())
    except httpx.TimeoutException:
        return JSONResponse(
            {"error": "Agent took too long to respond. Try a shorter question."},
            status_code=504,
        )
    except Exception as e:
        logger.error(f"LLM proxy exception: {type(e).__name__}: {e}")
        return JSONResponse(
            {"error": "Something went wrong. Try again."},
            status_code=500,
        )


@app.post("/api/llm/chat-free")
async def llm_chat_free(request: Request):
    """Server-side LLM proxy for free-tier users (5 queries/day).
    Uses a free model via OpenRouter. Requires authentication.
    """
    # Require any logged-in user
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return JSONResponse({"error": "Sign in required for free AI queries."}, status_code=401)

    try:
        result = auth_module.get_current_user(token)
        if "error" in result:
            return JSONResponse({"error": "Sign in required."}, status_code=401)
        user = result["user"]
    except Exception:
        return JSONResponse({"error": "Sign in required."}, status_code=401)

    if not _LLM_API_KEY:
        return JSONResponse(
            {"error": "AI queries not yet configured. Use BYOK mode with your own API key."},
            status_code=503,
        )

    # Check quota via existing system
    ip = request.client.host if request.client else "unknown"
    plan = user.get("plan", "free")
    quota = auth_module.check_query_quota(user_id=user["id"], ip_address=ip, plan=plan)
    if not quota.get("allowed", False):
        return JSONResponse({
            "error": "you've used all 5 free queries today. upgrade to Pro or add your own API key.",
            "used": quota.get("used", 5),
            "limit": quota.get("limit", 5),
        }, status_code=429)

    # Record the query
    auth_module.record_query(user_id=user["id"], ip_address=ip)

    # Parse request
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid request body"}, status_code=400)

    messages = body.get("messages", [])
    if not messages:
        return JSONResponse({"error": "No messages provided"}, status_code=400)

    # Enforce server-side system prompt — strip any client system messages
    user_messages = [m for m in messages if m.get("role") != "system"]
    system_prompt = (
        "You are a fantasy football analyst for Razzle, a dynasty and redraft analytics platform. "
        "Provide helpful, concise analysis based on the scenario provided. "
        "Cover key factors, risks, and a clear recommendation."
    )
    sanitized_messages = [{"role": "system", "content": system_prompt}] + user_messages

    llm_body = {
        "model": _LLM_FREE_MODEL,
        "messages": sanitized_messages,
        "temperature": body.get("temperature", 0.3),
        "max_tokens": min(body.get("max_tokens", _LLM_FREE_MAX_TOKENS), _LLM_FREE_MAX_TOKENS),
    }

    try:
        async with httpx.AsyncClient(timeout=_LLM_TIMEOUT) as client:
            resp = await client.post(
                _LLM_BASE_URL,
                json=llm_body,
                headers={
                    "Authorization": f"Bearer {_LLM_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://razzle.lol",
                    "X-Title": "Razzle Situation Room (Free Tier)",
                },
            )
        if resp.status_code != 200:
            logger.error(f"Free LLM proxy error: {resp.status_code} {resp.text[:200]}")
            return JSONResponse(
                {"error": "Agent is temporarily unavailable. Try again in a moment."},
                status_code=502,
            )
        data = resp.json()
        # Tag response with free model info
        data["_razzle_free_model"] = _LLM_FREE_MODEL
        return JSONResponse(data)
    except httpx.TimeoutException:
        return JSONResponse(
            {"error": "Agent took too long to respond. Try a shorter question."},
            status_code=504,
        )
    except Exception as e:
        logger.error(f"Free LLM proxy exception: {type(e).__name__}: {e}")
        return JSONResponse(
            {"error": "Something went wrong. Try again."},
            status_code=500,
        )


# ---------------------------------------------------------------------------
# BYOK API Key Management (encrypted server-side storage)
# ---------------------------------------------------------------------------

@app.get("/api/user/api-keys")
async def get_api_keys(request: Request):
    """List stored API keys for the authenticated user. Returns metadata only, NEVER key values."""
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    # Require Pro+ (BYOK is a Pro feature)
    _, err = require_plan(request, "pro")
    if err:
        return err
    return auth_module.get_api_keys(user["id"])


@app.post("/api/user/api-keys")
async def save_api_key(request: Request):
    """Store an encrypted API key. Requires Pro+ tier."""
    ip = request.client.host if request.client else "unknown"
    if not _check_sensitive_rate(ip):
        return JSONResponse(
            {"error": "Too many requests. Try again in a minute."},
            status_code=429,
            headers={"Retry-After": "60"},
        )
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    _, err = require_plan(request, "pro")
    if err:
        return err

    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid request body"}, status_code=400)

    provider = body.get("provider", "").strip().lower()
    api_key = body.get("api_key", "").strip()
    label = body.get("label", "").strip()

    if not provider or not api_key:
        return JSONResponse({"error": "provider and api_key are required"}, status_code=400)

    result = auth_module.save_api_key(user["id"], provider, api_key, label or None)
    if "error" in result:
        return JSONResponse(result, status_code=400)
    return result


# REMOVED: /api/user/api-keys/{provider}/decrypt
# Decrypt endpoint was security theater — returning plaintext keys to the browser
# defeats the purpose of encrypting them. Users paste their key on each new browser.
# Encrypted backup (POST /api/user/api-keys) still works for support recovery.


@app.delete("/api/user/api-keys/{provider}")
async def delete_api_key(provider: str, request: Request):
    """Delete a stored API key."""
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    _, err = require_plan(request, "pro")
    if err:
        return err

    result = auth_module.delete_api_key(user["id"], provider.strip().lower())
    if "error" in result:
        return JSONResponse(result, status_code=400)
    return result


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
# Agent Memory endpoints (Elite tier — server-side persistence)
# ---------------------------------------------------------------------------

@app.get("/api/user/memory")
async def get_agent_memory(request: Request, league_id: str = None,
                           search: str = None, limit: int = 50):
    user, err = require_plan(request, "elite")
    if err:
        return err
    return auth_module.get_agent_memories(
        user["id"], league_id=league_id, search=search, limit=limit
    )


@app.post("/api/user/memory")
async def save_agent_memory(request: Request):
    user, err = require_plan(request, "elite")
    if err:
        return err
    body = await request.json()
    result = auth_module.save_agent_memory(
        user["id"],
        scenario=body.get("scenario", ""),
        findings=body.get("findings", ""),
        league_id=body.get("league_id"),
        league_name=body.get("league_name"),
    )
    if "error" in result:
        return JSONResponse({"error": result["error"]}, status_code=result.get("status", 400))
    return result


@app.delete("/api/user/memory/{memory_id}")
async def delete_agent_memory(memory_id: int, request: Request):
    user, err = require_plan(request, "elite")
    if err:
        return err
    result = auth_module.delete_agent_memory(user["id"], memory_id)
    if "error" in result:
        return JSONResponse({"error": result["error"]}, status_code=result.get("status", 404))
    return result


@app.delete("/api/user/memory")
async def clear_agent_memory(request: Request, league_id: str = None):
    user, err = require_plan(request, "elite")
    if err:
        return err
    return auth_module.clear_agent_memories(user["id"], league_id=league_id)


# ---------------------------------------------------------------------------
# Weekly Briefings endpoints (Elite tier)
# ---------------------------------------------------------------------------

@app.get("/api/briefings/latest")
async def get_latest_briefing(request: Request, league_id: str = None):
    """Get the most recent weekly briefing for the authenticated Elite user."""
    user, err = require_plan(request, "elite")
    if err:
        return err
    briefing = auth_module.get_latest_briefing(user["id"], league_id=league_id)
    if not briefing:
        return JSONResponse({"briefing": None, "message": "No briefings yet. Generate one from the Situation Room."})
    return JSONResponse({"briefing": briefing})


@app.get("/api/briefings/history")
async def get_briefing_history(request: Request, limit: int = 10):
    """Get briefing history for the authenticated Elite user."""
    user, err = require_plan(request, "elite")
    if err:
        return err
    history = auth_module.get_briefing_history(user["id"], limit=min(limit, 50))
    return JSONResponse({"briefings": history, "count": len(history)})


@app.post("/api/briefings/save")
async def save_weekly_briefing(request: Request):
    """Save a weekly briefing generated client-side by the agent orchestrator."""
    user, err = require_plan(request, "elite")
    if err:
        return err
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON body"}, status_code=400)

    week_label = body.get("week_label", "")
    summary = body.get("summary", "")
    if not week_label or not summary:
        return JSONResponse({"error": "week_label and summary are required"}, status_code=400)

    import json as _json
    result = auth_module.save_weekly_briefing(
        user_id=user["id"],
        league_id=body.get("league_id", ""),
        league_name=body.get("league_name", ""),
        week_label=week_label,
        summary=summary,
        urgency_items=_json.dumps(body.get("urgency_items", [])),
        monitor_items=_json.dumps(body.get("monitor_items", [])),
        opportunity_items=_json.dumps(body.get("opportunity_items", [])),
        agent_highlights=_json.dumps(body.get("agent_highlights", [])),
    )
    return JSONResponse(result)


# ---------------------------------------------------------------------------
# Priority Data Refresh (Elite tier)
# ---------------------------------------------------------------------------

@app.post("/api/data/refresh")
async def priority_data_refresh(request: Request):
    """Trigger a priority data refresh for Elite users.
    Re-fetches the latest Sleeper league data for their connected username."""
    user, err = require_plan(request, "elite")
    if err:
        return err
    sleeper_username = user.get("sleeper_username")
    if not sleeper_username:
        return JSONResponse(
            {"error": "No Sleeper username linked. Connect your account in League Intel first."},
            status_code=400,
        )
    # Return the username so the client can trigger a fresh Sleeper API pull
    # (Sleeper data is fetched client-side from their public API)
    return JSONResponse({
        "status": "ready",
        "sleeper_username": sleeper_username,
        "message": "Priority refresh authorized. Client should re-fetch Sleeper data now.",
    })


# ---------------------------------------------------------------------------
# Saved Views endpoints (Pro+ cloud sync)
# ---------------------------------------------------------------------------

@app.get("/api/user/views")
async def get_saved_views(request: Request):
    user, err = require_plan(request, "pro")
    if err:
        return err
    return auth_module.get_saved_views(user["id"])


@app.post("/api/user/views/sync")
async def sync_saved_views(request: Request):
    user, err = require_plan(request, "pro")
    if err:
        return err
    body = await request.json()
    views = body.get("views", [])
    if not isinstance(views, list):
        return JSONResponse({"error": "views must be a list"}, status_code=400)
    return auth_module.sync_saved_views(user["id"], views)


# ---------------------------------------------------------------------------
# Watchlist endpoints (Pro+ cloud sync)
# ---------------------------------------------------------------------------

@app.get("/api/user/watchlist")
async def get_watchlist(request: Request):
    user, err = require_plan(request, "pro")
    if err:
        return err
    return auth_module.get_watchlist(user["id"])


@app.post("/api/user/watchlist/sync")
async def sync_watchlist(request: Request):
    user, err = require_plan(request, "pro")
    if err:
        return err
    body = await request.json()
    players = body.get("players", [])
    if not isinstance(players, list):
        return JSONResponse({"error": "players must be a list"}, status_code=400)
    return auth_module.sync_watchlist(user["id"], players)


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
    client_ip = request.client.host if request.client else "unknown"
    if not _check_screener_rate(client_ip):
        return JSONResponse({"error": "Rate limited. Try again shortly."}, status_code=429)
    import json as _json
    body = await request.json()
    # Response-level cache for screener POST (most expensive endpoint)
    cache_key = "screener_post:" + _json.dumps(body, sort_keys=True, default=str)
    cached = _resp_cache_get(cache_key)
    if cached:
        return Response(content=cached[0], media_type="application/json")
    result = live_data.fetch_screener(body)
    resp_bytes = _json.dumps(result, default=str).encode()
    _resp_cache_set(cache_key, resp_bytes, {})
    return Response(content=resp_bytes, media_type="application/json")


@app.post("/api/screener/sparklines")
async def screener_sparklines(request: Request):
    body = await request.json()
    player_ids = body.get("player_ids", [])
    season = body.get("season", 0)
    return live_data.fetch_screener_sparklines(player_ids, season)


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


@app.get("/api/draft-class-tracker")
def draft_class_tracker(draft_year: int = 0, position: str = ""):
    return live_data.fetch_draft_class_tracker(
        draft_year=draft_year or None,
        position=position or None,
    )


@app.get("/api/athletic-radar")
def athletic_radar(position: str = "", draft_year: int = 0):
    pos = position.strip().upper() if position else ""
    if pos and pos not in ("QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "EDGE"):
        pos = ""
    return live_data.fetch_athletic_radar(position=pos, draft_year=draft_year)


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


@app.get("/api/college/breakouts")
def college_breakouts(season: int = None, position: str = "", limit: int = 50):
    return live_data.fetch_college_breakouts(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/efficiency")
def college_efficiency(season: int = None, position: str = "", limit: int = 30):
    return live_data.fetch_college_efficiency(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/leaders")
def college_leaders(season: int = None, position: str = "", limit: int = 10):
    return live_data.fetch_college_leaders(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/trends")
def college_trends(season: int = None, position: str = "", limit: int = 30):
    return live_data.fetch_college_trends(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/rankings")
def college_rankings(season: int = None, position: str = "", limit: int = 50):
    return live_data.fetch_college_rankings(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/streaks")
def college_streaks(season: int = None, position: str = "", limit: int = 25):
    return live_data.fetch_college_streaks(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/stock-watch")
def college_stock_watch(season: int = None, position: str = "", limit: int = 30):
    return live_data.fetch_college_stock_watch(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/scarcity")
def college_scarcity(season: int = None):
    return live_data.fetch_college_scarcity(season=season)


@app.get("/api/college/consistency")
def college_consistency(season: int = None, position: str = "", limit: int = 30):
    return live_data.fetch_college_consistency(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/workload")
def college_workload(season: int = None, position: str = "", limit: int = 50):
    return live_data.fetch_college_workload(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/dual-threat")
def college_dual_threat(season: int = None, position: str = "", limit: int = 50):
    return live_data.fetch_college_dual_threat(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/snap-efficiency")
def college_snap_efficiency(season: int = None, position: str = "", limit: int = 50):
    return live_data.fetch_college_snap_efficiency(
        season=season, position=position or None, limit=limit,
    )


@app.get("/api/college/aging-curves")
def college_aging_curves(position: str = ""):
    return live_data.fetch_college_aging_curves(position=position or None)


@app.get("/api/college/records")
def college_records(position: str = "", limit: int = 10):
    return live_data.fetch_college_records(position=position or None, limit=limit)


@app.get("/api/college/season-recap")
def college_season_recap(season: int = None):
    return live_data.fetch_college_season_recap(season=season)


@app.get("/api/college/season-awards")
def college_season_awards(season: int = None, position: str = ""):
    return live_data.fetch_college_season_awards(season=season, position=position or None)


@app.get("/api/college/stat-explorer")
def college_stat_explorer(season: int = None, position: str = "", x_stat: str = "total_ypg", y_stat: str = "ppg"):
    return live_data.fetch_college_stat_explorer(season=season, position=position or None, x_stat=x_stat, y_stat=y_stat)


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
    user = require_auth(request)
    if not user:
        return JSONResponse({"error": "Authentication required"}, status_code=401)
    body = await request.json()
    return live_data.rate_formula(
        formula_id=formula_id,
        rating=body.get("rating", 0),
        review=body.get("review", ""),
        user_id=user["id"],
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
    from backend.live_data.core import _current_nfl_season
    season = params.get("season", str(_current_nfl_season()))
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
        logger.debug("OG tag generation failed for player page", exc_info=True)
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
        logger.debug("JSON-LD injection failed for player page", exc_info=True)

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
        logger.debug("OG tag generation failed for compare page", exc_info=True)
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
        ("/career.html", "0.8", "weekly"),
        ("/career-compare.html", "0.8", "weekly"),
        ("/draftclass.html", "0.8", "weekly"),
        ("/percentiles.html", "0.8", "weekly"),
        ("/regression.html", "0.8", "weekly"),
        ("/strengths.html", "0.8", "weekly"),
        ("/breakdown.html", "0.8", "weekly"),
        ("/weeklyleaders.html", "0.8", "weekly"),
        ("/pace.html", "0.8", "weekly"),
        ("/gamelog.html", "0.8", "weekly"),
        ("/streaks.html", "0.8", "weekly"),
        ("/recap.html", "0.8", "weekly"),
        ("/comptable.html", "0.8", "weekly"),
        ("/records.html", "0.8", "weekly"),
        ("/waivers.html", "0.8", "weekly"),
        ("/playoffs.html", "0.8", "weekly"),
        ("/fptsbreakdown.html", "0.8", "weekly"),
        ("/handcuffs.html", "0.8", "weekly"),
        ("/weeklymvp.html", "0.8", "weekly"),
        ("/stacks.html", "0.8", "weekly"),
        ("/advantage.html", "0.8", "weekly"),
        ("/tdregression.html", "0.8", "weekly"),
        ("/dualthreat.html", "0.8", "weekly"),
        ("/snapefficiency.html", "0.8", "weekly"),
        ("/garbagetime.html", "0.8", "weekly"),
        ("/seasonpace.html", "0.8", "weekly"),
        ("/targetpremium.html", "0.8", "weekly"),
        ("/workload.html", "0.8", "weekly"),
        ("/drops.html", "0.8", "weekly"),
        ("/successrate.html", "0.8", "weekly"),
        ("/gamescript.html", "0.8", "weekly"),
        ("/league-intel.html", "0.7", "monthly"),
        ("/agents.html", "0.7", "monthly"),
        ("/pricing.html", "0.7", "monthly"),
        ("/about.html", "0.4", "monthly"),
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
        logger.warning("Sitemap player URL generation failed", exc_info=True)

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
def trade_pick_values(year: int = 0, rounds: int = 4, teams: int = 12):
    """Return dynasty draft pick trade values."""
    if year <= 0:
        from backend.live_data.core import _current_draft_year
        year = _current_draft_year()
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
def dynasty_rankings(season: int = 0, position: str = "", limit: int = 200):
    """Return tiered dynasty rankings for all fantasy-relevant players."""
    pos = position.strip().upper() if position else None
    limit = max(1, min(300, limit))
    return live_data.fetch_dynasty_rankings(season=season or None, position=pos, limit=limit)


@app.get("/api/dynasty-history")
def dynasty_history(position: str = "", limit: int = 20, players: str = ""):
    """Return dynasty value progression for top players across all seasons."""
    pos = position.strip().upper() if position else None
    limit = max(1, min(50, limit))
    if players:
        pids = [p.strip() for p in players.split(",") if p.strip()][:5]
        if pids:
            return live_data.fetch_dynasty_history(player_ids=pids)
    return live_data.fetch_dynasty_history(position=pos, limit=limit)


@app.get("/api/stat-leaders")
def stat_leaders(season: int = 0, position: str = "", limit: int = 10):
    """Return top players in each key fantasy stat category."""
    s = season if season > 0 else None
    pos = position.strip().upper() if position else None
    limit = max(1, min(25, limit))
    try:
        return live_data.fetch_stat_leaders(season=s, position=pos, limit=limit)
    except Exception as e:
        logger.exception("stat-leaders error")
        return JSONResponse({"error": "Failed to fetch stat leaders"}, status_code=500)


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
        logger.exception("aging_curves error")
        return JSONResponse({"error": "Failed to fetch aging curves"}, status_code=500)


@app.get("/api/weekly-heatmap")
def weekly_heatmap(season: int = 0, position: str = "", limit: int = 40):
    """Return weekly scoring heatmap — players × weeks with PPR scores."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_weekly_heatmap(season=s, position=pos, limit=max(1, min(limit, 50)))
    except Exception as e:
        logger.exception("weekly_heatmap error")
        return JSONResponse({"error": "Failed to fetch weekly heatmap"}, status_code=500)


@app.get("/api/target-distribution")
def target_distribution(season: int = 0, team: str = ""):
    """Return target and carry distribution by team."""
    try:
        s = season if season > 0 else None
        t = team.upper() if team else None
        return live_data.fetch_target_distribution(season=s, team=t)
    except Exception as e:
        logger.exception("target_distribution error")
        return JSONResponse({"error": "Failed to fetch target distribution"}, status_code=500)


@app.get("/api/matchup-heatmap")
def matchup_heatmap(season: int = 0, position: str = ""):
    """Return fantasy points allowed by defense per position — matchup heatmap."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_matchup_heatmap(season=s, position=pos)
    except Exception as e:
        logger.exception("matchup_heatmap error")
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
        logger.exception("usage_trends error")
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
        logger.exception("year_over_year error")
        return JSONResponse({"error": "Failed to fetch year-over-year data"}, status_code=500)


@app.get("/api/stat-explorer")
def stat_explorer(season: int = 0, position: str = "", x_stat: str = "targets_g", y_stat: str = "ppg"):
    """Return scatter plot data for two user-chosen stats."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_stat_explorer(season=s, position=pos, x_stat=x_stat, y_stat=y_stat)
    except Exception as e:
        logger.exception("stat_explorer error")
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
        logger.exception("air_yards error")
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
        logger.exception("redzone_usage error")
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
        logger.exception("efficiency_rankings error")
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
        logger.exception("consistency_rankings error")
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
        logger.exception("strength_of_schedule error")
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
        logger.exception("stock_watch error")
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
        logger.exception("opportunity_share error")
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
        logger.exception("report_cards error")
        return JSONResponse({"error": "Failed to fetch report card data"}, status_code=500)


@app.get("/api/season-awards")
def season_awards(season: int = 0, position: str = ""):
    """Return fantasy season superlatives / awards."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_season_awards(season=s, position=pos)
    except Exception as e:
        logger.exception("season_awards error")
        return JSONResponse({"error": "Failed to fetch season awards data"}, status_code=500)


@app.get("/api/vorp")
def vorp(season: int = 0, position: str = "", limit: int = 30):
    """Return Value Over Replacement Player rankings."""
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_vorp(season=s, position=pos, limit=limit)
    except Exception as e:
        logger.exception("vorp error")
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
        logger.exception("trade-value-chart error")
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
        logger.exception("trade-finder error")
        return JSONResponse({"error": "Failed to fetch trade finder data"}, status_code=500)


@app.post("/api/league-trade-finder")
async def league_trade_finder(request: Request):
    """Match Sleeper player names to Razzle trade values for league-specific trade analysis.
    Pro+ only. Accepts {players: [{name, position, team}, ...]}."""
    user, err = require_plan(request, "pro")
    if err:
        return err
    try:
        body = await request.json()
        player_names = body.get("players", [])
        if not player_names or not isinstance(player_names, list):
            return JSONResponse({"error": "players array is required"}, status_code=400)
        # Cap at 500 players (large leagues with many rosters)
        player_names = player_names[:500]
        # Validate entries
        clean = []
        for entry in player_names:
            if isinstance(entry, dict) and entry.get("name"):
                clean.append({
                    "name": str(entry["name"])[:100],
                    "position": str(entry.get("position", ""))[:5],
                    "team": str(entry.get("team", ""))[:5],
                })
        if not clean:
            return JSONResponse({"error": "No valid player entries"}, status_code=400)
        return live_data.fetch_league_trade_values(player_names=clean)
    except Exception as e:
        logger.exception("league-trade-finder error")
        return JSONResponse({"error": "Failed to fetch league trade values"}, status_code=500)


@app.get("/api/cheat-sheet")
def cheat_sheet(season: int = 0, format: str = "ppr"):
    """Return a draft cheat sheet grouped by position."""
    try:
        s = season if season > 0 else None
        fmt = format if format in ("ppr", "half", "std") else "ppr"
        return live_data.fetch_cheat_sheet(season=s, fmt=fmt)
    except Exception as e:
        logger.exception("cheat-sheet error")
        return JSONResponse({"error": "Failed to fetch cheat sheet"}, status_code=500)


@app.get("/api/scoring-comparison")
def scoring_comparison(season: int = 0, position: str = ""):
    """Compare player rankings across PPR, Half-PPR, and Standard scoring."""
    try:
        s = season if season > 0 else None
        pos = position if position else None
        return live_data.fetch_scoring_comparison(season=s, position=pos)
    except Exception as e:
        logger.exception("scoring-comparison error")
        return JSONResponse({"error": "Failed to fetch scoring comparison"}, status_code=500)


@app.post("/api/roster-grade")
async def roster_grade(request: Request):
    """Grade a hypothetical dynasty roster from a list of player IDs. Pro+ only."""
    user, err = require_plan(request, "pro")
    if err:
        return err
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
        logger.exception("roster-grade error")
        return JSONResponse({"error": "Failed to grade roster"}, status_code=500)


@app.get("/api/auction-values")
def auction_values(season: int = 0, budget: int = 200, roster_size: int = 15):
    """Convert trade values into auction dollar amounts."""
    try:
        s = season if season > 0 else None
        return live_data.fetch_auction_values(season=s, budget=budget, roster_size=roster_size)
    except Exception as e:
        logger.exception("auction-values error")
        return JSONResponse({"error": "Failed to fetch auction values"}, status_code=500)


@app.get("/api/tier-list")
def tier_list(season: int = 0, position: str = ""):
    """Return players grouped into S/A/B/C/D/F tiers by trade value."""
    try:
        s = season if season > 0 else None
        pos = position.strip().upper() if position else None
        return live_data.fetch_tier_list(season=s, position=pos)
    except Exception as e:
        logger.exception("tier-list error")
        return JSONResponse({"error": "Failed to fetch tier list"}, status_code=500)


@app.get("/api/player-archetypes")
def player_archetypes(season: int = 0, position: str = ""):
    """Classify players into statistical archetypes."""
    try:
        s = season if season > 0 else None
        pos = position if position else None
        return live_data.fetch_player_archetypes(season=s, position=pos)
    except Exception as e:
        logger.exception("player-archetypes error")
        return JSONResponse({"error": "Failed to fetch player archetypes"}, status_code=500)


@app.get("/api/dynasty-dashboard")
def dynasty_dashboard(season: int = 0):
    """Aggregated dynasty dashboard with risers, fallers, value picks, and scarcity."""
    try:
        s = season if season > 0 else None
        return live_data.fetch_dynasty_dashboard(season=s)
    except Exception as e:
        logger.exception("dynasty-dashboard error")
        return JSONResponse({"error": "Failed to fetch dynasty dashboard"}, status_code=500)


@app.get("/api/career-stats")
def career_stats(player_id: str = ""):
    """Return season-by-season career stats for a player."""
    try:
        if not player_id:
            return JSONResponse({"error": "player_id is required"}, status_code=400)
        return live_data.fetch_career_stats(player_id)
    except Exception as e:
        logger.exception("career-stats error")
        return JSONResponse({"error": "Failed to fetch career stats"}, status_code=500)


@app.get("/api/player-percentiles")
def player_percentiles(player_id: str = "", season: int = 0):
    """Return percentile rankings for a player vs. position group."""
    try:
        if not player_id:
            return JSONResponse({"error": "player_id is required"}, status_code=400)
        s = season if season > 0 else None
        return live_data.fetch_player_percentiles(player_id, season=s)
    except Exception as e:
        logger.exception("player-percentiles error")
        return JSONResponse({"error": "Failed to fetch player percentiles"}, status_code=500)


@app.get("/api/draft-class")
def draft_class(year: int = 0, position: str = ""):
    """Return fantasy production stats for a draft class."""
    try:
        yr = year if year > 0 else None
        pos = position if position else None
        return live_data.fetch_draft_class(draft_year=yr, position=pos)
    except Exception as e:
        logger.exception("draft-class error")
        return JSONResponse({"error": "Failed to fetch draft class"}, status_code=500)


@app.get("/api/weekly-leaders")
def weekly_leaders(season: int = 0, week: int = 0, position: str = ""):
    """Return top fantasy performers for a given week."""
    try:
        s = season if season > 0 else None
        w = week if week > 0 else None
        pos = position if position else None
        return live_data.fetch_weekly_leaders(season=s, week=w, position=pos)
    except Exception as e:
        logger.exception("weekly-leaders error")
        return JSONResponse({"error": "Failed to fetch weekly leaders"}, status_code=500)


@app.get("/api/points-breakdown")
def points_breakdown(player_id: str = "", season: int = 0):
    """Return fantasy points breakdown by scoring component."""
    if not player_id:
        return JSONResponse({"error": "player_id is required"}, status_code=400)
    try:
        s = season if season > 0 else None
        return live_data.fetch_points_breakdown(player_id=player_id, season=s)
    except Exception as e:
        logger.exception("points-breakdown error")
        return JSONResponse({"error": "Failed to fetch points breakdown"}, status_code=500)


@app.get("/api/player-strengths")
def player_strengths(player_id: str = "", season: int = 0):
    """Return a player's top strengths and weaknesses from percentile data."""
    if not player_id:
        return JSONResponse({"error": "player_id is required"}, status_code=400)
    try:
        s = season if season > 0 else None
        return live_data.fetch_player_strengths(player_id=player_id, season=s)
    except Exception as e:
        logger.exception("player-strengths error")
        return JSONResponse({"error": "Failed to fetch player strengths"}, status_code=500)


@app.get("/api/td-regression")
def td_regression(season: int = 0, position: str = ""):
    """Return players due for positive/negative TD regression."""
    try:
        s = season if season > 0 else None
        pos = position if position else None
        return live_data.fetch_td_regression(season=s, position=pos)
    except Exception as e:
        logger.exception("td-regression error")
        return JSONResponse({"error": "Failed to fetch TD regression"}, status_code=500)


@app.get("/api/pace-tracker")
def pace_tracker(season: int = 0, position: str = ""):
    """Return season pace projections and milestone tracking."""
    try:
        s = season if season > 0 else None
        pos = position if position else None
        return live_data.fetch_pace_tracker(season=s, position=pos)
    except Exception as e:
        logger.exception("pace-tracker error")
        return JSONResponse({"error": "Failed to fetch pace tracker"}, status_code=500)


@app.get("/api/game-log")
def game_log(player_id: str = "", season: int = 0):
    """Return week-by-week box score stats for a player."""
    if not player_id:
        return JSONResponse({"error": "player_id is required"}, status_code=400)
    try:
        s = season if season > 0 else None
        return live_data.fetch_game_log(player_id=player_id, season=s)
    except Exception as e:
        logger.exception("game-log error")
        return JSONResponse({"error": "Failed to fetch game log"}, status_code=500)


@app.get("/api/streaks")
def streaks(season: int = 0, position: str = "", window: int = 4):
    """Return players on hot or cold scoring streaks."""
    try:
        s = season if season > 0 else None
        pos = position if position else None
        w = window if window > 0 else 4
        return live_data.fetch_streaks(season=s, position=pos, window=w)
    except Exception as e:
        logger.exception("streaks error")
        return JSONResponse({"error": "Failed to fetch streaks"}, status_code=500)


@app.get("/api/season-recap")
def season_recap(season: int = 0):
    """Return data-driven season recap with key storylines."""
    try:
        s = season if season > 0 else None
        return live_data.fetch_season_recap(season=s)
    except Exception as e:
        logger.exception("season-recap error")
        return JSONResponse({"error": "Failed to fetch season recap"}, status_code=500)


@app.get("/api/compare-table")
def compare_table(players: str = "", season: int = 0):
    """Return season stats for multiple players for comparison table."""
    if not players:
        return JSONResponse({"error": "players parameter is required (comma-separated IDs)"}, status_code=400)
    pids = [p.strip() for p in players.split(",") if p.strip()]
    if len(pids) < 2 or len(pids) > 8:
        return JSONResponse({"error": "Provide 2-8 player IDs"}, status_code=400)
    try:
        s = season if season > 0 else None
        return live_data.fetch_compare_table(player_ids=pids, season=s)
    except Exception as e:
        logger.exception("compare-table error")
        return JSONResponse({"error": "Failed to fetch comparison data"}, status_code=500)


@app.get("/api/records")
def records(position: str = ""):
    """Return all-time fantasy records."""
    try:
        pos = position if position else None
        return live_data.fetch_records(position=pos)
    except Exception as e:
        logger.exception("records error")
        return JSONResponse({"error": "Failed to fetch records"}, status_code=500)


@app.get("/api/workload-monitor")
def workload_monitor(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_workload_monitor(season=season, position=pos)
    except Exception as e:
        logger.exception("workload-monitor error")
        return JSONResponse({"error": "Failed to fetch workload data"}, status_code=500)


@app.get("/api/drop-rate")
def drop_rate(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_drop_rate(season=season, position=pos)
    except Exception as e:
        logger.exception("drop-rate error")
        return JSONResponse({"error": "Failed to fetch drop rate data"}, status_code=500)


@app.get("/api/success-rate")
def success_rate(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_success_rate(season=season, position=pos)
    except Exception as e:
        logger.exception("success-rate error")
        return JSONResponse({"error": "Failed to fetch success rate data"}, status_code=500)


@app.get("/api/game-script")
def game_script(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_game_script(season=season, position=pos)
    except Exception as e:
        logger.exception("game-script error")
        return JSONResponse({"error": "Failed to fetch game script data"}, status_code=500)


@app.get("/api/target-premium")
def target_premium(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_target_premium(season=season, position=pos)
    except Exception as e:
        logger.exception("target-premium error")
        return JSONResponse({"error": "Failed to fetch target premium"}, status_code=500)


@app.get("/api/season-pace")
def season_pace(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_season_pace(season=season, position=pos)
    except Exception as e:
        logger.exception("season-pace error")
        return JSONResponse({"error": "Failed to fetch season pace"}, status_code=500)


@app.get("/api/garbage-time")
def garbage_time(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_garbage_time(season=season, position=pos)
    except Exception as e:
        logger.exception("garbage-time error")
        return JSONResponse({"error": "Failed to fetch garbage time data"}, status_code=500)


@app.get("/api/snap-efficiency")
def snap_efficiency(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_snap_efficiency(season=season, position=pos)
    except Exception as e:
        logger.exception("snap-efficiency error")
        return JSONResponse({"error": "Failed to fetch snap efficiency"}, status_code=500)


@app.get("/api/dual-threat")
def dual_threat(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_dual_threat(season=season, position=pos)
    except Exception as e:
        logger.exception("dual-threat error")
        return JSONResponse({"error": "Failed to fetch dual-threat data"}, status_code=500)


@app.get("/api/positional-advantage")
def positional_advantage(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_positional_advantage(season=season, position=pos)
    except Exception as e:
        logger.exception("positional-advantage error")
        return JSONResponse({"error": "Failed to fetch positional advantage"}, status_code=500)


@app.get("/api/stacks")
def stacks(season: int = None):
    try:
        return live_data.fetch_stacks(season=season)
    except Exception as e:
        logger.exception("stacks error")
        return JSONResponse({"error": "Failed to fetch stack correlations"}, status_code=500)


@app.get("/api/weekly-mvp")
def weekly_mvp(season: int = None):
    try:
        return live_data.fetch_weekly_mvp(season=season)
    except Exception as e:
        logger.exception("weekly-mvp error")
        return JSONResponse({"error": "Failed to fetch weekly MVP data"}, status_code=500)


@app.get("/api/handcuffs")
def handcuffs(season: int = None):
    try:
        return live_data.fetch_handcuffs(season=season)
    except Exception as e:
        logger.exception("handcuffs error")
        return JSONResponse({"error": "Failed to fetch handcuff rankings"}, status_code=500)


@app.get("/api/fpts-breakdown")
def fpts_breakdown(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_fpts_breakdown(season=season, position=pos)
    except Exception as e:
        logger.exception("fpts-breakdown error")
        return JSONResponse({"error": "Failed to fetch scoring breakdown"}, status_code=500)


@app.get("/api/playoff-schedule")
def playoff_schedule(season: int = None, position: str = None):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_playoff_schedule(season=season, position=pos)
    except Exception as e:
        logger.exception("playoff-schedule error")
        return JSONResponse({"error": "Failed to fetch playoff schedule"}, status_code=500)


@app.get("/api/waivers")
def waivers(season: int = None, position: str = None, window: int = 4):
    try:
        pos = position.upper() if position else None
        return live_data.fetch_waivers(season=season, position=pos, window=window)
    except Exception as e:
        logger.exception("waivers error")
        return JSONResponse({"error": "Failed to fetch waiver targets"}, status_code=500)


@app.get("/api/tools-hub")
def tools_hub():
    """Return the static tools catalog organized by category."""
    import json as _json
    config_path = Path(__file__).parent / "config" / "tools_hub.json"
    try:
        with open(config_path, "r") as f:
            categories = _json.load(f)
    except Exception:
        categories = []
    total_tools = sum(len(c.get("tools", [])) for c in categories)
    return JSONResponse(
        content={"categories": categories, "total_tools": total_tools},
        headers={"Cache-Control": "public, max-age=3600"},
    )


# ---------------------------------------------------------------------------
# Stat Correlation Matrix
# ---------------------------------------------------------------------------

@app.get("/api/stat-correlations")
def stat_correlations(season: int = 0, position: str = "", x_stat: str = "", y_stat: str = ""):
    """Return Pearson correlation matrix between fantasy stats."""
    try:
        s = season if season > 0 else None
        pos = position.strip().upper() if position else None
        xs = x_stat.strip() if x_stat else None
        ys = y_stat.strip() if y_stat else None
        return live_data.fetch_stat_correlations(season=s, position=pos, x_stat=xs, y_stat=ys)
    except Exception as e:
        logger.exception("stat-correlations error")
        return JSONResponse({"error": "Failed to fetch stat correlations"}, status_code=500)


@app.get("/api/dynasty-power-rankings")
def dynasty_power_rankings(season: int = 0):
    try:
        s = season if season > 0 else None
        return live_data.fetch_dynasty_power_rankings(season=s)
    except Exception as e:
        logger.exception("dynasty-power-rankings error")
        return JSONResponse({"error": "Failed to fetch dynasty power rankings"}, status_code=500)


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
