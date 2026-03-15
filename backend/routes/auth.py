from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from models.user import UserCreate, UserLogin
from services.auth_service import (
    register_user, login_user, get_user_by_id,
    update_user_profile, send_phone_otp, verify_phone_otp,
)
from middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    avatar: Optional[str] = None


class SendOtpRequest(BaseModel):
    phone: str


class VerifyOtpRequest(BaseModel):
    phone: str
    code: str


@router.post("/register")
async def register(user_data: UserCreate):
    result = await register_user(user_data)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/login")
async def login(user_data: UserLogin):
    result = await login_user(user_data.email, user_data.password)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return result


@router.get("/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    user_data = await get_user_by_id(user["user_id"])
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return user_data


@router.patch("/me")
async def update_profile(data: UpdateProfileRequest, request: Request):
    user = await get_current_user(request)
    result = await update_user_profile(user["user_id"], data.full_name, data.avatar)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/send-phone-otp")
async def api_send_phone_otp(data: SendOtpRequest, request: Request):
    user = await get_current_user(request)
    result = await send_phone_otp(user["user_id"], data.phone)
    return result


@router.post("/verify-phone-otp")
async def api_verify_phone_otp(data: VerifyOtpRequest, request: Request):
    user = await get_current_user(request)
    result = await verify_phone_otp(user["user_id"], data.phone, data.code)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
