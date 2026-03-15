from fastapi import APIRouter, HTTPException, Request
from models.address import AddressCreate, AddressInDB
from middleware.auth import get_current_user
from config import get_db

router = APIRouter(prefix="/addresses", tags=["Addresses"])


@router.get("")
async def get_addresses(request: Request):
    user = await get_current_user(request)
    db = get_db()
    addresses = await db.addresses.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("is_default", -1).to_list(20)
    return {"addresses": addresses}


@router.post("")
async def create_address(data: AddressCreate, request: Request):
    user = await get_current_user(request)
    db = get_db()
    count = await db.addresses.count_documents({"user_id": user["user_id"]})
    # First address is always default; or explicitly requested
    is_default = data.is_default or count == 0
    if is_default:
        await db.addresses.update_many(
            {"user_id": user["user_id"]}, {"$set": {"is_default": False}}
        )
    address = AddressInDB(
        user_id=user["user_id"],
        full_name=data.full_name,
        phone=data.phone,
        address_line=data.address_line,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        is_default=is_default,
    )
    await db.addresses.insert_one(address.model_dump())
    return address.model_dump()


@router.put("/{address_id}")
async def update_address(address_id: str, data: AddressCreate, request: Request):
    user = await get_current_user(request)
    db = get_db()
    existing = await db.addresses.find_one({"id": address_id, "user_id": user["user_id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")
    if data.is_default:
        await db.addresses.update_many(
            {"user_id": user["user_id"]}, {"$set": {"is_default": False}}
        )
    await db.addresses.update_one({"id": address_id}, {"$set": data.model_dump()})
    updated = await db.addresses.find_one({"id": address_id}, {"_id": 0})
    return updated


@router.delete("/{address_id}")
async def delete_address(address_id: str, request: Request):
    user = await get_current_user(request)
    db = get_db()
    existing = await db.addresses.find_one({"id": address_id, "user_id": user["user_id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")
    await db.addresses.delete_one({"id": address_id})
    # If the deleted address was default, promote the next one
    if existing.get("is_default"):
        next_addr = await db.addresses.find_one({"user_id": user["user_id"]})
        if next_addr:
            await db.addresses.update_one(
                {"id": next_addr["id"]}, {"$set": {"is_default": True}}
            )
    return {"success": True}


@router.patch("/{address_id}/default")
async def set_default_address(address_id: str, request: Request):
    user = await get_current_user(request)
    db = get_db()
    existing = await db.addresses.find_one({"id": address_id, "user_id": user["user_id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")
    await db.addresses.update_many(
        {"user_id": user["user_id"]}, {"$set": {"is_default": False}}
    )
    await db.addresses.update_one({"id": address_id}, {"$set": {"is_default": True}})
    return {"success": True}
