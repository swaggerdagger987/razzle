from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from razzle_api.api.routers.health import router as health_router
from razzle_api.api.routers.scoring import router as scoring_router
from razzle_api.api.routers.valuation import router as valuation_router
from razzle_api.config import get_settings
from razzle_api.core.logging import configure_logging


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.environment)
    app = FastAPI(title="Razzle API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router)
    app.include_router(scoring_router)
    app.include_router(valuation_router)
    return app


app = create_app()
