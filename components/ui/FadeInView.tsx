import { useEffect, useRef, type ReactNode } from "react";
import { Animated, type ViewStyle } from "react-native";

interface FadeInViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

/** Subtle mount fade + rise, replacing the web `animate-fade-in` utility. */
export function FadeInView({ children, style }: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
