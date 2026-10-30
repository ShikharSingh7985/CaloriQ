"""Meal listing, AI analysis, logging, deletion, and demo seeding."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..ai import analyze_meal_image
from ..auth import get_current_user
from ..database import get_db
from ..models import Meal, User
from ..schemas import AnalyzeIn, AnalyzeOut, MealAnalysis, MealCreateIn, MealOut
from ..utils import meal_to_out, save_meal_image

router = APIRouter(prefix="/meals", tags=["meals"])


@router.get("", response_model=list[MealOut])
def list_meals(
    since: datetime | None = Query(
        default=None, description="Only meals logged at/after this ISO timestamp."
    ),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if since is None:
        # Default: midnight UTC today.
        since_naive = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0, tzinfo=None
        )
    elif since.tzinfo is not None:
        # Normalize an aware timestamp (e.g. local midnight) to naive UTC.
        since_naive = since.astimezone(timezone.utc).replace(tzinfo=None)
    else:
        since_naive = since

    rows = (
        db.query(Meal)
        .filter(Meal.user_id == current.id, Meal.logged_at >= since_naive)
        .order_by(Meal.logged_at.desc())
        .all()
    )
    return [meal_to_out(m) for m in rows]


@router.post("/analyze", response_model=AnalyzeOut)
def analyze(payload: AnalyzeIn, _: User = Depends(get_current_user)):
    result = analyze_meal_image(
        payload.image_base64, payload.media_type, payload.meal_type_hint
    )
    return AnalyzeOut(analysis=MealAnalysis(**result))


@router.post("", response_model=MealOut, status_code=201)
def create_meal(
    payload: MealCreateIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_path = None
    if payload.image_base64:
        image_path = save_meal_image(
            current.id, payload.image_base64, payload.media_type
        )

    meal = Meal(
        user_id=current.id,
        name=payload.name,
        meal_type=payload.meal_type,
        image_path=image_path,
        calories=payload.calories,
        protein_g=payload.protein_g,
        carbs_g=payload.carbs_g,
        fat_g=payload.fat_g,
        health_score=payload.health_score,
        recommendation=payload.recommendation,
        items=payload.items,
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal_to_out(meal)


@router.delete("/{meal_id}", status_code=204)
def delete_meal(
    meal_id: str,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meal = db.get(Meal, meal_id)
    if not meal or meal.user_id != current.id:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()


@router.post("/demo-seed", response_model=list[MealOut])
def demo_seed(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    samples = [
        Meal(
            user_id=current.id,
            name="Greek Yogurt & Berries",
            meal_type="breakfast",
            calories=280,
            protein_g=18,
            carbs_g=32,
            fat_g=8,
            health_score=9,
            recommendation="Great protein-to-calorie ratio. Add a few nuts for healthy fats.",
            items=["Greek yogurt", "Blueberries", "Honey"],
            logged_at=now - timedelta(hours=7),
        ),
        Meal(
            user_id=current.id,
            name="Chicken Rice Bowl",
            meal_type="lunch",
            calories=620,
            protein_g=42,
            carbs_g=65,
            fat_g=18,
            health_score=8,
            recommendation="Solid balanced meal. Add leafy greens for extra fiber.",
            items=["Grilled chicken", "White rice", "Avocado", "Corn"],
            logged_at=now - timedelta(hours=3),
        ),
        Meal(
            user_id=current.id,
            name="Apple & Peanut Butter",
            meal_type="snack",
            calories=210,
            protein_g=7,
            carbs_g=25,
            fat_g=11,
            health_score=7,
            recommendation="Good energy snack. Watch portion size on the peanut butter.",
            items=["Apple", "Peanut butter"],
            logged_at=now - timedelta(hours=1),
        ),
    ]
    db.add_all(samples)
    db.commit()
    for m in samples:
        db.refresh(m)
    return [meal_to_out(m) for m in samples]
