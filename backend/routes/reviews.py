from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_user, get_optional_user
from config import get_db
from datetime import datetime
import uuid

router = APIRouter(prefix="/reviews", tags=["Reviews"])


class ReviewCreate(BaseModel):
    product_id: str
    rating: int  # 1-5
    title: Optional[str] = ""
    comment: Optional[str] = ""


@router.get("/{product_id}")
async def get_reviews(product_id: str):
    """Public: get all reviews for a product."""
    db = get_db()
    cursor = db.reviews.find(
        {"product_id": product_id},
        {"_id": 0}
    ).sort("created_at", -1)
    reviews = await cursor.to_list(length=50)

    # Calculate average
    total = len(reviews)
    avg_rating = sum(r["rating"] for r in reviews) / total if total > 0 else 0

    return {
        "reviews": reviews,
        "total": total,
        "average_rating": round(avg_rating, 1),
    }


@router.post("")
async def create_review(data: ReviewCreate, request: Request):
    """Auth required: create a review."""
    user = await get_current_user(request)
    db = get_db()

    # Check if user already reviewed this product
    existing = await db.reviews.find_one({
        "product_id": data.product_id,
        "user_id": user["user_id"],
    })
    if existing:
        raise HTTPException(status_code=400, detail="You've already reviewed this product")

    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    review = {
        "id": str(uuid.uuid4()),
        "product_id": data.product_id,
        "user_id": user["user_id"],
        "user_name": user.get("full_name", user.get("email", "Customer")),
        "rating": data.rating,
        "title": data.title or "",
        "comment": data.comment or "",
        "created_at": datetime.utcnow().isoformat(),
    }

    await db.reviews.insert_one(review)
    review.pop("_id", None)
    return review


@router.delete("/{review_id}")
async def delete_review(review_id: str, request: Request):
    """Owner or review author can delete."""
    user = await get_current_user(request)
    db = get_db()

    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if user["role"] != "owner" and review["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.reviews.delete_one({"id": review_id})
    return {"message": "Review deleted"}
