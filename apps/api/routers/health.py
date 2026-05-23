"""Health check router."""

from __future__ import annotations

from fastapi import APIRouter

from ..config import get_settings

router = APIRouter(tags=["health"])

API_VERSION = "2.0.0-alpha.1"


@router.get("/api/health")
def health() -> dict:
    settings = get_settings()
    return {"status": "ok", "version": API_VERSION, "environment": settings.environment}
