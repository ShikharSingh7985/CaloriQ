import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { DialogProvider } from "./src/components/AppDialog";
import { AnimatedSplash } from "./src/components/AnimatedSplash";

// Keep the native splash up until our animated splash takes over (no flash).
SplashScreen.preventAutoHideAsync().catch(() => {});
import { AuthScreen } from "./src/screens/AuthScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { AddMealScreen } from "./src/screens/AddMealScreen";
import { MealDetailScreen } from "./src/screens/MealDetailScreen";
import { CoachScreen } from "./src/screens/CoachScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import type { RootStackParamList } from "./src/navigation";
import { colors } from "./src/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddMeal"
        component={AddMealScreen}
        options={{ title: "Snap a meal" }}
      />
      <Stack.Screen
        name="MealDetail"
        component={MealDetailScreen}
        options={{ title: "Meal" }}
      />
      <Stack.Screen
        name="Coach"
        component={CoachScreen}
        options={{ title: "AI Coach" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Goals" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DialogProvider>
          <NavigationContainer>
            <StatusBar style={splashDone ? "dark" : "light"} />
            <Root />
          </NavigationContainer>
        </DialogProvider>
      </AuthProvider>
      {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
    </SafeAreaProvider>
  );
}
