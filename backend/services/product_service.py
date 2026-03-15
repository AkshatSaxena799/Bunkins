import re
from datetime import datetime
from typing import Optional, List
from config import get_db
from models.product import ProductCreate, ProductInDB, ProductUpdate, ProductResponse, ProductListResponse


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


async def create_product(product_data: ProductCreate) -> dict:
    db = get_db()
    slug = slugify(product_data.name)

    # Check for duplicate slug
    existing = await db.products.find_one({"slug": slug})
    counter = 1
    original_slug = slug
    while existing:
        slug = f"{original_slug}-{counter}"
        existing = await db.products.find_one({"slug": slug})
        counter += 1

    product = ProductInDB(
        name=product_data.name,
        slug=slug,
        description=product_data.description,
        price=product_data.price,
        images=product_data.images,
        category=product_data.category,
        gender=product_data.gender,
        age_group=product_data.age_group,
        sizes=[s.model_dump() for s in product_data.sizes],
        tags=product_data.tags,
        featured=product_data.featured,
    )

    await db.products.insert_one(product.model_dump())
    return product.model_dump()


async def get_products(
    page: int = 1,
    page_size: int = 12,
    category: Optional[str] = None,
    gender: Optional[str] = None,
    age_group: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    featured: Optional[bool] = None,
    tags: Optional[List[str]] = None,
) -> dict:
    db = get_db()
    query = {}

    if category:
        query["category"] = category
    if gender:
        query["gender"] = gender
    if age_group:
        query["age_group"] = age_group
    if featured is not None:
        query["featured"] = featured
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search.lower()]}},
        ]
    if tags:
        query["tags"] = {"$in": tags}

    sort_direction = -1 if sort_order == "desc" else 1
    sort_field = sort_by if sort_by in ["price", "created_at", "name"] else "created_at"

    total = await db.products.count_documents(query)
    skip = (page - 1) * page_size

    cursor = db.products.find(query, {"_id": 0}).sort(sort_field, sort_direction).skip(skip).limit(page_size)
    products = await cursor.to_list(length=page_size)

    return {
        "products": products,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


async def get_product_by_id(product_id: str) -> dict:
    db = get_db()
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product


async def get_product_by_slug(slug: str) -> dict:
    db = get_db()
    product = await db.products.find_one({"slug": slug}, {"_id": 0})
    return product


async def update_product(product_id: str, product_data: ProductUpdate) -> dict:
    db = get_db()
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()

    if "sizes" in update_data:
        update_data["sizes"] = [s if isinstance(s, dict) else s.model_dump() for s in update_data["sizes"]]

    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        return None

    return await get_product_by_id(product_id)


async def delete_product(product_id: str) -> bool:
    db = get_db()
    result = await db.products.delete_one({"id": product_id})
    return result.deleted_count > 0
