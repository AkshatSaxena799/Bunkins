import os
import mimetypes
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime
from config import connect_db, close_db, CORS_ORIGINS
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.wishlist import router as wishlist_router
from routes.orders import router as orders_router
from routes.coupons import router as coupons_router
from routes.referrals import router as referrals_router
from routes.cms import router as cms_router
from routes.dashboard import router as dashboard_router
from routes.reviews import router as reviews_router
from routes.addresses import router as addresses_router

# Ensure Windows serves module scripts with a JavaScript MIME type.
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")

app = FastAPI(
    title="Bunkins API",
    description="D2C Ecommerce Platform for Kids Clothing",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
app.include_router(wishlist_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")
app.include_router(coupons_router, prefix="/api/v1")
app.include_router(referrals_router, prefix="/api/v1")
app.include_router(cms_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(reviews_router, prefix="/api/v1")
app.include_router(addresses_router, prefix="/api/v1")

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"


@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await close_db()


@app.get("/")
async def root():
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "message": "Bunkins API is running. Frontend build not found.",
        "hint": "Run npm --prefix frontend run build from project root.",
        "version": "1.0.0",
    }


@app.get("/api/health")
async def health():
    return {"status": "ok"}


class NewsletterSignup(BaseModel):
    email: str


@app.post("/api/v1/newsletter")
async def newsletter_signup(data: NewsletterSignup):
    from config import get_db
    db = get_db()
    existing = await db.newsletter_subscribers.find_one({"email": data.email})
    if existing:
        return {"message": "You're already subscribed! 💌"}
    await db.newsletter_subscribers.insert_one({
        "email": data.email,
        "subscribed_at": datetime.utcnow().isoformat(),
    })
    return {"message": "Welcome to the Bunkins family! 🧸"}


if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)



from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

frontend_path = os.path.join(os.path.dirname(__file__), "dist")

app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

@app.get("/")
async def root():
    return FileResponse(os.path.join(frontend_path, "index.html"))

@app.get("/{path:path}")
async def spa(path: str):
    return FileResponse(os.path.join(frontend_path, "index.html"))