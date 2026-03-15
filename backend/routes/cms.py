from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from middleware.auth import require_owner
from config import get_db
from datetime import datetime
import uuid

router = APIRouter(prefix="/cms", tags=["CMS"])


class PageCreateRequest(BaseModel):
    slug: str
    title: str
    content: str  # Markdown or HTML
    meta_description: Optional[str] = ""
    published: bool = True


class PageUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    meta_description: Optional[str] = None
    published: Optional[bool] = None


@router.get("/pages")
async def list_pages():
    """Public: list all published pages."""
    db = get_db()
    cursor = db.cms_pages.find({"published": True}, {"_id": 0}).sort("title", 1)
    pages = await cursor.to_list(length=50)
    return {"pages": pages}


@router.get("/pages/all")
async def list_all_pages(request: Request):
    """Owner: list all pages including drafts."""
    await require_owner(request)
    db = get_db()
    cursor = db.cms_pages.find({}, {"_id": 0}).sort("updated_at", -1)
    pages = await cursor.to_list(length=50)
    return {"pages": pages}


@router.get("/pages/{slug}")
async def get_page(slug: str):
    """Public: get a specific page by slug."""
    db = get_db()
    page = await db.cms_pages.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.post("/pages")
async def create_page(data: PageCreateRequest, request: Request):
    await require_owner(request)
    db = get_db()

    existing = await db.cms_pages.find_one({"slug": data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Page with this slug already exists")

    page = {
        "id": str(uuid.uuid4()),
        "slug": data.slug,
        "title": data.title,
        "content": data.content,
        "meta_description": data.meta_description or "",
        "published": data.published,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }

    await db.cms_pages.insert_one(page)
    page.pop("_id", None)
    return page


@router.put("/pages/{page_id}")
async def update_page(page_id: str, data: PageUpdateRequest, request: Request):
    await require_owner(request)
    db = get_db()

    update = {"updated_at": datetime.utcnow().isoformat()}
    if data.title is not None:
        update["title"] = data.title
    if data.content is not None:
        update["content"] = data.content
    if data.meta_description is not None:
        update["meta_description"] = data.meta_description
    if data.published is not None:
        update["published"] = data.published

    result = await db.cms_pages.update_one({"id": page_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")

    page = await db.cms_pages.find_one({"id": page_id}, {"_id": 0})
    return page


@router.delete("/pages/{page_id}")
async def delete_page(page_id: str, request: Request):
    await require_owner(request)
    db = get_db()
    result = await db.cms_pages.delete_one({"id": page_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page deleted"}
