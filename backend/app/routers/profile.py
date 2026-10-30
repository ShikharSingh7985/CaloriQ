"""Read / update the signed-in user's profile (goals)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import User
from ..schemas import ProfileUpdate, UserOut

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=UserOut)
def get_profile(current: User = Depends(get_current_user)):
    return UserOut.model_validate(current)


@router.put("", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current, field, value)
    db.commit()
    db.refresh(current)
    return UserOut.model_validate(current)
