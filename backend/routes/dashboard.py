from fastapi import APIRouter, Request
from middleware.auth import require_owner
from config import get_db
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(request: Request):
    """Owner: get dashboard statistics."""
    await require_owner(request)
    db = get_db()

    # Count totals
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({"role": "user"})

    # Revenue
    pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(length=1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    # Orders by status
    status_pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_results = await db.orders.aggregate(status_pipeline).to_list(length=10)
    orders_by_status = {item["_id"]: item["count"] for item in status_results}

    # Recent orders (last 10)
    recent_orders = await db.orders.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(length=10)

    # Top products by order count
    top_pipeline = [
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.product_id",
            "name": {"$first": "$items.name"},
            "total_sold": {"$sum": "$items.quantity"},
            "total_revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}},
        }},
        {"$sort": {"total_sold": -1}},
        {"$limit": 5},
    ]
    top_products = await db.orders.aggregate(top_pipeline).to_list(length=5)

    # Daily revenue for last 7 days
    seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
    daily_pipeline = [
        {"$match": {"created_at": {"$gte": seven_days_ago}}},
        {"$group": {
            "_id": {"$substr": ["$created_at", 0, 10]},
            "revenue": {"$sum": "$total_amount"},
            "orders": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    daily_stats = await db.orders.aggregate(daily_pipeline).to_list(length=7)

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_revenue": total_revenue,
        "orders_by_status": orders_by_status,
        "recent_orders": recent_orders,
        "top_products": top_products,
        "daily_stats": daily_stats,
    }
