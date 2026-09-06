import { TextInput, View, type TextInputProps } from "react-native";
import { type ReactNode } from "react";
import { colors } from "@/lib/colors";

interface TextFieldProps extends TextInputProps {
  icon?: ReactNode;
  className?: string;
}

export function TextField({ icon, className = "", ...props }: TextFieldProps) {
  return (
    <View
      className={`flex-row items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 ${className}`}
    >
      {icon}
      <TextInput
        placeholderTextColor={colors.textFaint}
        className="flex-1 py-3.5 text-sm text-white"
        {...props}
      />
    </View>
  );
}
