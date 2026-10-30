export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type NutritionGoal = "lose" | "maintain" | "gain";

// Shape returned by the /meals/analyze endpoint (Claude's structured output).
export type MealAnalysis = {
  name: string;
  meal_type: MealType;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  health_score: number;
  recommendation: string;
  items: string[];
};

// A logged meal (from the FastAPI /meals endpoints).
export type Meal = {
  id: string;
  name: string;
  meal_type: MealType;
  image_url: string | null; // relative path served by the API (/uploads/...)
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  health_score: number | null;
  recommendation: string | null;
  items: string[];
  logged_at: string;
};

// AI Meal Coach response (from /coach).
export type Coach = {
  headline: string;
  summary: string;
  suggestions: string[];
  next_meal: string;
};

// Editable subset of the profile.
export type ProfileUpdate = {
  full_name?: string;
  goal?: NutritionGoal;
  daily_calorie_goal?: number;
  daily_protein_goal?: number;
  daily_carb_goal?: number;
  daily_fat_goal?: number;
};

// The user's profile + daily nutrition targets (from /profile, /auth/me).
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  goal: NutritionGoal;
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carb_goal: number;
  daily_fat_goal: number;
};
