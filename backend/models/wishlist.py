from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class WishlistResponse(BaseModel):
    id: str
    user_id: str
    product_ids: List[str]
    created_at: str
    updated_at: str
