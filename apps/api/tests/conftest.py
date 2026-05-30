"""Pytest fixtures for the V2 API."""

from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def app_client():
    os.environ.setdefault("ENVIRONMENT", "development")
    os.environ.setdefault("JWT_SECRET", "test-secret")
    # Import after env is set so config picks it up
    from apps.api.main import app
    return TestClient(app)
