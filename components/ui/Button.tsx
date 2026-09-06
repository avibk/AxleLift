import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import { type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  icon?: ReactNode;
  loading?: boolean;
  variant?: ButtonVariant;
  className?: string;
}

const containerByVariant: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 active:bg-brand-500",
  secondary: "bg-neutral-900 border border-neutral-800 active:bg-neutral-800",
  ghost: "bg-transparent active:bg-neutral-900",
};

const textByVariant: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-neutral-100",
  ghost: "text-neutral-300",
};

export function Button({
  label,
  icon,
  loading = false,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`h-12 flex-row items-center justify-center gap-2 rounded-2xl px-5 ${containerByVariant[variant]} ${isDisabled ? "opacity-50" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <>
          {icon}
          <Text className={`text-sm font-semibold ${textByVariant[variant]}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
