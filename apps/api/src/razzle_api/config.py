from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="RAZZLE_", env_file=".env", extra="ignore")

    environment: str = Field(default="local", alias="RAZZLE_ENV")
    database_url: str = "sqlite:///data/razzle.db"


@lru_cache
def get_settings() -> Settings:
    return Settings()
