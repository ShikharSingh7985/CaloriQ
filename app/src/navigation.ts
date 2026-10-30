import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Meal } from "./types";

export type RootStackParamList = {
  Dashboard: undefined;
  AddMeal: undefined;
  MealDetail: { meal: Meal };
  Coach: undefined;
  Profile: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
