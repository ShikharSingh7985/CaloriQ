import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ScreenProps } from "../navigation";
import { deleteMeal, getImageUrl } from "../services/meals";
import { useDialog } from "../components/AppDialog";
import { colors, radius, shadow } from "../theme";

export function MealDetailScreen({ route, navigation }: ScreenProps<"MealDetail">) {
  const { meal } = route.params;
  const dialog = useDialog();
  const imageUrl = getImageUrl(meal);

  const confirmDelete = () => {
    dialog.confirm({
      title: "Delete meal",
      message: "Remove this meal from your log?",
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteMeal(meal.id);
          navigation.goBack();
        } catch (err: any) {
          dialog.alert("Could not delete", err.message ?? String(err));
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 48 }}>🍽️</Text>
          </View>
        )}

        <Text style={styles.name}>{meal.name}</Text>
        <Text style={styles.meta}>
          {meal.meal_type} ·{" "}
          {new Date(meal.logged_at).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </Text>

        <View style={styles.card}>
          <View style={styles.calorieRow}>
            <Text style={styles.calories}>{meal.calories}</Text>
            <Text style={styles.kcal}>kcal</Text>
            {meal.health_score != null && (
              <View style={styles.scorePill}>
                <Text style={styles.scorePillText}>
                  Health {meal.health_score}/10
                </Text>
              </View>
            )}
          </View>
          <View style={styles.macroRow}>
            <Macro label="Protein" value={meal.protein_g} color={colors.protein} />
            <Macro label="Carbs" value={meal.carbs_g} color={colors.carbs} />
            <Macro label="Fat" value={meal.fat_g} color={colors.fat} />
          </View>
        </View>

        {meal.items?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detected items</Text>
            <Text style={styles.sectionBody}>{meal.items.join(" · ")}</Text>
          </View>
        )}

        {meal.recommendation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coach tip</Text>
            <Text style={styles.sectionBody}>{meal.recommendation}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
          <Text style={styles.deleteText}>Delete meal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Macro({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.macro}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroValue}>{Math.round(Number(value))}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
  image: { width: "100%", height: 240, borderRadius: radius.lg, ...shadow.card },
  imagePlaceholder: {
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 18 },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: "capitalize",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 18,
    ...shadow.card,
  },
  calorieRow: { flexDirection: "row", alignItems: "flex-end" },
  calories: { fontSize: 32, fontWeight: "800", color: colors.primary },
  kcal: { fontSize: 14, color: colors.textMuted, marginLeft: 4, marginBottom: 6 },
  scorePill: {
    marginLeft: "auto",
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scorePillText: { color: colors.primaryDark, fontWeight: "700" },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 18,
  },
  macro: { alignItems: "center" },
  macroDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
  macroValue: { fontSize: 18, fontWeight: "800", color: colors.text },
  macroLabel: { fontSize: 12, color: colors.textMuted },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  sectionBody: { color: colors.text, marginTop: 6, lineHeight: 20 },
  deleteButton: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  deleteText: { color: colors.danger, fontWeight: "700" },
});
