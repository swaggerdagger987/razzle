from pathlib import Path

import sqlalchemy as sa
from alembic import command
from alembic.config import Config

from razzle_api.config import get_settings

API_DIR = Path(__file__).resolve().parents[2]


def _alembic_config(db_url: str) -> Config:
    cfg = Config(str(API_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(API_DIR / "migrations"))
    cfg.set_main_option("sqlalchemy.url", db_url)
    return cfg


def test_upgrade_head_creates_schema(tmp_path, monkeypatch):
    db_path = tmp_path / "razzle.db"
    db_url = f"sqlite:///{db_path}"
    monkeypatch.setenv("RAZZLE_DATABASE_URL", db_url)
    get_settings.cache_clear()
    try:
        cfg = _alembic_config(db_url)
        command.upgrade(cfg, "head")

        engine = sa.create_engine(db_url)
        inspector = sa.inspect(engine)
        tables = set(inspector.get_table_names())
        assert {"players", "player_week_stats"} <= tables

        stat_columns = {c["name"] for c in inspector.get_columns("player_week_stats")}
        assert {"player_id", "season", "week", "pass_yd", "rec", "fg_made"} <= stat_columns
        engine.dispose()

        command.downgrade(cfg, "base")
        engine = sa.create_engine(db_url)
        remaining = set(sa.inspect(engine).get_table_names()) - {"alembic_version"}
        assert remaining == set()
        engine.dispose()
    finally:
        get_settings.cache_clear()
