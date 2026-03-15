from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    referral_code: str
    created_at: str
    phone: Optional[str] = None
    avatar: Optional[str] = None


class UserInDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    hashed_password: str
    full_name: str
    role: str = "user"
    oauth_provider: Optional[str] = None
    oauth_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    referral_code: str = Field(default_factory=lambda: f"BUNKINS-{uuid.uuid4().hex[:6].upper()}")
    referred_by: Optional[str] = None
    referral_reward_claimed: bool = False
    welcome_seen: bool = False
    phone: Optional[str] = None
    avatar: Optional[str] = None
    phone_otp: Optional[str] = None
    phone_otp_expiry: Optional[str] = None
    phone_pending: Optional[str] = None
