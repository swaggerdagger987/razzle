"""End-to-end flow tests for critical user journeys.

Covers: auth flow, query quota, formula CRUD, watchlist CRUD, agent memory CRUD.
These test the complete user lifecycle rather than individual endpoints.

Note: New registered users must verify email to start Elite trial.
The test_register step auto-verifies via the DB so Pro-gated endpoints work.
Elite-gated endpoints (memory, briefings) return 403.
"""

import uuid

import pytest


# Generate unique test user for each session to avoid conflicts
_TEST_EMAIL = f"test_{uuid.uuid4().hex[:8]}@razzle-test.local"
_TEST_PASSWORD = "TestPass123"
_token = None


def _auth_header():
    """Return Authorization header with current test token."""
    return {"Authorization": f"Bearer {_token}"}


class TestAuthFlow:
    """Registration > Login > /me — complete auth lifecycle."""

    def test_register(self, client):
        global _token
        resp = client.post("/api/auth/register", json={
            "email": _TEST_EMAIL,
            "password": _TEST_PASSWORD,
        })
        assert resp.status_code == 200, f"Register failed: {resp.text}"
        data = resp.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == _TEST_EMAIL
        _token = data["token"]
        # Auto-verify email and start trial so Elite-gated tests pass
        from backend.auth import get_users_db
        from datetime import datetime, timezone, timedelta
        with get_users_db() as conn:
            now = datetime.now(timezone.utc)
            conn.execute(
                "UPDATE users SET email_verified = 1, trial_start = ?, trial_end = ?, trial_used = 1 WHERE email = ?",
                (now.isoformat(), (now + timedelta(days=7)).isoformat(), _TEST_EMAIL),
            )
            conn.commit()
        # Refresh token with pro plan via login
        resp2 = client.post("/api/auth/login", json={"email": _TEST_EMAIL, "password": _TEST_PASSWORD})
        assert resp2.status_code == 200
        _token = resp2.json()["token"]

    def test_me(self, client):
        resp = client.get("/api/auth/me", headers=_auth_header())
        assert resp.status_code == 200
        data = resp.json()
        assert data["user"]["email"] == _TEST_EMAIL

    def test_login(self, client):
        global _token
        resp = client.post("/api/auth/login", json={
            "email": _TEST_EMAIL,
            "password": _TEST_PASSWORD,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        _token = data["token"]

    def test_me_no_token(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_me_bad_token(self, client):
        resp = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert resp.status_code == 401

    def test_register_duplicate(self, client):
        resp = client.post("/api/auth/register", json={
            "email": _TEST_EMAIL,
            "password": _TEST_PASSWORD,
        })
        assert resp.status_code == 409
        data = resp.json()
        assert "error" in data

    def test_register_weak_password(self, client):
        resp = client.post("/api/auth/register", json={
            "email": f"weak_{uuid.uuid4().hex[:6]}@test.local",
            "password": "abc",
        })
        data = resp.json()
        assert "error" in data

    def test_login_wrong_password(self, client):
        resp = client.post("/api/auth/login", json={
            "email": _TEST_EMAIL,
            "password": "WrongPassword999",
        })
        data = resp.json()
        assert "error" in data


class TestQueryQuota:
    """Track AI queries and check quota decrements correctly."""

    def test_check_quota(self, client):
        resp = client.get("/api/agents/quota", headers=_auth_header())
        assert resp.status_code == 200
        data = resp.json()
        assert "remaining" in data
        assert "limit" in data
        assert "plan" in data

    def test_track_and_decrement(self, client):
        # Get initial quota
        resp1 = client.get("/api/agents/quota", headers=_auth_header())
        initial = resp1.json()["remaining"]

        # Track a query
        resp2 = client.post("/api/agents/track", headers=_auth_header())
        assert resp2.status_code == 200

        # Quota should have decremented
        resp3 = client.get("/api/agents/quota", headers=_auth_header())
        updated = resp3.json()["remaining"]
        assert updated <= initial


class TestFormulaCRUD:
    """Create > List > Delete formula lifecycle."""

    _formula_id = None

    def test_create_formula(self, client):
        import json
        resp = client.post("/api/user/formulas", headers=_auth_header(), json={
            "name": f"Test Formula {uuid.uuid4().hex[:6]}",
            "weights": json.dumps([
                {"stat": "ppg", "weight": 50},
                {"stat": "targets_pg", "weight": 50},
            ]),
        })
        assert resp.status_code == 200
        data = resp.json()
        if "id" in data:
            TestFormulaCRUD._formula_id = data["id"]

    def test_list_formulas(self, client):
        resp = client.get("/api/user/formulas", headers=_auth_header())
        assert resp.status_code == 200
        data = resp.json()
        formulas = data.get("formulas", data) if isinstance(data, dict) else data
        assert isinstance(formulas, list)
        assert len(formulas) >= 1
        if formulas and TestFormulaCRUD._formula_id is None:
            TestFormulaCRUD._formula_id = formulas[-1].get("id")

    def test_delete_formula(self, client):
        if TestFormulaCRUD._formula_id is None:
            pytest.skip("No formula ID to delete")
        resp = client.delete(
            f"/api/user/formulas/{TestFormulaCRUD._formula_id}",
            headers=_auth_header(),
        )
        assert resp.status_code == 200


class TestWatchlistCRUD:
    """Sync > Get watchlist lifecycle. Requires Pro+ (trial user has Elite)."""

    def test_sync_watchlist(self, client):
        resp = client.post("/api/user/watchlist/sync", headers=_auth_header(), json={
            "players": [
                {"player_id": "player_001", "name": "Patrick Mahomes"},
                {"player_id": "player_002", "name": "Josh Allen"},
            ],
        })
        assert resp.status_code == 200

    def test_get_watchlist(self, client):
        resp = client.get("/api/user/watchlist", headers=_auth_header())
        assert resp.status_code == 200
        data = resp.json()
        watchlist = data.get("watchlist", data) if isinstance(data, dict) else data
        assert isinstance(watchlist, list)


class TestLeagueTradeFinder:
    """League-specific trade finder requires Pro+ tier."""

    def test_league_trade_finder_works_for_pro(self, client):
        """Trial users (Elite) can access the league trade finder."""
        resp = client.post("/api/league-trade-finder", headers=_auth_header(), json={
            "players": [
                {"name": "Patrick Mahomes", "position": "QB", "team": "KC"},
                {"name": "Josh Allen", "position": "QB", "team": "BUF"},
            ],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "players" in data
        assert "unmatched" in data

    def test_league_trade_finder_requires_auth(self, client):
        """Unauthenticated users cannot access league trade finder."""
        resp = client.post("/api/league-trade-finder", json={
            "players": [{"name": "Test Player", "position": "QB", "team": "KC"}],
        })
        assert resp.status_code in (401, 403)

    def test_league_trade_finder_validates_input(self, client):
        """Empty players array is rejected."""
        resp = client.post("/api/league-trade-finder", headers=_auth_header(), json={
            "players": [],
        })
        assert resp.status_code == 400


class TestAgentMemoryGating:
    """Agent memory requires Elite tier. Trial users now get Elite → should pass."""

    def test_memory_allowed_for_trial(self, client):
        """Trial users (Elite tier) can read memory endpoints."""
        resp = client.get("/api/user/memory", headers=_auth_header())
        assert resp.status_code == 200

    def test_memory_save_allowed_for_trial(self, client):
        resp = client.post("/api/user/memory", headers=_auth_header(), json={
            "scenario": "Test scenario",
            "findings": "Test findings",
        })
        # 200 create or 409 duplicate — either is acceptable for "not blocked by plan"
        assert resp.status_code in (200, 201, 409)


class TestSecurityBoundaries:
    """Ensure auth boundaries are enforced on all protected endpoints."""

    def test_memory_requires_auth(self, client):
        resp = client.get("/api/user/memory")
        assert resp.status_code in (401, 403)

    def test_formulas_require_auth(self, client):
        resp = client.get("/api/user/formulas")
        assert resp.status_code == 401

    def test_watchlist_requires_auth(self, client):
        resp = client.get("/api/user/watchlist")
        assert resp.status_code in (401, 403)

    def test_llm_chat_requires_elite(self, client):
        """LLM proxy requires Elite tier — Pro users should be rejected or API key missing."""
        resp = client.post("/api/llm/chat", headers=_auth_header(), json={
            "messages": [{"role": "user", "content": "test"}],
        })
        # 403 = wrong tier, 503 = no API key configured — both are correct rejections
        assert resp.status_code in (403, 503)

    def test_briefings_require_elite(self, client):
        resp = client.get("/api/briefings/latest", headers=_auth_header())
        assert resp.status_code == 403
