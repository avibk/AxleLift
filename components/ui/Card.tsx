import { View, type ViewProps } from "react-native";
import { type ReactNode } from "react";

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <View className={`rounded-2xl border border-neutral-800 bg-neutral-900 ${className}`} {...props}>
      {children}
    </View>
  );
}
