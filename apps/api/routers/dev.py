"""Dev-only endpoints for local testing — plan toggle, stack health."""

from __future__ import annotations

import sqlite3
from typing import Literal

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from ..config import get_settings
from ..services.tier import get_dev_plan_override, resolve_plan, set_dev_plan

router = APIRouter(prefix="/api/dev", tags=["dev"])


class PlanBody(BaseModel):
    plan: Literal["free", "pro", "elite"]


@router.get("/status")
def dev_status() -> dict:
    settings = get_settings()
    if settings.is_production:
        raise HTTPException(status_code=404, detail="not found")

    db_path = settings.terminal_db_path
    db: dict = {"path": str(db_path), "exists": db_path.exists()}
    if db_path.exists():
        conn = sqlite3.connect(db_path)
        try:
            db["players"] = conn.execute("SELECT COUNT(*) FROM players").fetchone()[0]
            db["size_mb"] = round(db_path.stat().st_size / 1_048_576, 1)
            for table in ("cfb_player_season_stats", "combine_data"):
                try:
                    db[table] = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
                except sqlite3.OperationalError:
                    db[table] = 0
        finally:
            conn.close()

    return {
        "environment": settings.environment,
        "plan": resolve_plan(),
        "plan_override": get_dev_plan_override(),
        "dev_plan_env": settings.dev_plan,
        "llm_configured": bool(settings.llm_api_key),
        "llm_model": settings.llm_model,
        "database": db,
        "hints": {
            "sync_data": "python scripts/sync_data.py --quick",
            "set_plan": "POST /api/dev/plan {\"plan\": \"elite\"}",
            "agents": "Set RAZZLE_LLM_API_KEY in apps/api/.env",
        },
    }


@router.get("/plan")
def get_plan() -> dict:
    settings = get_settings()
    if settings.is_production:
        raise HTTPException(status_code=404, detail="not found")
    return {"plan": resolve_plan(), "override": get_dev_plan_override()}


@router.post("/plan")
def set_plan(body: PlanBody, response: Response) -> dict:
    settings = get_settings()
    if settings.is_production:
        raise HTTPException(status_code=404, detail="not found")
    set_dev_plan(body.plan)
    response.set_cookie("razzle_plan", body.plan, httponly=False, samesite="lax")
    return {"plan": body.plan, "message": f"Dev plan set to {body.plan}. Pro panels and agents unlocked."}
