from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_user, require_owner, get_optional_user
from config import get_db
from datetime import datetime
import uuid

router = APIRouter(prefix="/coupons", tags=["Coupons"])


class CouponValidateRequest(BaseModel):
    code: str
    order_total: float = 0


class CouponCreateRequest(BaseModel):
    code: str
    type: str  # percentage, fixed
    value: float
    min_order_value: float = 0
    max_discount: float = 0
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    usage_limit: int = 100
    user_specific: bool = False
    active: bool = True


@router.post("/validate")
async def validate_coupon(data: CouponValidateRequest, request: Request):
    db = get_db()
    coupon = await db.coupons.find_one({"code": data.code}, {"_id": 0})

    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")

    if not coupon.get("active", False):
        raise HTTPException(status_code=400, detail="This coupon is no longer active")

    # Check usage limit
    if coupon.get("usage_count", 0) >= coupon.get("usage_limit", 100):
        raise HTTPException(status_code=400, detail="This coupon has reached its usage limit")

    # Check validity dates
    now = datetime.utcnow().isoformat()
    if coupon.get("valid_from") and now < coupon["valid_from"]:
        raise HTTPException(status_code=400, detail="This coupon is not yet valid")
    if coupon.get("valid_until") and now > coupon["valid_until"]:
        raise HTTPException(status_code=400, detail="This coupon has expired")

    # Check minimum order value
    if data.order_total < coupon.get("min_order_value", 0):
        min_val = coupon.get("min_order_value", 0)
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order value of ₹{min_val} required for this coupon"
        )

    # Calculate discount
    discount = 0
    if coupon["type"] == "percentage":
        discount = data.order_total * coupon["value"] / 100
        if coupon.get("max_discount"):
            discount = min(discount, coupon["max_discount"])
    elif coupon["type"] == "fixed":
        discount = min(coupon["value"], data.order_total)

    return {
        "valid": True,
        "code": coupon["code"],
        "type": coupon["type"],
        "value": coupon["value"],
        "discount": round(discount, 2),
        "message": f"Coupon applied! You save ₹{round(discount, 2)}",
    }


@router.get("")
async def list_coupons(request: Request):
    db = get_db()
    owner = await require_owner(request)
    cursor = db.coupons.find({}, {"_id": 0}).sort("created_at", -1)
    coupons = await cursor.to_list(length=100)
    return {"coupons": coupons}


@router.post("")
async def create_coupon(data: CouponCreateRequest, request: Request):
    db = get_db()
    owner = await require_owner(request)

    existing = await db.coupons.find_one({"code": data.code})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    coupon = {
        "id": str(uuid.uuid4()),
        "code": data.code.upper(),
        "type": data.type,
        "value": data.value,
        "min_order_value": data.min_order_value,
        "max_discount": data.max_discount,
        "valid_from": data.valid_from or datetime.utcnow().isoformat(),
        "valid_until": data.valid_until or "2030-12-31T23:59:59",
        "usage_limit": data.usage_limit,
        "usage_count": 0,
        "user_specific": data.user_specific,
        "active": data.active,
    }

    await db.coupons.insert_one(coupon)
    return coupon


@router.delete("/{coupon_id}")
async def delete_coupon(coupon_id: str, request: Request):
    db = get_db()
    owner = await require_owner(request)
    result = await db.coupons.delete_one({"id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted"}
