"""
Razzle API server — thin FastAPI layer over SQLite.
All data queries live in live_data.py.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from pathlib import Path
import logging
import uvicorn

from . import live_data

logger = logging.getLogger("razzle")


def bootstrap_database():
    """Sync nflverse + college data if the DB is empty or missing."""
    import sys, os
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from adapters.nflverse_adapter import (
        get_connection, initialize_database, process_season, current_nfl_season,
    )
    from adapters.college_adapter import (
        get_connection as college_conn,
        initialize_tables as college_init_tables,
        process_combine, process_draft_picks,
    )

    conn = get_connection()
    initialize_database(conn)

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
    else:
        logger.info(f"Database has {count} players — skipping bootstrap")
        conn.close()


@asynccontextmanager
async def lifespan(app):
    bootstrap_database()
    yield


app = FastAPI(title="Razzle API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    return live_data.get_filter_options()


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


@app.get("/api/prospect-options")
def prospect_options():
    return live_data.fetch_prospect_years()


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
