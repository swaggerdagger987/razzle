"""Auth service — thin facade over legacy backend.auth."""

from __future__ import annotations

import logging

import jwt
from fastapi import HTTPException, Request

from ..config import get_settings
from ..legacy_bridge import auth as legacy_auth

logger = logging.getLogger("razzle.services.auth")


def register(email: str, password: str) -> dict:
    auth = legacy_auth()
    try:
        return auth.register_user(email=email, password=password)
    except auth.AuthError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


def login(email: str, password: str) -> dict:
    auth = legacy_auth()
    try:
        return auth.login_user(email=email, password=password)
    except auth.AuthError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


def link_sleeper(user_id: int, username: str) -> dict:
    auth = legacy_auth()
    try:
        return auth.link_sleeper_username(user_id=user_id, username=username)
    except auth.AuthError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


def start_password_reset(email: str) -> dict:
    auth = legacy_auth()
    return {"ok": auth.start_password_reset(email=email)}


def require_user(request: Request) -> dict:
    settings = get_settings()
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    token = header.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"invalid token: {e}") from e
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="invalid token payload")
    auth = legacy_auth()
    user = auth.get_user_by_id(int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="user not found")
    return user
