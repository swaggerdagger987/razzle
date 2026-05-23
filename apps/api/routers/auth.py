"""Auth router — register / login / link-sleeper / password reset.

Logic lives in apps/api/services/auth.py (the V2-cleaned port of legacy
backend/auth.py). The router only handles HTTP concerns.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

from ..services import auth as auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LinkSleeperRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)


@router.post("/register")
def register(body: RegisterRequest, request: Request) -> dict:
    return auth_service.register(email=body.email, password=body.password)


@router.post("/login")
def login(body: LoginRequest) -> dict:
    return auth_service.login(email=body.email, password=body.password)


@router.get("/me")
def me(user: dict = Depends(auth_service.require_user)) -> dict:
    return {"user": user}


@router.post("/link-sleeper")
def link_sleeper(body: LinkSleeperRequest, user: dict = Depends(auth_service.require_user)) -> dict:
    return auth_service.link_sleeper(user_id=user["id"], username=body.username)


@router.post("/forgot-password")
def forgot_password(body: LoginRequest) -> dict:
    return auth_service.start_password_reset(email=body.email)
