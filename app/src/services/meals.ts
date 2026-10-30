import { api, API_URL } from "../lib/api";
import type {
  Coach,
  Meal,
  MealAnalysis,
  MealType,
  Profile,
  ProfileUpdate,
} from "../types";

/** The signed-in user's profile (daily goals). */
export function getProfile(): Promise<Profile> {
  return api<Profile>("/profile");
}

/** Update the user's profile (goal + daily targets). */
export function updateProfile(payload: ProfileUpdate): Promise<Profile> {
  return api<Profile>("/profile", { method: "PUT", body: payload });
}

/** AI coaching for the rest of the day, based on what's been logged. */
export function getCoach(): Promise<Coach> {
  return api<Coach>("/coach");
}

/** Meals logged since local midnight, newest first. */
export function getTodaysMeals(): Promise<Meal[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return api<Meal[]>(`/meals?since=${encodeURIComponent(start.toISOString())}`);
}

/** Ask the backend (Claude) to analyze a base64 meal photo. */
export async function analyzeMeal(params: {
  imageBase64: string;
  mediaType?: string;
  mealTypeHint?: MealType;
}): Promise<MealAnalysis> {
  const res = await api<{ analysis: MealAnalysis }>("/meals/analyze", {
    method: "POST",
    body: {
      image_base64: params.imageBase64,
      media_type: params.mediaType ?? "image/jpeg",
      meal_type_hint: params.mealTypeHint,
    },
  });
  return res.analysis;
}

/** Log a meal from an analysis result, optionally with its photo. */
export function saveMeal(params: {
  analysis: MealAnalysis;
  mealType: MealType;
  imageBase64?: string;
  mediaType?: string;
}): Promise<Meal> {
  const { analysis } = params;
  return api<Meal>("/meals", {
    method: "POST",
    body: {
      name: analysis.name,
      meal_type: params.mealType,
      calories: Math.round(analysis.calories),
      protein_g: analysis.protein_g,
      carbs_g: analysis.carbs_g,
      fat_g: analysis.fat_g,
      health_score: analysis.health_score,
      recommendation: analysis.recommendation,
      items: analysis.items,
      image_base64: params.imageBase64,
      media_type: params.mediaType ?? "image/jpeg",
    },
  });
}

export function deleteMeal(id: string): Promise<void> {
  return api<void>(`/meals/${id}`, { method: "DELETE" });
}

/** Populate the account with sample meals. */
export function loadSampleMeals(): Promise<Meal[]> {
  return api<Meal[]>("/meals/demo-seed", { method: "POST" });
}

/** Absolute URL for a meal's stored photo, or null. */
export function getImageUrl(meal: Meal): string | null {
  return meal.image_url ? `${API_URL}${meal.image_url}` : null;
}
