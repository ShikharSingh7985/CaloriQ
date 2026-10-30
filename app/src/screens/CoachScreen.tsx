import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ScreenProps } from "../navigation";
import type { Coach } from "../types";
import { getCoach } from "../services/meals";
import { colors, radius, shadow } from "../theme";

export function CoachScreen(_props: ScreenProps<"Coach">) {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCoach(await getCoach());
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🍽️</Text>
          <Text style={styles.heroTitle}>AI Meal Coach</Text>
          <Text style={styles.heroSub}>
            Personalized guidance from today's meals & your goals
          </Text>
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Thinking about your day…</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              Make sure ANTHROPIC_API_KEY is set on the backend.
            </Text>
          </View>
        )}

        {coach && !loading && (
          <>
            <View style={styles.card}>
              <Text style={styles.headline}>{coach.headline}</Text>
              <Text style={styles.summary}>{coach.summary}</Text>
            </View>

            <Text style={styles.sectionTitle}>Tips for the rest of the day</Text>
            <View style={styles.card}>
              {coach.suggestions.map((s, i) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{s}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>What to eat next</Text>
            <View style={[styles.card, styles.nextCard]}>
              <Text style={styles.nextText}>{coach.next_meal}</Text>
            </View>
          </>
        )}

        {!loading && (
          <TouchableOpacity style={styles.refresh} onPress={load}>
            <Text style={styles.refreshText}>↻ Refresh advice</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: "center", marginBottom: 20 },
  heroEmoji: { fontSize: 44 },
  heroTitle: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 6 },
  heroSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  center: { alignItems: "center", paddingVertical: 40 },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 8,
    ...shadow.card,
  },
  headline: { fontSize: 18, fontWeight: "800", color: colors.primaryDark },
  summary: { fontSize: 15, color: colors.text, marginTop: 8, lineHeight: 22 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginTop: 18,
    marginBottom: 8,
  },
  tipRow: { flexDirection: "row", marginBottom: 8 },
  tipBullet: { color: colors.primary, fontSize: 16, marginRight: 8, lineHeight: 22 },
  tipText: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  nextCard: { backgroundColor: colors.primaryTint },
  nextText: { fontSize: 15, color: colors.primaryDark, lineHeight: 22, fontWeight: "600" },
  errorCard: {
    backgroundColor: "#FDE8E8",
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
  },
  errorText: { color: colors.danger, fontWeight: "700" },
  errorHint: { color: colors.danger, marginTop: 6, fontSize: 13 },
  refresh: {
    marginTop: 22,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 22,
  },
  refreshText: { color: colors.primaryDark, fontWeight: "700" },
});
