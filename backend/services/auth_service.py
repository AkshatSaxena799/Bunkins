from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import random
import string
from config import get_db, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_MINUTES
from models.user import UserCreate, UserInDB, UserResponse


def build_user_response(user_doc: dict) -> dict:
    """Build a UserResponse dict from a MongoDB user document."""
    return UserResponse(
        id=user_doc["id"],
        email=user_doc["email"],
        full_name=user_doc["full_name"],
        role=user_doc.get("role", "user"),
        referral_code=user_doc.get("referral_code", ""),
        created_at=user_doc.get("created_at", ""),
        phone=user_doc.get("phone"),
        avatar=user_doc.get("avatar"),
    ).model_dump()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


async def register_user(user_data: UserCreate) -> dict:
    db = get_db()

    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        return {"error": "Email already exists. Please sign in instead."}

    # Create user
    user = UserInDB(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
    )

    await db.users.insert_one(user.model_dump())

    # Mark welcome as seen because registration auto-authenticates user.
    await db.users.update_one({"id": user.id}, {"$set": {"welcome_seen": True}})

    # Ensure WELCOME10 coupon exists in DB
    welcome_coupon = await db.coupons.find_one({"code": "WELCOME10"})
    if not welcome_coupon:
        import uuid as _uuid
        await db.coupons.insert_one({
            "id": str(_uuid.uuid4()),
            "code": "WELCOME10",
            "type": "percentage",
            "value": 10.0,
            "min_order_value": 0,
            "max_discount": 500.0,
            "valid_from": None,
            "valid_until": None,
            "usage_limit": 100000,
            "usage_count": 0,
            "user_specific": False,
            "active": True,
            "created_at": datetime.utcnow().isoformat(),
        })

    token = create_access_token({"sub": user.id, "role": user.role})

    return {
        "user": build_user_response(await db.users.find_one({"id": user.id})),
        "token": token,
        "is_first_login": True,
    }


async def login_user(email: str, password: str) -> dict:
    db = get_db()
    user_doc = await db.users.find_one({"email": email})

    if not user_doc:
        return {"error": "Invalid email or password"}

    if not verify_password(password, user_doc["hashed_password"]):
        return {"error": "Invalid email or password"}

    token = create_access_token({"sub": user_doc["id"], "role": user_doc["role"]})

    is_first_login = not user_doc.get("welcome_seen", True)
    if is_first_login:
        await db.users.update_one({"id": user_doc["id"]}, {"$set": {"welcome_seen": True}})

    return {
        "user": build_user_response(user_doc),
        "token": token,
        "is_first_login": is_first_login,
    }


async def get_user_by_id(user_id: str) -> dict:
    db = get_db()
    user_doc = await db.users.find_one({"id": user_id})
    if not user_doc:
        return None
    return build_user_response(user_doc)


async def update_user_profile(user_id: str, full_name: str = None, avatar: str = None) -> dict:
    db = get_db()
    update_data = {}
    if full_name:
        update_data["full_name"] = full_name.strip()
    if avatar is not None:
        update_data["avatar"] = avatar
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    user_doc = await db.users.find_one({"id": user_id})
    if not user_doc:
        return {"error": "User not found"}
    return build_user_response(user_doc)


async def send_phone_otp(user_id: str, phone: str) -> dict:
    db = get_db()
    otp = ''.join(random.choices(string.digits, k=6))
    expiry = (datetime.utcnow() + timedelta(minutes=10)).isoformat()
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"phone_otp": otp, "phone_otp_expiry": expiry, "phone_pending": phone}}
    )
    # In production: send SMS via Twilio/Fast2SMS etc.
    # For development: OTP is returned in response as otp_debug
    print(f"[DEV] OTP for {phone}: {otp}")
    return {"message": f"OTP sent to {phone}", "otp_debug": otp}


async def verify_phone_otp(user_id: str, phone: str, code: str) -> dict:
    db = get_db()
    user_doc = await db.users.find_one({"id": user_id})
    if not user_doc:
        return {"error": "User not found"}

    stored_otp = user_doc.get("phone_otp")
    stored_expiry = user_doc.get("phone_otp_expiry")
    stored_phone = user_doc.get("phone_pending")

    if not stored_otp:
        return {"error": "No OTP requested. Please request a new OTP first."}

    try:
        if datetime.fromisoformat(stored_expiry) < datetime.utcnow():
            return {"error": "OTP has expired. Please request a new one."}
    except Exception:
        return {"error": "OTP session invalid. Please request a new one."}

    if stored_phone != phone:
        return {"error": "Phone number mismatch. Please request OTP again."}

    if stored_otp != code:
        return {"error": "Invalid OTP. Please try again."}

    # Verified — save phone and clear OTP fields
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"phone": phone},
         "$unset": {"phone_otp": "", "phone_otp_expiry": "", "phone_pending": ""}}
    )
    user_doc = await db.users.find_one({"id": user_id})
    return build_user_response(user_doc)
