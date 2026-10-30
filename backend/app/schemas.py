"""Pydantic request/response models."""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr

MealType = Literal["breakfast", "lunch", "dinner", "snack"]
NutritionGoal = Literal["lose", "maintain", "gain"]


# ---- Auth -----------------------------------------------------------------
class SignupIn(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    goal: NutritionGoal
    daily_calorie_goal: int
    daily_protein_goal: int
    daily_carb_goal: int
    daily_fat_goal: int

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---- Profile --------------------------------------------------------------
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    goal: Optional[NutritionGoal] = None
    daily_calorie_goal: Optional[int] = None
    daily_protein_goal: Optional[int] = None
    daily_carb_goal: Optional[int] = None
    daily_fat_goal: Optional[int] = None


# ---- Meals ----------------------------------------------------------------
class MealAnalysis(BaseModel):
    name: str
    meal_type: MealType
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    health_score: int
    recommendation: str
    items: list[str]


class AnalyzeIn(BaseModel):
    image_base64: str
    media_type: str = "image/jpeg"
    meal_type_hint: Optional[MealType] = None


class AnalyzeOut(BaseModel):
    analysis: MealAnalysis


class MealCreateIn(BaseModel):
    name: str
    meal_type: MealType
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    health_score: Optional[int] = None
    recommendation: Optional[str] = None
    items: list[str] = []
    # Optional photo to store alongside the meal.
    image_base64: Optional[str] = None
    media_type: str = "image/jpeg"


class CoachOut(BaseModel):
    headline: str
    summary: str
    suggestions: list[str]
    next_meal: str


class MealOut(BaseModel):
    id: str
    name: str
    meal_type: MealType
    image_url: Optional[str] = None
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    health_score: Optional[int] = None
    recommendation: Optional[str] = None
    items: list[str]
    logged_at: datetime
