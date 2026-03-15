from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from models.order import OrderCreate, OrderInDB
from middleware.auth import get_current_user, get_optional_user
from config import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("")
async def create_order(order_data: OrderCreate, request: Request):
    db = get_db()
    user = await get_optional_user(request)

    # Calculate totals
    total = sum(item.price * item.quantity for item in order_data.items)
    discount = 0

    # Validate coupon if provided
    if order_data.coupon_code:
        coupon = await db.coupons.find_one({"code": order_data.coupon_code, "active": True})
        if coupon:
            if coupon["type"] == "percentage":
                discount = min(total * coupon["value"] / 100, coupon.get("max_discount", total))
            elif coupon["type"] == "fixed":
                discount = min(coupon["value"], total)

    order = OrderInDB(
        user_id=user["user_id"] if user else None,
        guest_email=order_data.guest_email,
        guest_name=order_data.guest_name,
        guest_phone=order_data.guest_phone,
        items=[item.model_dump() for item in order_data.items],
        total_amount=total - discount,
        discount_amount=discount,
        coupon_code=order_data.coupon_code,
        shipping_address=order_data.shipping_address,
        shipping_city=order_data.shipping_city,
        shipping_state=order_data.shipping_state,
        shipping_pincode=order_data.shipping_pincode,
        shipping_full_name=order_data.shipping_full_name,
        shipping_phone=order_data.shipping_phone,
    )

    await db.orders.insert_one(order.model_dump())

    # Persist shipping address to saved addresses for authenticated users.
    if user and order_data.shipping_address and order_data.shipping_city and order_data.shipping_state and order_data.shipping_pincode:
        existing = await db.addresses.find_one({
            "user_id": user["user_id"],
            "address_line": order_data.shipping_address,
            "city": order_data.shipping_city,
            "state": order_data.shipping_state,
            "pincode": order_data.shipping_pincode,
            "full_name": order_data.shipping_full_name,
            "phone": order_data.shipping_phone,
        })
        if not existing:
            import uuid as _uuid
            has_any = await db.addresses.count_documents({"user_id": user["user_id"]}) > 0
            await db.addresses.insert_one({
                "id": str(_uuid.uuid4()),
                "user_id": user["user_id"],
                "full_name": order_data.shipping_full_name,
                "phone": order_data.shipping_phone,
                "address_line": order_data.shipping_address,
                "city": order_data.shipping_city,
                "state": order_data.shipping_state,
                "pincode": order_data.shipping_pincode,
                "is_default": not has_any,
                "created_at": datetime.utcnow().isoformat(),
            })

    return order.model_dump()


@router.get("")
async def list_orders(request: Request):
    db = get_db()
    user = await get_current_user(request)

    if user["role"] == "owner":
        cursor = db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(100)
    else:
        cursor = db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1)

    orders = await cursor.to_list(length=100)
    return {"orders": orders}


@router.get("/{order_id}")
async def get_order(order_id: str, request: Request):
    db = get_db()
    user = await get_current_user(request)

    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only allow order owner or admin to see order
    if user["role"] != "owner" and order.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return order


@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, request: Request):
    db = get_db()
    owner = await get_current_user(request)
    if owner["role"] != "owner":
        raise HTTPException(status_code=403, detail="Owner access required")

    body = await request.json()
    new_status = body.get("status")
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "returned"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": new_status}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"message": f"Order status updated to {new_status}"}
