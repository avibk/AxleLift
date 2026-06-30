import { useCallback, useRef, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { FadeInView } from "./FadeInView";

interface ScreenProps {
  children: ReactNode;
  /** Extra classes for the inner content container. */
  contentClassName?: string;
  /** Disable the scroll-reset-on-focus behaviour if needed. */
  resetOnFocus?: boolean;
}

/**
 * Standard screen shell: safe-area aware, dark background, scrollable, and it
 * resets to the top every time the tab regains focus (robust replacement for
 * the old web scroll-reset hook, independent of any page's layout).
 */
export function Screen({ children, contentClassName = "", resetOnFocus = true }: ScreenProps) {
  const ref = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      if (resetOnFocus) {
        ref.current?.scrollTo({ y: 0, animated: false });
      }
    }, [resetOnFocus])
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-neutral-950">
      <ScrollView
        ref={ref}
        className="flex-1 bg-neutral-950"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FadeInView>
          <View className={`px-5 pb-28 pt-2 ${contentClassName}`}>{children}</View>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}
