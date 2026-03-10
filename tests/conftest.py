"""Shared test fixtures for Razzle API tests."""

import pytest
from fastapi.testclient import TestClient

from backend.server import app


@pytest.fixture(scope="session")
def client():
    """FastAPI test client — reused across all tests in session."""
    with TestClient(app) as c:
        yield c
