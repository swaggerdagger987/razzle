"""
Razzle API server — thin FastAPI layer over SQLite.
All data queries live in live_data.py.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import uvicorn

from . import live_data

app = FastAPI(title="Razzle API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"


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
    season: int = 0,
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


@app.get("/api/players/{player_id}/weeks")
def player_weeks(player_id: str, season: int = 0):
    return live_data.fetch_player_weeks(player_id, season=season)


@app.get("/api/players/compare")
def players_compare(ids: str = "", season: int = 0):
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


@app.get("/api/prospect-options")
def prospect_options():
    return live_data.fetch_prospect_years()


# ---------------------------------------------------------------------------
# Serve frontend as static files (catch-all for SPA-like behavior)
# ---------------------------------------------------------------------------

if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main():
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
