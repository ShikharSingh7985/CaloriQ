"""Claude-powered nutrition analysis of a meal photo."""
import json

from anthropic import Anthropic
from fastapi import HTTPException

from .config import settings

# JSON Schema that constrains Claude's output so the API can rely on its shape.
NUTRITION_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "name": {
            "type": "string",
            "description": "Short, human-friendly meal name, e.g. 'Chicken Rice Bowl'.",
        },
        "meal_type": {
            "type": "string",
            "enum": ["breakfast", "lunch", "dinner", "snack"],
            "description": "Best guess at the meal type.",
        },
        "calories": {"type": "integer", "description": "Estimated total calories (kcal)."},
        "protein_g": {"type": "number", "description": "Estimated protein in grams."},
        "carbs_g": {"type": "number", "description": "Estimated carbohydrates in grams."},
        "fat_g": {"type": "number", "description": "Estimated fat in grams."},
        "health_score": {
            "type": "integer",
            "enum": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            "description": "Overall healthiness/balance, 1 (poor) to 10 (excellent).",
        },
        "recommendation": {
            "type": "string",
            "description": "One concise, friendly tip to improve or balance this meal.",
        },
        "items": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Distinct food items detected in the image.",
        },
    },
    "required": [
        "name",
        "meal_type",
        "calories",
        "protein_g",
        "carbs_g",
        "fat_g",
        "health_score",
        "recommendation",
        "items",
    ],
}

SYSTEM_PROMPT = (
    "You are a nutrition estimation engine for a meal-tracking app. "
    "Analyze the food in the photo and return your best, realistic estimate of "
    "the meal's nutrition for the full portion shown. If the image does not "
    "contain food, return a meal named 'No food detected' with all numeric "
    "values set to 0 and a health_score of 1."
)


def analyze_meal_image(
    image_base64: str,
    media_type: str = "image/jpeg",
    meal_type_hint: str | None = None,
) -> dict:
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=500, detail="Server is missing ANTHROPIC_API_KEY"
        )

    client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    hint = f"The user says this is likely a {meal_type_hint}." if meal_type_hint else ""

    try:
        message = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=1024,
            output_config={
                "format": {"type": "json_schema", "schema": NUTRITION_SCHEMA},
                "effort": "medium",
            },
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": f"Identify this meal and estimate its nutrition. {hint}".strip(),
                        },
                    ],
                }
            ],
        )
    except Exception as err:  # noqa: BLE001 - surface a clean error to the client
        raise HTTPException(status_code=502, detail=f"Nutrition analysis failed: {err}")

    # With output_config.format the first text block is guaranteed-valid JSON.
    text = next((b.text for b in message.content if b.type == "text"), None)
    if not text:
        raise HTTPException(status_code=502, detail="Model returned no analysis")
    return json.loads(text)


# ---------------------------------------------------------------------------
# AI Meal Coach
# ---------------------------------------------------------------------------
COACH_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "headline": {
            "type": "string",
            "description": "Short, encouraging one-line summary of how the day is going.",
        },
        "summary": {
            "type": "string",
            "description": "1-2 sentences on the day's intake vs. goals (calories + macros).",
        },
        "suggestions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "2-4 concise, actionable tips for the rest of the day.",
        },
        "next_meal": {
            "type": "string",
            "description": "A specific suggestion for what to eat next, with rough macros.",
        },
    },
    "required": ["headline", "summary", "suggestions", "next_meal"],
}

COACH_SYSTEM = (
    "You are a supportive, practical nutrition coach inside a meal-tracking app. "
    "Given the user's goal, daily targets, and what they've eaten today, give "
    "brief, encouraging, actionable guidance for the rest of the day. Be concrete "
    "about the next meal. Never be preachy or alarmist."
)


def coach_recommendation(context: dict) -> dict:
    """Generate a coaching recommendation from the day's nutrition context."""
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=500, detail="Server is missing ANTHROPIC_API_KEY"
        )

    client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    eaten = context.get("meals") or []
    meals_line = (
        ", ".join(f"{m['name']} ({m['calories']} kcal)" for m in eaten)
        if eaten
        else "nothing yet today"
    )
    prompt = (
        f"Goal: {context['goal']}.\n"
        f"Daily targets: {context['daily_calorie_goal']} kcal, "
        f"{context['daily_protein_goal']}g protein, "
        f"{context['daily_carb_goal']}g carbs, "
        f"{context['daily_fat_goal']}g fat.\n"
        f"Eaten so far today: {context['calories']} kcal, "
        f"{context['protein_g']:.0f}g protein, {context['carbs_g']:.0f}g carbs, "
        f"{context['fat_g']:.0f}g fat.\n"
        f"Meals logged: {meals_line}.\n\n"
        "Give me coaching for the rest of the day."
    )

    try:
        message = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=1024,
            output_config={
                "format": {"type": "json_schema", "schema": COACH_SCHEMA},
                "effort": "medium",
            },
            system=COACH_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as err:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Coach request failed: {err}")

    text = next((b.text for b in message.content if b.type == "text"), None)
    if not text:
        raise HTTPException(status_code=502, detail="Model returned no coaching")
    return json.loads(text)
