"""Contract checks for the Gemini integration without making network requests."""
import base64
import json
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app import ai


class GeminiIntegrationTests(unittest.TestCase):
    def test_meal_photo_uses_inline_bytes_and_preserves_response_shape(self):
        analysis = {
            "name": "Rice bowl",
            "meal_type": "lunch",
            "calories": 500,
            "protein_g": 20,
            "carbs_g": 70,
            "fat_g": 15,
            "health_score": 7,
            "recommendation": "Add vegetables.",
            "items": ["Rice", "Beans"],
        }
        with patch.object(ai.settings, "GEMINI_API_KEY", "test-key"), patch.object(
            ai.genai, "Client"
        ) as client:
            client.return_value.models.generate_content.return_value = SimpleNamespace(
                text=json.dumps(analysis)
            )
            result = ai.analyze_meal_image(
                base64.b64encode(b"image-bytes").decode(), "image/jpeg", "lunch"
            )

        self.assertEqual(result, analysis)
        self.assertEqual(set(result), set(ai.NUTRITION_SCHEMA["required"]))
        request = client.return_value.models.generate_content.call_args.kwargs
        self.assertEqual(request["model"], ai.settings.GEMINI_MODEL)
        self.assertEqual(request["contents"][0].inline_data.data, b"image-bytes")
        self.assertEqual(request["contents"][0].inline_data.mime_type, "image/jpeg")
        self.assertIn("lunch", request["contents"][1])
        self.assertEqual(request["config"].response_mime_type, "application/json")
        self.assertEqual(request["config"].response_json_schema, ai.NUTRITION_SCHEMA)

    def test_coach_uses_structured_output_and_preserves_response_shape(self):
        guidance = {
            "headline": "Good start",
            "summary": "On track.",
            "suggestions": ["Add greens"],
            "next_meal": "Salad with tofu",
        }
        context = {
            "goal": "maintain",
            "daily_calorie_goal": 2000,
            "daily_protein_goal": 120,
            "daily_carb_goal": 220,
            "daily_fat_goal": 70,
            "calories": 500,
            "protein_g": 20,
            "carbs_g": 70,
            "fat_g": 15,
            "meals": [{"name": "Rice bowl", "calories": 500}],
        }
        with patch.object(ai.settings, "GEMINI_API_KEY", "test-key"), patch.object(
            ai.genai, "Client"
        ) as client:
            client.return_value.models.generate_content.return_value = SimpleNamespace(
                text=json.dumps(guidance)
            )
            result = ai.coach_recommendation(context)

        self.assertEqual(result, guidance)
        self.assertEqual(set(result), set(ai.COACH_SCHEMA["required"]))
        request = client.return_value.models.generate_content.call_args.kwargs
        self.assertEqual(request["config"].response_json_schema, ai.COACH_SCHEMA)
        self.assertIn("Rice bowl", request["contents"])

    def test_missing_key_rejects_both_ai_operations(self):
        with patch.object(ai.settings, "GEMINI_API_KEY", None):
            for operation, argument in (
                (ai.analyze_meal_image, ""),
                (ai.coach_recommendation, {}),
            ):
                with self.subTest(operation=operation.__name__), self.assertRaises(
                    HTTPException
                ) as error:
                    operation(argument)
                self.assertEqual(error.exception.status_code, 500)
                self.assertIn("GEMINI_API_KEY", error.exception.detail)


if __name__ == "__main__":
    unittest.main()
