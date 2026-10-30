import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { ScreenProps } from "../navigation";
import type { Meal, Profile } from "../types";
import {
  getProfile,
  getTodaysMeals,
  loadSampleMeals,
} from "../services/meals";
import { useAuth } from "../context/AuthContext";
import { MacroBar } from "../components/MacroBar";
import { ProgressBar } from "../components/ProgressBar";
import { MealCard } from "../components/MealCard";
import { useDialog } from "../components/AppDialog";
import { colors, gradients, radius, shadow } from "../theme";

export function DashboardScreen({ navigation }: ScreenProps<"Dashboard">) {
  const { signOut } = useAuth();
  const dialog = useDialog();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([getProfile(), getTodaysMeals()]);
      setProfile(p);
      setMeals(m);
    } catch (err: any) {
      dialog.alert("Could not load data", err.message ?? String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + Number(m.protein_g),
      carbs: acc.carbs + Number(m.carbs_g),
      fat: acc.fat + Number(m.fat_g),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const calorieGoal = profile?.daily_calorie_goal ?? 2000;
  const remaining = Math.max(calorieGoal - totals.calories, 0);

  const onLoadSamples = async () => {
    try {
      await loadSampleMeals();
      await load();
    } catch (err: any) {
      dialog.alert("Could not add samples", err.message ?? String(err));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const header = (
    <View>
      <View style={styles.topRow}>
        <View style={styles.greetingWrap}>
          <Text style={styles.greeting} numberOfLines={1}>
            Hi{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
          </Text>
          <Text style={styles.date} numberOfLines={1}>
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={styles.iconBtn}
            accessibilityLabel="Edit goals"
          >
            <Ionicons name="settings-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={signOut}
            style={styles.iconBtn}
            accessibilityLabel="Sign out"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroLabel}>CALORIES TODAY</Text>
        <View style={styles.calorieRow}>
          <Text style={styles.calorieValue}>{totals.calories}</Text>
          <Text style={styles.calorieGoal}>/ {calorieGoal} kcal</Text>
        </View>
        <ProgressBar
          value={totals.calories}
          goal={calorieGoal}
          color={colors.onBrand}
          trackColor={colors.onBrandTrack}
          height={12}
        />
        <Text style={styles.remaining}>{remaining} kcal remaining</Text>
      </LinearGradient>

      <View style={styles.macroCard}>
        <MacroBar
          label="Protein"
          value={totals.protein}
          goal={profile?.daily_protein_goal ?? 120}
          color={colors.protein}
        />
        <MacroBar
          label="Carbs"
          value={totals.carbs}
          goal={profile?.daily_carb_goal ?? 220}
          color={colors.carbs}
        />
        <MacroBar
          label="Fat"
          value={totals.fat}
          goal={profile?.daily_fat_goal ?? 70}
          color={colors.fat}
        />
      </View>

      <TouchableOpacity
        style={styles.coachWrap}
        onPress={() => navigation.navigate("Coach")}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradients.coach}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coachButton}
        >
          <View style={styles.coachLeft}>
            <Text style={styles.coachEmoji}>🍽️</Text>
            <View>
              <Text style={styles.coachButtonText}>Ask the AI coach</Text>
              <Text style={styles.coachButtonSub}>
                Personalized advice for today
              </Text>
            </View>
          </View>
          <Text style={styles.coachButtonArrow}>›</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Today's meals</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <MealCard
            meal={item}
            onPress={() => navigation.navigate("MealDetail", { meal: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No meals logged yet</Text>
            <Text style={styles.emptyText}>
              Snap a photo of your food to get started.
            </Text>
            <TouchableOpacity
              style={styles.sampleButton}
              onPress={onLoadSamples}
            >
              <Text style={styles.sampleButtonText}>Load sample meals</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddMeal")}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}
        >
          <Ionicons name="camera" size={18} color={colors.onBrand} />
          <Text style={styles.fabText}>Snap a meal</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  list: { padding: 20, paddingBottom: 110 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  greetingWrap: { flex: 1, marginRight: 10 },
  greeting: { fontSize: 22, fontWeight: "800", color: colors.text },
  date: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  topActions: { flexDirection: "row", gap: 10, flexShrink: 0 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: 22,
    marginBottom: 14,
    overflow: "hidden",
    ...shadow.raised,
  },
  heroLabel: {
    fontSize: 12,
    color: colors.onBrandFaint,
    fontWeight: "800",
    letterSpacing: 1,
  },
  calorieRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
    gap: 6,
  },
  calorieValue: { fontSize: 42, fontWeight: "900", color: colors.onBrand },
  calorieGoal: { fontSize: 15, color: colors.onBrandFaint, marginBottom: 8 },
  remaining: { fontSize: 13, color: colors.onBrandFaint, marginTop: 10, fontWeight: "600" },
  macroCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingTop: 18,
    paddingBottom: 4,
    paddingHorizontal: 18,
    marginBottom: 22,
    ...shadow.card,
  },
  coachWrap: {
    borderRadius: radius.lg,
    marginBottom: 24,
    overflow: "hidden",
    ...shadow.raised,
  },
  coachButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  coachLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  coachEmoji: { fontSize: 24 },
  coachButtonText: { color: colors.onBrand, fontSize: 16, fontWeight: "800" },
  coachButtonSub: { color: colors.onBrandFaint, fontSize: 12, marginTop: 2 },
  coachButtonArrow: { color: colors.onBrand, fontSize: 24, fontWeight: "800" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  empty: { alignItems: "center", paddingVertical: 30 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  sampleButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 20,
    backgroundColor: colors.primaryTint,
  },
  sampleButtonText: { color: colors.primaryDark, fontWeight: "800" },
  fab: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    borderRadius: radius.pill,
    ...shadow.raised,
  },
  fabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: radius.pill,
  },
  fabText: { color: colors.onBrand, fontSize: 16, fontWeight: "800" },
});
