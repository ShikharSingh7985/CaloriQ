import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import type { ScreenProps } from "../navigation";
import type { MealAnalysis, MealType } from "../types";
import { analyzeMeal, saveMeal } from "../services/meals";
import { GradientButton } from "../components/GradientButton";
import { useDialog } from "../components/AppDialog";
import { colors, radius, shadow } from "../theme";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export function AddMealScreen({ navigation }: ScreenProps<"AddMeal">) {
  const dialog = useDialog();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("image/jpeg");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePicked = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageBase64(asset.base64 ?? null);
    // Normalize to a media type Claude + Storage accept; default to JPEG.
    const mt = asset.mimeType ?? "image/jpeg";
    setMediaType(["image/jpeg", "image/png", "image/webp"].includes(mt) ? mt : "image/jpeg");
    setAnalysis(null);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      dialog.alert("Camera permission needed", "Enable camera access to snap meals.");
      return;
    }
    handlePicked(
      await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.6,
        allowsEditing: true,
      }),
    );
  };

  const pickFromLibrary = async () => {
    handlePicked(
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.6,
        allowsEditing: true,
      }),
    );
  };

  const runAnalysis = async () => {
    if (!imageBase64) {
      dialog.alert("Pick a photo first");
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeMeal({
        imageBase64,
        mediaType,
        mealTypeHint: mealType,
      });
      setAnalysis(result);
      if (result.meal_type) setMealType(result.meal_type);
    } catch (err: any) {
      dialog.alert("Analysis failed", err.message ?? String(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const save = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      await saveMeal({
        analysis,
        mealType,
        imageBase64: imageBase64 ?? undefined,
        mediaType,
      });
      navigation.goBack();
    } catch (err: any) {
      dialog.alert("Could not save meal", err.message ?? String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>📸</Text>
            <Text style={styles.placeholderText}>
              Snap or choose a meal photo
            </Text>
          </View>
        )}

        <View style={styles.pickRow}>
          <TouchableOpacity style={styles.pickButton} onPress={takePhoto}>
            <Text style={styles.pickButtonText}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickButton} onPress={pickFromLibrary}>
            <Text style={styles.pickButtonText}>🖼️ Library</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Meal type</Text>
        <View style={styles.chips}>
          {MEAL_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, mealType === t && styles.chipActive]}
              onPress={() => setMealType(t)}
            >
              <Text
                style={[
                  styles.chipText,
                  mealType === t && styles.chipTextActive,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!analysis && (
          <GradientButton
            label="🧠  Analyze nutrition"
            onPress={runAnalysis}
            loading={analyzing}
            disabled={!imageBase64}
            style={styles.cta}
          />
        )}

        {analysis && (
          <View style={styles.resultCard}>
            <Text style={styles.resultName}>{analysis.name}</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.bigCalories}>{analysis.calories}</Text>
              <Text style={styles.kcal}>kcal</Text>
              <View style={styles.scorePill}>
                <Text style={styles.scorePillText}>
                  Health {analysis.health_score}/10
                </Text>
              </View>
            </View>

            <View style={styles.macroRow}>
              <Macro label="Protein" value={analysis.protein_g} color={colors.protein} />
              <Macro label="Carbs" value={analysis.carbs_g} color={colors.carbs} />
              <Macro label="Fat" value={analysis.fat_g} color={colors.fat} />
            </View>

            {analysis.items?.length > 0 && (
              <>
                <Text style={styles.subLabel}>Detected items</Text>
                <Text style={styles.items}>{analysis.items.join(" · ")}</Text>
              </>
            )}

            <Text style={styles.subLabel}>Coach tip</Text>
            <Text style={styles.tip}>{analysis.recommendation}</Text>

            <GradientButton
              label="Save to log"
              onPress={save}
              loading={saving}
              style={styles.cta}
            />
            <TouchableOpacity onPress={runAnalysis} style={styles.reanalyze}>
              <Text style={styles.reanalyzeText}>Re-analyze</Text>
            </TouchableOpacity>
          </View>
        )}
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
      <Text style={styles.macroValue}>{Math.round(value)}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
  preview: { width: "100%", height: 240, borderRadius: radius.lg, ...shadow.card },
  placeholder: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderEmoji: { fontSize: 48 },
  placeholderText: { color: colors.primaryDark, marginTop: 8, fontWeight: "600" },
  pickRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  pickButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  pickButtonText: { fontWeight: "700", color: colors.text },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginTop: 22,
    marginBottom: 10,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontWeight: "600", textTransform: "capitalize" },
  chipTextActive: { color: colors.onBrand },
  cta: { marginTop: 22 },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 24,
    ...shadow.card,
  },
  resultName: { fontSize: 20, fontWeight: "800", color: colors.text },
  scoreRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 8 },
  bigCalories: { fontSize: 32, fontWeight: "800", color: colors.primary },
  kcal: { fontSize: 14, color: colors.textMuted, marginBottom: 6, marginLeft: 4 },
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
    marginBottom: 6,
  },
  macro: { alignItems: "center" },
  macroDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
  macroValue: { fontSize: 18, fontWeight: "800", color: colors.text },
  macroLabel: { fontSize: 12, color: colors.textMuted },
  subLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginTop: 16,
  },
  items: { color: colors.textMuted, marginTop: 4 },
  tip: { color: colors.text, marginTop: 4, lineHeight: 20 },
  reanalyze: { alignItems: "center", marginTop: 12 },
  reanalyzeText: { color: colors.textMuted, fontWeight: "600" },
});
