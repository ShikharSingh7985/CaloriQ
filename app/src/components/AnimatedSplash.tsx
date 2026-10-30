import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { colors, gradients } from "../theme";

/**
 * A branded, animated splash overlay shown on launch. It mirrors the native
 * splash colors (so there's no flash), plays a short entrance, then fades out
 * to reveal the app.
 */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const overlay = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Hide the native splash as soon as our overlay is on screen.
  const handleLayout = () => {
    SplashScreen.hideAsync().catch(() => {});
  };

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.delay(650),
      Animated.timing(overlay, {
        toValue: 0,
        duration: 450,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, [logoScale, logoOpacity, ringScale, textOpacity, overlay, onFinish]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity: overlay }]}
      onLayout={handleLayout}
      pointerEvents="none"
    >
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fill}
      >
        <View style={styles.center}>
          <View style={styles.logoStack}>
            <Animated.View
              style={[
                styles.ring,
                { opacity: logoOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
            <Animated.View
              style={[
                styles.badge,
                { opacity: logoOpacity, transform: [{ scale: logoScale }] },
              ]}
            >
              <Text style={styles.logo}>🥗</Text>
            </Animated.View>
          </View>

          <Animated.View style={{ opacity: textOpacity, alignItems: "center" }}>
            <Text style={styles.brand}>CaloriQ</Text>
            <Text style={styles.tagline}>AI nutrition tracking & meal coach</Text>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.footer, { opacity: textOpacity }]}>
          health, snapped
        </Animated.Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { alignItems: "center" },
  logoStack: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },
  ring: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  badge: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { fontSize: 60 },
  brand: {
    fontSize: 38,
    fontWeight: "900",
    color: colors.onBrand,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.onBrandFaint,
    marginTop: 8,
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 56,
    fontSize: 12,
    color: colors.onBrandFaint,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
