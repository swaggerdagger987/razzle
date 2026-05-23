"""Razzle V2 settings.

Centralized configuration. Reads from environment first, then `.env` for
local dev. Validates at import time so a misconfigured deploy fails fast
instead of silently degrading later.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = Field("development", alias="ENVIRONMENT")
    base_url: str = Field("http://localhost:3000", alias="RAZZLE_BASE_URL")
    context_ttl_seconds: int = Field(300, alias="CONTEXT_TTL_SECONDS")
    dev_plan: str | None = Field(None, alias="DEV_PLAN")  # free | pro | elite — local testing

    jwt_secret: str = Field("dev-only-replace-me", alias="JWT_SECRET")
    encryption_key: str | None = Field(None, alias="ENCRYPTION_KEY")

    # Stripe
    stripe_secret_key: str | None = Field(None, alias="STRIPE_SECRET_KEY")
    stripe_webhook_secret: str | None = Field(None, alias="STRIPE_WEBHOOK_SECRET")
    stripe_price_pro_yearly: str | None = Field(None, alias="STRIPE_PRICE_PRO_YEARLY")

    # LLM
    llm_api_key: str | None = Field(None, alias="RAZZLE_LLM_API_KEY")
    llm_base_url: str = Field("https://openrouter.ai/api/v1", alias="RAZZLE_LLM_BASE_URL")
    llm_model: str = Field("anthropic/claude-3.5-haiku", alias="RAZZLE_LLM_MODEL")

    # Observability
    sentry_dsn: str | None = Field(None, alias="SENTRY_DSN")
    posthog_project_api_key: str | None = Field(None, alias="POSTHOG_PROJECT_API_KEY")

    # Reddit
    reddit_client_id: str | None = Field(None, alias="REDDIT_CLIENT_ID")
    reddit_client_secret: str | None = Field(None, alias="REDDIT_CLIENT_SECRET")
    reddit_user_agent: str = Field("razzle:!razzle-bot:v2", alias="REDDIT_USER_AGENT")
    reddit_username: str | None = Field(None, alias="REDDIT_USERNAME")
    reddit_password: str | None = Field(None, alias="REDDIT_PASSWORD")

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def data_dir(self) -> Path:
        # Production: persistent disk mount; dev: repo-local data/
        return Path("/data") if self.is_production else Path(__file__).resolve().parent.parent.parent / "data"

    @property
    def terminal_db_path(self) -> Path:
        return self.data_dir / "terminal.db"

    @property
    def users_db_path(self) -> Path:
        return self.data_dir / "users.db"


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    if s.is_production and s.jwt_secret == "dev-only-replace-me":
        raise RuntimeError("JWT_SECRET must be set in production")
    return s
