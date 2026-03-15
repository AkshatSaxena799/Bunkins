from fastapi import Request, HTTPException
from services.auth_service import decode_token


async def get_current_user(request: Request) -> dict:
    """Extract and verify JWT from Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return {"user_id": payload["sub"], "role": payload.get("role", "user")}


async def get_optional_user(request: Request) -> dict:
    """Try to extract user from JWT, return None if not authenticated."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        return None

    return {"user_id": payload["sub"], "role": payload.get("role", "user")}


async def require_owner(request: Request) -> dict:
    """Require the user to have owner role."""
    user = await get_current_user(request)
    if user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Owner access required")
    return user
