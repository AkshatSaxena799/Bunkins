from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    size: str
    quantity: int
    image: str = ""


class OrderCreate(BaseModel):
    items: List[OrderItem]
    guest_email: Optional[str] = None
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None
    shipping_address: str = ""
    shipping_city: str = ""
    shipping_state: str = ""
    shipping_pincode: str = ""
    shipping_full_name: str = ""
    shipping_phone: str = ""
    coupon_code: Optional[str] = None


class OrderInDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    guest_email: Optional[str] = None
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None
    items: List[OrderItem] = []
    total_amount: float = 0
    discount_amount: float = 0
    coupon_code: Optional[str] = None
    shipping_address: str = ""
    shipping_city: str = ""
    shipping_state: str = ""
    shipping_pincode: str = ""
    shipping_full_name: str = ""
    shipping_phone: str = ""
    status: str = "pending"  # pending, confirmed, shipped, delivered, returned
    referral_applied: bool = False
    referral_reward_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class OrderResponse(BaseModel):
    id: str
    user_id: Optional[str]
    items: List[OrderItem]
    total_amount: float
    discount_amount: float
    coupon_code: Optional[str]
    status: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    shipping_full_name: str
    shipping_phone: str
    created_at: str
