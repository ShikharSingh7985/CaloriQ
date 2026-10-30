import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ScreenProps } from "../navigation";
import type { NutritionGoal, Profile } from "../types";
import { getProfile, updateProfile } from "../services/meals";
import { GradientButton } from "../components/GradientButton";
import { useDialog } from "../components/AppDialog";
import { colors, radius, shadow } from "../theme";

const GOALS: { key: NutritionGoal; label: string }[] = [
  { key: "lose", label: "Lose" },
  { key: "maintain", label: "Maintain" },
  { key: "gain", label: "Gain" },
];

export function ProfileScreen({ navigation }: ScreenProps<"Profile">) {
  const dialog = useDialog();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) => dialog.alert("Could not load profile", err.message))
      .finally(() => setLoading(false));
  }, []);

  const set = (patch: Partial<Profile>) =>
    setProfile((p) => (p ? { ...p, ...patch } : p));

  const num = (v: string) => {
    const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
    return Number.isNaN(n) ? 0 : n;
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile({
        full_name: profile.full_name ?? undefined,
        goal: profile.goal,
        daily_calorie_goal: profile.daily_calorie_goal,
        daily_protein_goal: profile.daily_protein_goal,
        daily_carb_goal: profile.daily_carb_goal,
        daily_fat_goal: profile.daily_fat_goal,
      });
      navigation.goBack();
    } catch (err: any) {
      dialog.alert("Could not save", err.message ?? String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={profile.full_name ?? ""}
            onChangeText={(t) => set({ full_name: t })}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Goal</Text>
          <View style={styles.chips}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[styles.chip, profile.goal === g.key && styles.chipActive]}
                onPress={() => set({ goal: g.key })}
              >
                <Text
                  style={[
                    styles.chipText,
                    profile.goal === g.key && styles.chipTextActive,
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.section}>Daily targets</Text>

          <Field
            label="Calories (kcal)"
            value={profile.daily_calorie_goal}
            onChange={(v) => set({ daily_calorie_goal: num(v) })}
          />
          <Field
            label="Protein (g)"
            value={profile.daily_protein_goal}
            onChange={(v) => set({ daily_protein_goal: num(v) })}
          />
          <Field
            label="Carbs (g)"
            value={profile.daily_carb_goal}
            onChange={(v) => set({ daily_carb_goal: num(v) })}
          />
          <Field
            label="Fat (g)"
            value={profile.daily_fat_goal}
            onChange={(v) => set({ daily_fat_goal: num(v) })}
          />

          <GradientButton
            label="Save goals"
            onPress={save}
            loading={saving}
            style={styles.save}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={String(value)}
        onChangeText={onChange}
        keyboardType="number-pad"
      />
    </View>
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
  container: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: "#fff",
  },
  chips: { flexDirection: "row", gap: 10 },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontWeight: "700" },
  chipTextActive: { color: "#fff" },
  section: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginTop: 26,
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
    ...shadow.card,
  },
  fieldLabel: { fontSize: 15, color: colors.text },
  fieldInput: {
    width: 90,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    paddingVertical: 8,
  },
  save: { marginTop: 28 },
});
