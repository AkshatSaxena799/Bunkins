from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_user, get_optional_user
from config import get_db
from datetime import datetime
import uuid

router = APIRouter(prefix="/referrals", tags=["Referrals"])


class ApplyReferralRequest(BaseModel):
    referral_code: str


@router.get("/my-code")
async def get_my_referral_code(request: Request):
    """Get the current user's referral code."""
    db = get_db()
    user = await get_current_user(request)
    user_doc = await db.users.find_one({"id": user["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "referral_code": user_doc.get("referral_code"),
        "share_message": f"Use my code {user_doc.get('referral_code')} on Bunkins and we both get ₹100 off! 🧸",
    }


@router.get("/stats")
async def get_referral_stats(request: Request):
    """Get referral stats for the current user."""
    db = get_db()
    user = await get_current_user(request)

    # Count referrals made by this user
    referrals = await db.referrals.find(
        {"referrer_id": user["user_id"]}
    ).to_list(length=100)

    total_referrals = len(referrals)
    successful = [r for r in referrals if r.get("referrer_reward_status") == "credited"]
    pending = [r for r in referrals if r.get("referrer_reward_status") == "pending"]

    total_earned = len(successful) * 100  # ₹100 per referral

    # Get user's referral code
    user_doc = await db.users.find_one({"id": user["user_id"]})

    return {
        "referral_code": user_doc.get("referral_code", ""),
        "total_referrals": total_referrals,
        "successful_referrals": len(successful),
        "pending_referrals": len(pending),
        "total_earned": total_earned,
        "reward_per_referral": 100,
    }


@router.post("/apply")
async def apply_referral(data: ApplyReferralRequest, request: Request):
    """Apply a referral code to get ₹100 discount. Returns discount info."""
    db = get_db()
    user = await get_optional_user(request)

    # Find the referrer by code
    referrer = await db.users.find_one({"referral_code": data.referral_code})
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")

    # Can't refer yourself
    if user and referrer["id"] == user["user_id"]:
        raise HTTPException(status_code=400, detail="You cannot use your own referral code")

    # Check if user already used a referral (if authenticated)
    if user:
        user_doc = await db.users.find_one({"id": user["user_id"]})
        if user_doc and user_doc.get("referred_by"):
            raise HTTPException(status_code=400, detail="You have already used a referral code")

    return {
        "valid": True,
        "discount": 100,
        "referrer_name": referrer.get("full_name", "A friend"),
        "message": "Referral applied! You get ₹100 off on this order 🎉",
    }


@router.post("/complete")
async def complete_referral(request: Request):
    """Called after order is placed with referral. Creates referral record."""
    db = get_db()
    body = await request.json()

    referral_code = body.get("referral_code")
    order_id = body.get("order_id")
    referee_id = body.get("referee_id")

    if not referral_code or not order_id:
        raise HTTPException(status_code=400, detail="Missing referral_code or order_id")

    referrer = await db.users.find_one({"referral_code": referral_code})
    if not referrer:
        return {"message": "Referral code not found, skipping"}

    referral = {
        "id": str(uuid.uuid4()),
        "referrer_id": referrer["id"],
        "referee_id": referee_id,
        "order_id": order_id,
        "referrer_reward_status": "pending",
        "referee_reward_status": "credited",
        "created_at": datetime.utcnow().isoformat(),
    }

    await db.referrals.insert_one(referral)

    # Mark referee as referred
    if referee_id:
        await db.users.update_one(
            {"id": referee_id},
            {"$set": {"referred_by": referrer["id"]}}
        )

    return {"message": "Referral recorded successfully", "referral_id": referral["id"]}
