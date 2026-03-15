from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class ProductSize(BaseModel):
    size: str
    stock: int = 0


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    images: List[str] = []
    category: str  # tops, bottoms, dresses, sets, accessories
    gender: str  # boys, girls, unisex
    age_group: str  # 0-2, 2-4, 4-6, 6-8, 8-10
    sizes: List[ProductSize] = []
    tags: List[str] = []
    featured: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    images: Optional[List[str]] = None
    category: Optional[str] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None
    sizes: Optional[List[ProductSize]] = None
    tags: Optional[List[str]] = None
    featured: Optional[bool] = None


class ProductInDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    price: float
    images: List[str] = []
    category: str
    gender: str
    age_group: str
    sizes: List[ProductSize] = []
    tags: List[str] = []
    featured: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    price: float
    images: List[str]
    category: str
    gender: str
    age_group: str
    sizes: List[ProductSize]
    tags: List[str]
    featured: bool
    created_at: str
    updated_at: str


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int
