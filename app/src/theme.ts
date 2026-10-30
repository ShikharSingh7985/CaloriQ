// ---------------------------------------------------------------------------
// NutriSnap design system — fresh, health-forward (emerald + teal),
// warm neutral surfaces, soft elevation.
// ---------------------------------------------------------------------------
export const colors = {
  // Brand
  primary: "#10B981", // emerald-500
  primaryDark: "#047857", // emerald-700
  primaryDeep: "#065F46", // emerald-800
  primarySoft: "#D1FAE5", // emerald-100
  primaryTint: "#ECFDF5", // emerald-50
  teal: "#14B8A6",

  // Surfaces (subtle mint-tinted, not pure white/gray)
  bg: "#EEF4F1",
  bgElevated: "#F6FAF8",
  card: "#FFFFFF",

  // Text
  text: "#0F2A22", // deep green-slate
  textMuted: "#5B7268",
  textFaint: "#94A8A0",

  // Lines
  border: "#E2EDE7",

  // Macros / data viz
  protein: "#3B82F6", // blueberry
  carbs: "#F59E0B", // amber / grain
  fat: "#A855F7", // grape
  calories: "#10B981",

  // Status
  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
  star: "#FACC15",

  // On-gradient
  onBrand: "#FFFFFF",
  onBrandFaint: "rgba(255,255,255,0.82)",
  onBrandTrack: "rgba(255,255,255,0.28)",
};

// Gradient stop arrays (use with expo-linear-gradient `colors`).
export const gradients = {
  brand: ["#34D399", "#10B981", "#059669"] as const, // emerald sweep
  hero: ["#10B981", "#0EA5A4"] as const, // emerald → teal
  coach: ["#065F46", "#0F766E"] as const, // deep emerald → teal
  splash: ["#34D399", "#0EA5A4"] as const,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

// Soft, layered elevation. Uses the cross-platform `boxShadow` style prop
// (React Native 0.76+ / New Architecture), which correctly follows
// borderRadius on Android — unlike `elevation`, whose shadow renders square.
export const shadow = {
  card: { boxShadow: "0px 4px 14px rgba(11, 61, 46, 0.10)" },
  raised: { boxShadow: "0px 9px 22px rgba(6, 95, 70, 0.20)" },
};

export const spacing = (n: number) => n * 4;
