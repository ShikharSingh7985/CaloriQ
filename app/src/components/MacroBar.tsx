import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ProgressBar } from "./ProgressBar";
import { colors } from "../theme";

export function MacroBar({
  label,
  value,
  goal,
  color,
  unit = "g",
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {Math.round(value)}
          {unit} <Text style={styles.goal}>/ {goal}{unit}</Text>
        </Text>
      </View>
      <ProgressBar value={value} goal={goal} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { fontSize: 14, fontWeight: "600", color: colors.text },
  value: { fontSize: 14, fontWeight: "600", color: colors.text },
  goal: { color: colors.textMuted, fontWeight: "400" },
});
