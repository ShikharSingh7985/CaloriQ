"""AI Meal Coach: recommendations based on the day's logged meals + goals."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..ai import coach_recommendation
from ..auth import get_current_user
from ..database import get_db
from ..models import Meal, User
from ..schemas import CoachOut

router = APIRouter(prefix="/coach", tags=["coach"])


@router.get("", response_model=CoachOut)
def get_coach(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    midnight = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0, tzinfo=None
    )
    meals = (
        db.query(Meal)
        .filter(Meal.user_id == current.id, Meal.logged_at >= midnight)
        .order_by(Meal.logged_at.asc())
        .all()
    )

    context = {
        "goal": current.goal,
        "daily_calorie_goal": current.daily_calorie_goal,
        "daily_protein_goal": current.daily_protein_goal,
        "daily_carb_goal": current.daily_carb_goal,
        "daily_fat_goal": current.daily_fat_goal,
        "calories": sum(m.calories for m in meals),
        "protein_g": sum(m.protein_g for m in meals),
        "carbs_g": sum(m.carbs_g for m in meals),
        "fat_g": sum(m.fat_g for m in meals),
        "meals": [{"name": m.name, "calories": m.calories} for m in meals],
    }

    return CoachOut(**coach_recommendation(context))
