import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useSegments } from "expo-router";
import * as Haptics from "expo-haptics";

/** Light haptic pulse whenever the active route path changes. */
export function useNavigationHaptics() {
  const segments = useSegments();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    const path = segments.join("/");
    if (prevPath.current === null) {
      prevPath.current = path;
      return;
    }
    if (prevPath.current === path) return;

    prevPath.current = path;

    if (Platform.OS === "web") return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Unsupported on some devices/simulators.
    });
  }, [segments]);
}
