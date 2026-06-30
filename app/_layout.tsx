import "@/global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth, useIsAuthed } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui/Loader";

function RootNavigator() {
  const { initializing } = useAuth();
  const authed = useIsAuthed();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "(auth)";
    if (!authed && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (authed && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [authed, initializing, segments, router]);

  if (initializing) {
    return <Loader />;
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
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
