import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { GradientButton } from "../components/GradientButton";
import { useDialog } from "../components/AppDialog";
import { colors, gradients, radius, shadow } from "../theme";

export function AuthScreen() {
  const { signIn, signUp, demoLogin } = useAuth();
  const dialog = useDialog();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      dialog.alert("Missing info", "Please enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email.trim(), password, fullName.trim());
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      dialog.alert("Authentication failed", err.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  const tryDemo = async () => {
    setBusy(true);
    try {
      await demoLogin();
    } catch (err: any) {
      dialog.alert("Demo login failed", err.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient colors={gradients.hero} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.fill}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.logo}>🥗</Text>
            <Text style={styles.brand}>CaloriQ</Text>
            <Text style={styles.tagline}>AI nutrition tracking & meal coach</Text>

            <View style={styles.card}>
              <Text style={styles.heading}>
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </Text>

              {mode === "signup" && (
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={colors.textFaint}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              )}
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textFaint}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textFaint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <GradientButton
                label={mode === "signin" ? "Sign in" : "Sign up"}
                onPress={submit}
                loading={busy}
                style={styles.cta}
              />

              <TouchableOpacity
                onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
                style={styles.switch}
              >
                <Text style={styles.switchText}>
                  {mode === "signin"
                    ? "New here? Create an account"
                    : "Already have an account? Sign in"}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={styles.demoButton}
                onPress={tryDemo}
                disabled={busy}
              >
                <Text style={styles.demoButtonText}>⚡ Try the demo</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logo: { fontSize: 52, textAlign: "center" },
  brand: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.onBrand,
    textAlign: "center",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  tagline: {
    textAlign: "center",
    color: colors.onBrandFaint,
    marginTop: 6,
    marginBottom: 28,
    fontWeight: "500",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 24,
    ...shadow.raised,
  },
  heading: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    backgroundColor: colors.bgElevated,
  },
  cta: { marginTop: 6 },
  switch: { marginTop: 16, alignItems: "center" },
  switchText: { color: colors.primaryDark, fontWeight: "700" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    marginHorizontal: 12,
    color: colors.textFaint,
    fontWeight: "600",
    fontSize: 12,
  },
  demoButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: colors.primaryTint,
  },
  demoButtonText: { color: colors.primaryDark, fontSize: 15, fontWeight: "800" },
});
