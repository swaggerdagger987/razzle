"""Shared test fixtures for Razzle API tests."""

import pytest
from fastapi.testclient import TestClient

from backend.server import app
from backend import auth as auth_module


@pytest.fixture(scope="session", autouse=True)
def _clear_rate_limits():
    """Clear persistent rate limits before tests so repeated runs don't 429."""
    try:
        with auth_module.get_users_db() as conn:
            conn.execute("DELETE FROM rate_limits")
            conn.commit()
    except Exception:
        pass  # table may not exist yet


@pytest.fixture(scope="session")
def client():
    """FastAPI test client — reused across all tests in session."""
    with TestClient(app) as c:
        yield c
