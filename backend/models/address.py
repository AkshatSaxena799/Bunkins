from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime


class AddressCreate(BaseModel):
    full_name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str
    is_default: bool = False


class AddressInDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    full_name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str
    is_default: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
