import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import type { Meal } from "../types";
import { getImageUrl } from "../services/meals";
import { colors, radius, shadow } from "../theme";

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍎",
};

export function MealCard({
  meal,
  onPress,
}: {
  meal: Meal;
  onPress: () => void;
}) {
  const time = new Date(meal.logged_at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const thumb = getImageUrl(meal);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {thumb ? (
        <Image source={{ uri: thumb }} style={styles.thumb} />
      ) : (
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{MEAL_EMOJI[meal.meal_type] ?? "🍴"}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {meal.name}
        </Text>
        <Text style={styles.sub}>
          {meal.meal_type} · {time}
        </Text>
        <Text style={styles.macros}>
          P {Math.round(meal.protein_g)}g · C {Math.round(meal.carbs_g)}g · F{" "}
          {Math.round(meal.fat_g)}g
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.calories}>{meal.calories}</Text>
        <Text style={styles.kcal}>kcal</Text>
        {meal.health_score != null && (
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{meal.health_score}/10</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 12,
    ...shadow.card,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
  },
  emoji: { fontSize: 24 },
  body: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  sub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "capitalize",
  },
  macros: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  right: { alignItems: "flex-end" },
  calories: { fontSize: 18, fontWeight: "800", color: colors.primary },
  kcal: { fontSize: 11, color: colors.textMuted },
  scorePill: {
    marginTop: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scoreText: { fontSize: 11, fontWeight: "700", color: colors.primaryDark },
});
