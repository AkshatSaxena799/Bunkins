from datetime import datetime
import uuid
from config import get_db


async def get_wishlist(user_id: str) -> dict:
    db = get_db()
    wishlist = await db.wishlists.find_one({"user_id": user_id}, {"_id": 0})
    if not wishlist:
        wishlist = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "product_ids": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        await db.wishlists.insert_one(wishlist)
    return wishlist


async def add_to_wishlist(user_id: str, product_id: str) -> dict:
    db = get_db()
    wishlist = await get_wishlist(user_id)

    if product_id not in wishlist["product_ids"]:
        await db.wishlists.update_one(
            {"user_id": user_id},
            {
                "$addToSet": {"product_ids": product_id},
                "$set": {"updated_at": datetime.utcnow().isoformat()},
            },
        )

    return await get_wishlist(user_id)


async def remove_from_wishlist(user_id: str, product_id: str) -> dict:
    db = get_db()
    await db.wishlists.update_one(
        {"user_id": user_id},
        {
            "$pull": {"product_ids": product_id},
            "$set": {"updated_at": datetime.utcnow().isoformat()},
        },
    )
    return await get_wishlist(user_id)


async def get_wishlist_products(user_id: str) -> list:
    db = get_db()
    wishlist = await get_wishlist(user_id)
    product_ids = wishlist.get("product_ids", [])

    if not product_ids:
        return []

    cursor = db.products.find({"id": {"$in": product_ids}}, {"_id": 0})
    products = await cursor.to_list(length=100)
    return products
