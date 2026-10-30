"""Helpers for image storage and serialization."""
import base64
import binascii
import uuid

from fastapi import HTTPException

from .config import settings
from .models import Meal
from .schemas import MealOut

_EXT = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def save_meal_image(user_id: str, image_base64: str, media_type: str) -> str:
    """Decode a base64 image to disk; return its relative URL path."""
    try:
        raw = base64.b64decode(image_base64)
    except (binascii.Error, ValueError):
        raise HTTPException(status_code=400, detail="Invalid image data")

    ext = _EXT.get(media_type, "jpg")
    user_dir = settings.UPLOAD_DIR / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.{ext}"
    (user_dir / filename).write_bytes(raw)
    # Relative URL path; the client composes the absolute URL from its API base.
    return f"/uploads/{user_id}/{filename}"


def meal_to_out(meal: Meal) -> MealOut:
    return MealOut(
        id=meal.id,
        name=meal.name,
        meal_type=meal.meal_type,
        image_url=meal.image_path,
        calories=meal.calories,
        protein_g=meal.protein_g,
        carbs_g=meal.carbs_g,
        fat_g=meal.fat_g,
        health_score=meal.health_score,
        recommendation=meal.recommendation,
        items=meal.items or [],
        logged_at=meal.logged_at,
    )
