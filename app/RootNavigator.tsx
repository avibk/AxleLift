import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth, useIsAuthed } from "@/contexts/AuthContext";
import { useWorkout } from "@/contexts/WorkoutContext";
import { AppSplash } from "@/components/ui/AppSplash";
import { useNavigationHaptics } from "@/hooks/useNavigationHaptics";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden on web or during fast refresh.
});

const MIN_SPLASH_MS = 600;

function RootNavigator() {
  const { initializing } = useAuth();
  const { isReady } = useWorkout();
  const authed = useIsAuthed();
  const segments = useSegments();
  const router = useRouter();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useNavigationHaptics();

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  const appReady = !initializing && isReady && minTimeElapsed;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  useEffect(() => {
    if (!appReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    if (!authed && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (authed && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [authed, appReady, segments, router]);

  if (!appReady) {
    return <AppSplash />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0a0a0a" },
        animation: "fade",
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}

export { RootNavigator };
