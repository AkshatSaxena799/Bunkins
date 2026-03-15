from fastapi import APIRouter, HTTPException, Depends, Request, Query
from typing import Optional, List
from models.product import ProductCreate, ProductUpdate
from services.product_service import (
    create_product,
    get_products,
    get_product_by_id,
    get_product_by_slug,
    update_product,
    delete_product,
)
from middleware.auth import require_owner

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    category: Optional[str] = None,
    gender: Optional[str] = None,
    age_group: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    featured: Optional[bool] = None,
):
    result = await get_products(
        page=page,
        page_size=page_size,
        category=category,
        gender=gender,
        age_group=age_group,
        min_price=min_price,
        max_price=max_price,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        featured=featured,
    )
    return result


@router.get("/{identifier}")
async def get_single_product(identifier: str):
    # Try by ID first, then by slug
    product = await get_product_by_id(identifier)
    if not product:
        product = await get_product_by_slug(identifier)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("")
async def create_new_product(product_data: ProductCreate, request: Request):
    owner = await require_owner(request)
    product = await create_product(product_data)
    return product


@router.put("/{product_id}")
async def update_existing_product(product_id: str, product_data: ProductUpdate, request: Request):
    owner = await require_owner(request)
    product = await update_product(product_id, product_data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/{product_id}")
async def delete_existing_product(product_id: str, request: Request):
    owner = await require_owner(request)
    deleted = await delete_product(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}
