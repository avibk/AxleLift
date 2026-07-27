import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
  type RefreshControlProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { FadeInView } from "./FadeInView";
import { colors } from "@/lib/colors";

interface ScreenProps {
  children: ReactNode;
  /** Extra classes for the inner content container. */
  contentClassName?: string;
  /** Disable the scroll-reset-on-focus behaviour if needed. */
  resetOnFocus?: boolean;
  /** Enable iOS keyboard avoidance for input-heavy screens. */
  keyboardAvoiding?: boolean;
  /** Async function to trigger on pull-to-refresh. */
  onRefresh?: () => Promise<void> | void;
  /** Pass a custom RefreshControl if you want to override the default. */
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

/**
 * Standard screen shell: safe-area aware, dark background, scrollable, and it
 * resets to the top every time the tab regains focus. Also provides built-in
 * pull-to-refresh state management if `onRefresh` is passed.
 */
export function Screen({
  children,
  contentClassName = "",
  resetOnFocus = true,
  keyboardAvoiding = false,
  onRefresh,
  refreshControl,
}: ScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    let completed = false;
    try {
      await onRefresh();
      completed = true;
    } catch (error) {
      console.warn("[Screen] onRefresh failed:", error);
    } finally {
      if (completed && Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      if (isMounted.current) {
        setRefreshing(false);
      }
    }
  }, [onRefresh]);

  useFocusEffect(
    useCallback(() => {
      if (resetOnFocus) {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }
    }, [resetOnFocus])
  );

  const defaultRefreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colors.brand400}
      colors={[colors.brand400]}
    />
  ) : undefined;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-neutral-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={keyboardAvoiding && Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 bg-neutral-950"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl || defaultRefreshControl}
        >
          <FadeInView>
            <View className={`px-5 pb-28 pt-2 ${contentClassName}`}>{children}</View>
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
