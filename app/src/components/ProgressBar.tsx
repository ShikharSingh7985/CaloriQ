import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme";

export function ProgressBar({
  value,
  goal,
  color = colors.primary,
  trackColor = colors.border,
  height = 10,
}: {
  value: number;
  goal: number;
  color?: string;
  trackColor?: string;
  height?: number;
}) {
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;
  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor },
      ]}
    >
      <View
        style={{
          width: `${pct * 100}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
});
