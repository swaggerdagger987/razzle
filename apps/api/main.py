"""Razzle V2 API entry point — middleware and router mounting only."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .config import get_settings
from .routers import (
    agents,
    auth,
    billing,
    bureau,
    context,
    dev,
    explore,
    health,
    intel,
    panels,
    players,
)

logger = logging.getLogger("razzle.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            environment=settings.environment,
            traces_sample_rate=0.1,
        )
    logger.info("Razzle V2 API starting up (env=%s)", settings.environment)
    yield
    logger.info("Razzle V2 API shutting down")


settings = get_settings()
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Razzle V2 API",
    version="2.0.0-alpha.1",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

allowed_origins = [settings.base_url]
if not settings.is_production:
    allowed_origins.extend(["http://localhost:3000", "http://127.0.0.1:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.include_router(health.router)
app.include_router(dev.router)
app.include_router(explore.router)
app.include_router(panels.router)
app.include_router(panels.legacy_router)
app.include_router(players.router)
app.include_router(context.router)
app.include_router(bureau.router)
app.include_router(intel.router)
app.include_router(agents.router)
app.include_router(auth.router)
app.include_router(billing.router)


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse({"error": "Internal server error"}, status_code=500)
