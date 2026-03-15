from fastapi import APIRouter, HTTPException, Request
from services.wishlist_service import (
    get_wishlist,
    add_to_wishlist,
    remove_from_wishlist,
    get_wishlist_products,
)
from middleware.auth import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("")
async def get_user_wishlist(request: Request):
    user = await get_current_user(request)
    products = await get_wishlist_products(user["user_id"])
    wishlist = await get_wishlist(user["user_id"])
    return {"products": products, "product_ids": wishlist["product_ids"]}


@router.post("/{product_id}")
async def add_product_to_wishlist(product_id: str, request: Request):
    user = await get_current_user(request)
    wishlist = await add_to_wishlist(user["user_id"], product_id)
    return {"message": "Added to wishlist", "product_ids": wishlist["product_ids"]}


@router.delete("/{product_id}")
async def remove_product_from_wishlist(product_id: str, request: Request):
    user = await get_current_user(request)
    wishlist = await remove_from_wishlist(user["user_id"], product_id)
    return {"message": "Removed from wishlist", "product_ids": wishlist["product_ids"]}
